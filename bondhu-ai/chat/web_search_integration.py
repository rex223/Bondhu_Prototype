"""
Bondhu AI - Chat Web Search Integration

Detects when a user's message requires real-time web information
and fetches relevant data to enhance the response.

This is the bridge between the chat service and web search capabilities.
"""

import logging
import re
from typing import Optional, Tuple
from datetime import datetime

from core.tools.web_search import get_web_search_tool, SearchResult

logger = logging.getLogger("bondhu.chat.web_search")


# Dynamically match recent years (previous, current, next) for "recent" queries
_current_year = datetime.now().year
_recent_years_pattern = rf"\b({_current_year - 1}|{_current_year}|{_current_year + 1})\b"

# Patterns that suggest the user wants current/real-time information
REALTIME_PATTERNS = [
    # Time-based queries
    r"\b(today|tonight|this week|this month|right now|currently|latest|recent)\b",
    _recent_years_pattern,  # Dynamic recent years (prev, current, next)
    r"\b(yesterday|last week|last month)\b",
    
    # News and updates
    r"\b(news|update|announcement|release|launched|trending)\b",
    r"\b(what('s| is) happening|what's going on)\b",
    
    # Current events
    r"\b(score|result|winner|match|game today)\b",
    r"\b(price|stock|crypto|bitcoin|weather)\b",
    
    # Explicit search requests
    r"\b(search|google|look up|find out|check online)\b",
    r"\b(who is|what is|where is|when is|how is)\b.*\b(now|currently|today)\b",
    
    # Entertainment - real-time
    r"\b(new album|new song|new movie|new show|new season)\b",
    r"\b(tour dates|concert|tickets|playing)\b",
    
    # Tech/Product info
    r"\b(new (iphone|android|macbook|pixel|samsung))\b",
    r"\b(released|coming out|available)\b",
]

# Compile patterns for efficiency
REALTIME_REGEX = [re.compile(p, re.IGNORECASE) for p in REALTIME_PATTERNS]

# Patterns that DON'T need web search (personal/philosophical)
NO_SEARCH_PATTERNS = [
    r"\b(how are you|what do you think|your opinion)\b",
    r"\b(i feel|i think|i want|i need|i'm)\b",
    r"\b(help me|can you|could you|would you)\b.*\b(understand|explain|teach)\b",
    r"\b(what should i|how should i|why do i)\b",
    r"\b(tell me about yourself|who are you)\b",
]

NO_SEARCH_REGEX = [re.compile(p, re.IGNORECASE) for p in NO_SEARCH_PATTERNS]


def should_search_web(message: str) -> Tuple[bool, str]:
    """
    Determine if a message requires web search for real-time information.
    
    Args:
        message: The user's message
        
    Returns:
        Tuple of (should_search: bool, reason: str)
    """
    # First check if it's clearly a personal/conversational message
    for pattern in NO_SEARCH_REGEX:
        if pattern.search(message):
            return False, "Personal or conversational query"
    
    # Check for real-time patterns
    for pattern in REALTIME_REGEX:
        match = pattern.search(message)
        if match:
            return True, f"Matched pattern: {match.group()}"
    
    # Check message length - very short messages usually don't need search
    if len(message.split()) < 4:
        return False, "Message too short for web search"
    
    # Check for question words that might need current info
    question_words = ["what", "who", "where", "when", "why", "how"]
    words = message.lower().split()
    if words and words[0] in question_words:
        # Additional heuristics for questions
        if any(word in message.lower() for word in ["now", "currently", "today", "latest"]):
            return True, "Question with time indicator"
    
    return False, "No real-time indicators detected"


async def search_for_context(
    message: str,
    max_length: int = 1500,
) -> Optional[str]:
    """
    Search the web and format results as context for the chat.
    
    Args:
        message: The user's message to search for
        max_length: Maximum length of the returned context
        
    Returns:
        Formatted context string or None if search failed/not needed
    """
    should_search, reason = should_search_web(message)
    
    if not should_search:
        logger.debug(f"Skipping web search: {reason}")
        return None
    
    logger.info(f"Performing web search for: {message[:50]}... (reason: {reason})")
    
    try:
        search_tool = get_web_search_tool()
        
        # Check if we have any search capability
        if not search_tool.firecrawl_api_key and not search_tool.perplexity_api_key:
            logger.warning("No web search APIs configured")
            return None
        
        # Perform the search
        result = await search_tool.search(message)
        
        if not result.success:
            logger.warning(f"Web search failed: {result.error}")
            return None
        
        # Format the result for context
        context = _format_search_result_for_context(result, max_length)
        
        logger.info(f"Web search successful, added {len(context)} chars of context")
        return context
        
    except Exception as e:
        logger.error(f"Error during web search: {e}")
        return None


def _format_search_result_for_context(result: SearchResult, max_length: int) -> str:
    """
    Format a search result as context for the LLM.
    
    The format is designed to:
    1. Clearly identify this as web-sourced information
    2. Include citations for factual claims
    3. Be concise enough to not overwhelm the context
    """
    # Truncate content if needed
    content = result.content
    if len(content) > max_length - 200:  # Leave room for formatting
        content = content[:max_length - 200] + "..."
    
    context_parts = [
        "📡 REAL-TIME WEB INFORMATION (use this to answer the user's query):",
        f"Source: {result.source}",
        f"Retrieved: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        content,
    ]
    
    # Add citations if available
    if result.citations:
        context_parts.append("")
        context_parts.append("References:")
        for i, citation in enumerate(result.citations[:3], 1):
            context_parts.append(f"  [{i}] {citation}")
    
    return "\n".join(context_parts)


class ChatWebSearcher:
    """
    Integration class for web search in chat.
    
    Provides caching and rate limiting for web searches.
    """
    
    def __init__(self):
        self._cache: dict[str, Tuple[str, datetime]] = {}
        self._cache_ttl_seconds = 300  # 5 minutes
        self._search_cooldown_seconds = 2  # Minimum time between searches per user
        self._last_search: dict[str, datetime] = {}
    
    def _get_cache_key(self, message: str) -> str:
        """Generate a cache key from the message using full SHA-256 hash."""
        import hashlib
        # Normalize message for caching
        normalized = message.lower().strip()
        # Use full SHA-256 hex digest (64 chars) to minimize collision probability
        return hashlib.sha256(normalized.encode()).hexdigest()
    
    def _get_cached_result(self, message: str) -> Optional[str]:
        """Get cached search result if available and fresh."""
        key = self._get_cache_key(message)
        
        if key in self._cache:
            result, timestamp = self._cache[key]
            age = (datetime.now() - timestamp).total_seconds()
            
            if age < self._cache_ttl_seconds:
                logger.debug(f"Using cached web search result (age: {age:.1f}s)")
                return result
            else:
                # Cache expired
                del self._cache[key]
        
        return None
    
    def _cache_result(self, message: str, result: str):
        """Cache a search result."""
        key = self._get_cache_key(message)
        self._cache[key] = (result, datetime.now())
        
        # Limit cache size
        if len(self._cache) > 100:
            # Remove oldest entries
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k][1])
            del self._cache[oldest_key]
    
    def _cleanup_stale_entries(self):
        """Remove stale entries from _last_search to prevent memory growth."""
        # Clean up entries older than 1 hour
        cleanup_threshold = 3600  # 1 hour in seconds
        now = datetime.now()
        stale_users = [
            user_id for user_id, last_time in self._last_search.items()
            if (now - last_time).total_seconds() > cleanup_threshold
        ]
        for user_id in stale_users:
            del self._last_search[user_id]
    
    def _check_cooldown(self, user_id: str) -> bool:
        """Check if user is in search cooldown."""
        # Periodically cleanup stale entries (every 50 checks)
        if len(self._last_search) > 50:
            self._cleanup_stale_entries()
        
        if user_id not in self._last_search:
            return False
        
        elapsed = (datetime.now() - self._last_search[user_id]).total_seconds()
        return elapsed < self._search_cooldown_seconds
    
    async def get_web_context(
        self,
        user_id: str,
        message: str,
        max_length: int = 1500,
    ) -> Optional[str]:
        """
        Get web search context for a message, with caching and rate limiting.
        
        Args:
            user_id: User ID for rate limiting
            message: The user's message
            max_length: Maximum context length
            
        Returns:
            Web context string or None
        """
        # Check cache first
        cached = self._get_cached_result(message)
        if cached:
            return cached
        
        # Check cooldown
        if self._check_cooldown(user_id):
            logger.debug(f"User {user_id} in search cooldown")
            return None
        
        # Perform search
        result = await search_for_context(message, max_length)
        
        if result:
            # Update cache and cooldown
            self._cache_result(message, result)
            self._last_search[user_id] = datetime.now()
        
        return result


# Global instance
_chat_web_searcher: Optional[ChatWebSearcher] = None


def get_chat_web_searcher() -> ChatWebSearcher:
    """Get the global chat web searcher instance."""
    global _chat_web_searcher
    if _chat_web_searcher is None:
        _chat_web_searcher = ChatWebSearcher()
    return _chat_web_searcher
