"""
Cerebras Chat Service for Bondhu AI
Handles personality-aware chat interactions using Cerebras Cloud SDK
"""

import logging
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta, timezone
import time
import asyncio
from collections import defaultdict, OrderedDict
from threading import Lock

from cerebras.cloud.sdk import Cerebras

from core.config import get_config
from core.database.personality_service import get_personality_service
from core.database.memory_service import get_memory_service
from core.chat.conversational_coordinator import ConversationalCoordinator
from core.chat.agent_helpers import check_agent_routing, format_agent_context
from core.chat.communication_analyzer import CommunicationProfileAnalyzer
from core.chat.mood_adapter import MoodBasedResponseAdapter
from core.chat.realtime_mirror import RealTimeResponseMirror
from core.chat.prompt_rewriter import DynamicPromptRewriter
from core.chat.fast_mood_detector import FastMoodDetector
from core.chat.gemini_mood_detector import GeminiMoodDetector
from core.chat.trait_learner import LongTermTraitLearner
from core.chat.conversation_gist import build_and_cache_gist
from core.chat.web_search_integration import get_chat_web_searcher
from core.database.models import PersonalityTrait

# Crisis Detection System
from core.services.crisis_detector import get_crisis_detector, CrisisSeverity

# Security: Prompt Injection Protection
from core.security.prompt_injection_guard import get_injection_guard, check_for_injection

# New world-class prompt system
from core.prompts import (
    BASE_PERSONA,
    get_prompt_builder,
    UserPersonality,
)
from core.prompts.language_detector import get_language_instruction
from core.prompts.profanity_handler import get_response_guidance

logger = logging.getLogger("bondhu.chat")


class TokenBucketLimiter:
    """
    Token bucket algorithm for smoother rate limiting.
    Allows burst traffic while maintaining average rate limits.
    
    Supports per-user buckets:
    - Per-minute: 30 requests / 60,000 tokens
    - Per-hour: 900 requests / 1,000,000 tokens  
    - Per-day: 14,400 requests / 1,000,000 tokens
    """
    
    def __init__(self):
        # Per-user token buckets: {user_id: {window: {tokens: int, last_refill: datetime}}}
        self.buckets = defaultdict(lambda: {
            'minute': {'tokens': 30, 'last_refill': datetime.now()},
            'hour': {'tokens': 900, 'last_refill': datetime.now()},
            'day': {'tokens': 14400, 'last_refill': datetime.now()}
        })
        self.bucket_lock = Lock()
    
    def try_consume(self, user_id: str, window: str, amount: int = 1) -> tuple[bool, str]:
        """
        Try to consume tokens from the bucket.
        
        Args:
            user_id: User identifier
            window: 'minute', 'hour', or 'day'
            amount: Number of tokens to consume
            
        Returns:
            (success: bool, message: str)
        """
        with self.bucket_lock:
            now = datetime.now()
            bucket = self.buckets[user_id][window]
            
            # Refill based on window
            if window == 'minute':
                refill_interval = timedelta(minutes=1)
                max_tokens = 30
            elif window == 'hour':
                refill_interval = timedelta(hours=1)
                max_tokens = 900
            else:  # day
                refill_interval = timedelta(days=1)
                max_tokens = 14400
            
            # Calculate refill amount
            time_passed = (now - bucket['last_refill']).total_seconds()
            refill_rate = max_tokens / refill_interval.total_seconds()
            tokens_to_add = int(time_passed * refill_rate)
            
            if tokens_to_add > 0:
                bucket['tokens'] = min(max_tokens, bucket['tokens'] + tokens_to_add)
                bucket['last_refill'] = now
            
            # Try to consume
            if bucket['tokens'] >= amount:
                bucket['tokens'] -= amount
                return True, f"Consumed {amount} tokens from {window} bucket"
            else:
                return False, f"Insufficient tokens in {window} bucket: {bucket['tokens']}/{amount}"


class RateLimiter:
    """
    High-concurrency rate limiter for Cerebras API with multi-level limits:
    - Per-minute: 30 requests / 60,000 tokens
    - Per-hour: 900 requests / 1,000,000 tokens
    - Per-day: 14,400 requests / 1,000,000 tokens
    
    Supports 20-30+ concurrent requests per user through:
    - Per-user semaphores (non-blocking, allows parallel checks)
    - Efficient data structures (OrderedDict for O(1) cleanup)
    - Thread-safe dict access
    - Optional token bucket algorithm for smoother rate limiting
    """
    
    def __init__(self, use_token_bucket: bool = False):
        # Track request timestamps per user using OrderedDict for efficient cleanup
        self.user_requests = defaultdict(lambda: OrderedDict())  # {user_id: {timestamp: None}}
        self.user_tokens = defaultdict(lambda: OrderedDict())    # {user_id: {timestamp: tokens}}
        
        # Per-user semaphores for fair concurrent access (no bottleneck for all users)
        self.user_semaphores = defaultdict(lambda: asyncio.Semaphore(100))  # 100 concurrent per user
        
        # Thread-safe dict access
        self.dict_lock = Lock()
        
        # Cleanup tracking to avoid excessive cleaning
        self.last_cleanup = datetime.now()
        
        # Optional token bucket for smoother rate limiting
        self.use_token_bucket = use_token_bucket
        self.token_bucket = TokenBucketLimiter() if use_token_bucket else None
    
    def _cleanup_old_records(self, user_id: str, now: datetime):
        """Efficiently remove expired records using OrderedDict properties."""
        one_day_ago = now - timedelta(days=1)
        
        # OrderedDict preserves insertion order, so old items are at the front
        requests_dict = self.user_requests[user_id]
        tokens_dict = self.user_tokens[user_id]
        
        # Remove old request timestamps
        while requests_dict and list(requests_dict.keys())[0] < one_day_ago:
            requests_dict.popitem(last=False)
        
        # Remove old token records
        while tokens_dict and list(tokens_dict.keys())[0] < one_day_ago:
            tokens_dict.popitem(last=False)
    
    def _count_records_in_window(self, records_dict: OrderedDict, window_start: datetime) -> int:
        """Efficiently count records within time window."""
        count = 0
        for ts in records_dict.keys():
            if ts >= window_start:
                count += 1
        return count
    
    def _sum_tokens_in_window(self, tokens_dict: OrderedDict, window_start: datetime) -> int:
        """Efficiently sum tokens within time window."""
        total = 0
        for ts, tokens in tokens_dict.items():
            if ts >= window_start:
                total += tokens
        return total
    
    async def check_limit(self, user_id: str, estimated_tokens: int = 1000) -> tuple[bool, Optional[str]]:
        """
        Check if request is within rate limits (non-blocking for concurrency).
        
        Args:
            user_id: User identifier
            estimated_tokens: Estimated tokens for this request
            
        Returns:
            (allowed: bool, message: str or None)
        """
        # Use user-specific semaphore for fair access (allows 100 concurrent checks per user)
        async with self.user_semaphores[user_id]:
            now = datetime.now()
            
            # Perform cleanup periodically (every 100 requests to avoid excessive operations)
            with self.dict_lock:
                if (now - self.last_cleanup).total_seconds() > 60:
                    self._cleanup_old_records(user_id, now)
                    self.last_cleanup = now
            
            # Check time windows for rate limits
            one_min_ago = now - timedelta(minutes=1)
            one_hour_ago = now - timedelta(hours=1)
            
            # Count requests and tokens in each window (efficient with OrderedDict)
            requests_in_min = self._count_records_in_window(self.user_requests[user_id], one_min_ago)
            tokens_in_min = self._sum_tokens_in_window(self.user_tokens[user_id], one_min_ago)
            
            requests_in_hour = self._count_records_in_window(self.user_requests[user_id], one_hour_ago)
            tokens_in_hour = self._sum_tokens_in_window(self.user_tokens[user_id], one_hour_ago)
            
            requests_in_day = len(self.user_requests[user_id])
            tokens_in_day = sum(self.user_tokens[user_id].values())
            
            # Check per-minute limit (30 requests / 60,000 tokens)
            if requests_in_min >= 30:
                return False, f"Minute limit exceeded: 30 requests/min (current: {requests_in_min})"
            
            if tokens_in_min + estimated_tokens > 60000:
                return False, f"Minute token limit exceeded: 60k/min (current: {tokens_in_min})"
            
            # Check per-hour limit (900 requests / 1,000,000 tokens)
            if requests_in_hour >= 900:
                return False, f"Hour limit exceeded: 900 requests/hour (current: {requests_in_hour})"
            
            if tokens_in_hour + estimated_tokens > 1000000:
                return False, f"Hour token limit exceeded: 1M/hour (current: {tokens_in_hour})"
            
            # Check per-day limit (14,400 requests / 1,000,000 tokens)
            if requests_in_day >= 14400:
                return False, f"Day limit exceeded: 14,400 requests/day (current: {requests_in_day})"
            
            if tokens_in_day + estimated_tokens > 1000000:
                return False, f"Day token limit exceeded: 1M/day (current: {tokens_in_day})"
            
            return True, None
    
    async def record_request(self, user_id: str, tokens_used: int):
        """Record a successful request (non-blocking)."""
        now = datetime.now()
        
        # Use thread-safe lock for dict updates only (minimal contention)
        with self.dict_lock:
            self.user_requests[user_id][now] = None
            self.user_tokens[user_id][now] = tokens_used
        
        logger.info(f"Rate limit recorded for {user_id}: {tokens_used} tokens used")
    
    def get_stats(self, user_id: str) -> Dict[str, Any]:
        """Get current rate limit stats for a user."""
        now = datetime.now()
        
        one_min_ago = now - timedelta(minutes=1)
        one_hour_ago = now - timedelta(hours=1)
        
        requests_in_min = self._count_records_in_window(self.user_requests[user_id], one_min_ago)
        requests_in_hour = self._count_records_in_window(self.user_requests[user_id], one_hour_ago)
        requests_in_day = len(self.user_requests[user_id])
        
        tokens_in_min = self._sum_tokens_in_window(self.user_tokens[user_id], one_min_ago)
        tokens_in_hour = self._sum_tokens_in_window(self.user_tokens[user_id], one_hour_ago)
        tokens_in_day = sum(self.user_tokens[user_id].values())
        
        return {
            "minute": {
                "requests": f"{requests_in_min}/30",
                "tokens": f"{tokens_in_min}/60000"
            },
            "hour": {
                "requests": f"{requests_in_hour}/900",
                "tokens": f"{tokens_in_hour}/1000000"
            },
            "day": {
                "requests": f"{requests_in_day}/14400",
                "tokens": f"{tokens_in_day}/1000000"
            }
        }


# Global rate limiter instance
_rate_limiter = RateLimiter()


class CerebrasChatService:
    """
    Service for handling chat interactions with Cerebras Cloud.
    Loads personality context and generates empathetic responses.
    Enforces comprehensive rate limiting.
    """
    
    def __init__(self):
        """Initialize Cerebras chat service with configuration."""
        try:
            self.config = get_config()
            
            # Check if API key is available
            if not self.config.cerebras.api_key:
                raise ValueError("Cerebras API key not provided. Cannot initialize CerebrasChatService.")
            
            logger.info(f"🔧 Initializing Cerebras client with model: {self.config.cerebras.model}")
            self.client = Cerebras(
                api_key=self.config.cerebras.api_key
            )
            logger.info("✅ Cerebras client created")
            
            logger.info("🔧 Loading personality service...")
            self.personality_service = get_personality_service()
            logger.info("✅ Personality service loaded")
            
            logger.info("🔧 Loading memory service...")
            self.memory_service = get_memory_service()
            logger.info("✅ Memory service loaded")
            
            # Initialize communication analyzer and mood adapter
            logger.info("🔧 Initializing communication analyzer...")
            self.communication_analyzer = CommunicationProfileAnalyzer()
            self.mood_adapter = MoodBasedResponseAdapter()
            self.realtime_mirror = RealTimeResponseMirror()
            self.prompt_rewriter = DynamicPromptRewriter()
            self.fast_mood_detector = FastMoodDetector(self.client)
            self.gemini_mood_detector = GeminiMoodDetector()
            self.trait_learner = LongTermTraitLearner()
            
            # 🆘 CRISIS DETECTION: Initialize crisis detector
            self.crisis_detector = get_crisis_detector()
            logger.info("✅ Communication tools initialized (Gemini + Long-term trait learning + Crisis Detection)")
            
            self.coordinators = {}  # Cache coordinators per user
            self.chat_rl = {}  # Cache ChatRL instances per user
            self.communication_profiles = {}  # Cache communication profiles per user
            self.trait_learning_checked = {}  # Track if trait learning already checked for user
            self.rate_limiter = _rate_limiter  # Use global rate limiter
            logger.info(f"✅ CerebrasChatService fully initialized with {self.config.cerebras.model}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize CerebrasChatService: {e}", exc_info=True)
            raise
    
    def _get_coordinator(self, user_id: str) -> ConversationalCoordinator:
        """Get or create a coordinator for the user."""
        if user_id not in self.coordinators:
            self.coordinators[user_id] = ConversationalCoordinator(user_id)
        return self.coordinators[user_id]
    
    async def _check_agent_routing(self, user_id: str, message: str) -> Optional[Dict[str, Any]]:
        """
        Check if message should be routed to specialized agents.
        
        Args:
            user_id: The user's ID
            message: The user's message
            
        Returns:
            Agent response dict if message is routed, None otherwise
        """
        try:
            coordinator = self._get_coordinator(user_id)
            agent_response = await check_agent_routing(coordinator, user_id, message)
            return agent_response
        except Exception as e:
            logger.warning(f"Error checking agent routing: {e}")
            return None
    
    def _format_agent_context(self, agent_response: Dict[str, Any]) -> str:
        """Format agent response as context for LLM."""
        return format_agent_context(agent_response)
    
    def _truncate_for_context_window(self, text: str, max_tokens: int = 7000) -> str:
        """
        Truncate text to fit within context window.
        Rough estimation: 1 token ≈ 4 characters for English text.
        """
        max_chars = max_tokens * 4
        if len(text) <= max_chars:
            return text
        
        # Truncate and add ellipsis
        return text[:max_chars-10] + "...[truncated]"
    
    def _prepare_messages_for_cerebras(self, system_prompt: str, user_message: str, 
                                     chat_history: Optional[List[Dict[str, str]]] = None) -> List[Dict[str, str]]:
        """
        Prepare messages in the format expected by Cerebras API.
        
        Args:
            system_prompt: System message content
            user_message: Current user message
            chat_history: Optional conversation history
            
        Returns:
            List of message dictionaries for Cerebras API
        """
        messages = []
        
        # Add system message
        messages.append({
            "role": "system",
            "content": self._truncate_for_context_window(system_prompt, max_tokens=2000)
        })
        
        # Add chat history if provided
        if chat_history:
            for msg in chat_history[-10:]:  # Limit to last 10 messages to manage context
                content = self._truncate_for_context_window(msg["content"], max_tokens=500)
                messages.append({
                    "role": "user" if msg["role"] == "user" else "assistant",
                    "content": content
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": self._truncate_for_context_window(user_message, max_tokens=1000)
        })
        
        return messages

    async def send_message(
        self, 
        user_id: str, 
        message: str,
        include_history: bool = False,
        session_id: Optional[str] = None,
        comprehensive_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a message and get personality-aware response.
        
        Args:
            user_id: The user's ID
            message: The user's message
            include_history: Whether to include chat history
            session_id: Optional session ID for tracking conversations
            comprehensive_context: Additional context to include in the system prompt
            
        Returns:
            Dict containing response, personality context, and metadata
        """
        try:
            logger.info(f"Processing message for user {user_id}")
            
            # ✅ CHECK RATE LIMITS (before processing)
            allowed, error_msg = await self.rate_limiter.check_limit(user_id, estimated_tokens=200)
            
            if not allowed:
                logger.warning(f"Rate limit hit for user {user_id}: {error_msg}")
                return {
                    "response": "I'm currently handling many requests. Please try again in a moment.",
                    "has_personality_context": False,
                    "personality_context": None,
                    "mood_detected": "neutral",
                    "sentiment_score": 0.5,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "model": self.config.cerebras.model,
                    "fallback_used": True,
                    "error": f"Rate limit: {error_msg}"
                }
            
            # 🛡️ SECURITY: Check for prompt injection attacks BEFORE processing
            injection_result = check_for_injection(message)
            if injection_result.should_block:
                logger.warning(
                    f"🛡️ Prompt injection blocked for user {user_id}: "
                    f"category={injection_result.category.value}, "
                    f"threat={injection_result.threat_level.value}"
                )
                return {
                    "response": injection_result.deflection_response,
                    "has_personality_context": True,
                    "personality_context": None,
                    "mood_detected": "neutral",
                    "sentiment_score": 0.5,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "model": self.config.cerebras.model,
                    "injection_blocked": True,
                    "injection_category": injection_result.category.value,
                }
            
            # Check if query needs agent routing
            agent_response = await self._check_agent_routing(user_id, message)
            
            # 🚀 PARALLEL LOADING: Load personality, history, and communication profile concurrently
            personality_task = self._load_personality_context(user_id)
            history_task = self.get_chat_history(user_id, session_id, limit=10)
            comm_profile_task = self._get_communication_profile(user_id, session_id)
            
            personality_data, recent_history, communication_profile = await asyncio.gather(
                personality_task, history_task, comm_profile_task
            )
            
            # 🚀 ZERO-LATENCY MOOD DETECTION: Use keywords (instant, no API calls)
            mood_sentiment = self.fast_mood_detector._keyword_fallback(message)
            detected_mood = mood_sentiment.get("mood", "neutral")
            sentiment_score = mood_sentiment.get("sentiment_score", 0.5)
            
            # � CRISIS DETECTION: Check for crisis signals in the message
            crisis_result = self.crisis_detector.detect_crisis(
                message=message,
                user_id=user_id,
                conversation_context=[{"sentiment_score": m.get("sentiment_score")} for m in recent_history if m.get("sentiment_score")],
                current_mood=detected_mood,
                sentiment_score=sentiment_score
            )
            
            # If crisis detected, log and potentially modify response
            if crisis_result.is_crisis:
                logger.warning(f"🆘 Crisis detected for user {user_id}: severity={crisis_result.severity.value}, score={crisis_result.severity_score:.2f}")
                
                # Log crisis event asynchronously
                asyncio.create_task(
                    self._log_crisis_event(user_id, crisis_result, session_id)
                )
                
                # For HIGH or CRITICAL severity, return crisis response immediately
                if crisis_result.severity in [CrisisSeverity.HIGH, CrisisSeverity.CRITICAL]:
                    crisis_response = self.crisis_detector.generate_crisis_response(
                        severity=crisis_result.severity,
                        user_name=None  # We could get user name here if needed
                    )
                    
                    return {
                        "response": crisis_response,
                        "has_personality_context": True,
                        "personality_context": None,
                        "mood_detected": detected_mood,
                        "sentiment_score": sentiment_score,
                        "session_id": session_id,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "model": self.config.cerebras.model,
                        "crisis_detected": True,
                        "crisis_severity": crisis_result.severity.value,
                        "crisis_resources": crisis_result.resources,
                        "intervention_type": crisis_result.recommended_intervention.value
                    }
            
            # �🎯 Start Gemini background mood detection (better accuracy, separate quota)
            asyncio.create_task(
                self._improve_mood_with_gemini(user_id, message, recent_history, session_id)
            )
            
            logger.info(f"Mood detected (instant): {detected_mood} (sentiment: {sentiment_score:.2f})")
            
            # 🆕 Create system prompt using NEW LAYERED SYSTEM
            # Passes current message for language detection and profanity handling
            system_prompt = self._create_system_prompt(
                personality_data,
                current_message=message,
                chat_history=recent_history,
                detected_mood=detected_mood,
            )
            
            # 🔄 REAL-TIME MIRRORING: Analyze THIS conversation session
            # Extract user and AI messages from current session
            user_messages_in_session = []
            ai_messages_in_session = []
            
            for msg in recent_history:
                if msg.get('sender_type') == 'user':
                    user_messages_in_session.append(msg.get('message_text', ''))
                elif msg.get('sender_type') == 'assistant':
                    ai_messages_in_session.append(msg.get('message_text', ''))
            
            # Add current message to analysis
            user_messages_in_session.append(message)
            
            # Get real-time adjustments based on THIS conversation
            realtime_adjustments = self.realtime_mirror.analyze_current_exchange(
                user_messages_in_session,
                ai_messages_in_session
            )

            gist_summary = build_and_cache_gist(
                session_id,
                user_messages_in_session,
                detected_mood,
                realtime_adjustments
            )
            
            # 🎯 DYNAMIC PROMPT REWRITING: Actually change the tone, don't just append
            if gist_summary:
                system_prompt = f"{system_prompt}\n\n🧠 Conversation gist: {gist_summary}"
            system_prompt = self.prompt_rewriter.rewrite_for_mood_and_style(
                system_prompt,
                detected_mood,
                communication_profile,
                realtime_adjustments
            )
            
            # ✅ ADD USER MEMORIES TO CONTEXT FOR REAL USERS
            user_memories_context = await self._get_user_relevant_memories(user_id, message)
            if user_memories_context:
                system_prompt = f"{system_prompt}\n\n{user_memories_context}"
            
            # 🌐 WEB SEARCH: Fetch real-time information if query needs it
            web_searcher = get_chat_web_searcher()
            web_context = await web_searcher.get_web_context(user_id, message)
            if web_context:
                system_prompt = f"{system_prompt}\n\n{web_context}"
                logger.info(f"Added web search context for user {user_id}")
            
            # Add agent insights if available
            if agent_response and not agent_response.get("requires_llm"):
                agent_context = self._format_agent_context(agent_response)
                system_prompt = f"{system_prompt}\n\n{agent_context}"
            
            # Add comprehensive context if provided
            if comprehensive_context:
                system_prompt = f"{system_prompt}\n\n{comprehensive_context}"
            
            # Get conversation history if requested
            chat_history = []
            if include_history:
                chat_history = await self.get_chat_history(user_id, session_id, limit=15)
            
            # Prepare messages for Cerebras
            messages = self._prepare_messages_for_cerebras(system_prompt, message, chat_history)
            
            # Get response from Cerebras
            logger.debug(f"Sending to Cerebras: {message[:50]}...")
            
            # Make synchronous call to Cerebras API
            completion = self.client.chat.completions.create(
                model=self.config.cerebras.model,
                messages=messages,
                temperature=self.config.cerebras.temperature,
                max_tokens=self.config.cerebras.max_tokens,
                top_p=0.9,
                stream=False
            )
            
            response_content = completion.choices[0].message.content
            
            # Convert personality context to dict for serialization
            personality_context_dict = None
            if personality_data:
                # Create a simple, JSON-serializable summary
                personality_context_dict = {
                    "user_id": personality_data.user_id,
                    "has_assessment": personality_data.has_assessment,
                    "has_llm_context": personality_data.llm_context is not None
                }
                
                # Add personality scores if available
                if personality_data.personality_profile:
                    personality_context_dict["personality_scores"] = {
                        "openness": personality_data.personality_profile.openness,
                        "conscientiousness": personality_data.personality_profile.conscientiousness,
                        "extraversion": personality_data.personality_profile.extraversion,
                        "agreeableness": personality_data.personality_profile.agreeableness,
                        "neuroticism": personality_data.personality_profile.neuroticism
                    }
            
            result = {
                "response": response_content,
                "has_personality_context": personality_data is not None,
                "personality_context": personality_context_dict,
                "mood_detected": mood_sentiment.get("mood"),
                "sentiment_score": mood_sentiment.get("sentiment_score"),
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "model": self.config.cerebras.model,
                "agent_insights": agent_response if agent_response else None,
                "usage": {
                    "prompt_tokens": completion.usage.prompt_tokens if completion.usage else None,
                    "completion_tokens": completion.usage.completion_tokens if completion.usage else None,
                    "total_tokens": completion.usage.total_tokens if completion.usage else None
                }
            }
            
            # ✅ RECORD RATE LIMIT USAGE
            total_tokens = completion.usage.total_tokens if completion.usage else 1000
            await self.rate_limiter.record_request(user_id, total_tokens)
            
            # Log rate limit stats
            stats = self.rate_limiter.get_stats(user_id)
            logger.info(f"Rate limit stats for {user_id}: {stats}")
            
            # Analyze conversation for RL learning (async, non-blocking)
            asyncio.create_task(
                self._analyze_conversation_for_rl(user_id, message, response_content, session_id)
            )
            
            # 🔄 UPDATE COMMUNICATION PROFILE IN REAL-TIME (async, non-blocking)
            asyncio.create_task(
                self._update_communication_profile_realtime(user_id, message, session_id)
            )
            
            # 🎯 CHECK FOR LONG-TERM TRAIT LEARNING (every 100 messages, async)
            asyncio.create_task(
                self._check_trait_learning(user_id)
            )
            
            logger.info(f"Response generated successfully for user {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error in send_message: {e}", exc_info=True)
            # Fallback response in case of LLM failure
            fallback_responses = [
                "I'm here to listen and support you. Tell me more about what's on your mind.",
                "Thank you for sharing that with me. How are you feeling about this situation?",
                "I appreciate you opening up to me. What would be most helpful for you right now?",
                "That sounds meaningful to you. Can you help me understand more about your experience?",
                "I'm glad you feel comfortable sharing with me. What's been weighing on your heart lately?"
            ]
            
            import random
            fallback_response = random.choice(fallback_responses)
            
            return {
                "response": fallback_response,
                "has_personality_context": False,
                "personality_context": None,
                "mood_detected": "concerned",
                "sentiment_score": 0.5,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "model": self.config.cerebras.model,
                "fallback_used": True,
                "error": str(e)
            }
    
    async def _load_personality_context(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Load personality context for the user with weighted scores.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Personality context dict or None if not available
        """
        try:
            # Load personality context with weighted scores (survey + agent adjustments)
            personality_context = await self.personality_service.get_user_personality_context(
                user_id, 
                use_weighted_scores=True
            )
            
            if personality_context and personality_context.has_assessment and personality_context.llm_context:
                logger.info(f"Personality context loaded for user {user_id} (using weighted scores)")
                return personality_context
            else:
                logger.warning(f"No personality context found for user {user_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error loading personality context: {e}")
            return None
    
    def _create_system_prompt(
        self, 
        personality_data: Optional[Any],
        current_message: str = "",
        chat_history: Optional[list] = None,
        detected_mood: str = "neutral",
    ) -> str:
        """
        Create system prompt using the new layered prompt system.
        
        Layers:
        1. BASE_PERSONA - Static identity, safety, friend behavior (from base_persona.py)
        2. USER_PERSONALITY - Big Five scores, preferences (from DB)
        3. DYNAMIC_CONTEXT - Language, profanity handling, mood, memories
        
        Args:
            personality_data: The user's personality context (PersonalityContextResponse)
            current_message: The current user message (for language/profanity detection)
            chat_history: Recent conversation history
            detected_mood: Detected mood state
            
        Returns:
            Complete layered system prompt string
        """
        prompt_parts = []
        
        # =====================================================================
        # LAYER 1: BASE PERSONA (Static - from base_persona.py)
        # =====================================================================
        prompt_parts.append(BASE_PERSONA)
        logger.debug("Added Layer 1: Base persona")
        
        # =====================================================================
        # LAYER 2: USER PERSONALITY (From DB)
        # =====================================================================
        if personality_data:
            # Extract personality scores from the PersonalityContextResponse
            old_prompt = personality_data.get_system_prompt()
            
            if old_prompt:
                # Extract useful parts from old prompt (interests, custom context)
                # But DON'T use the hardcoded Bengali/Hindi terms
                personality_section = self._extract_personality_section(old_prompt)
                if personality_section:
                    prompt_parts.append(personality_section)
                    logger.debug("Added Layer 2: User personality from DB")
            
            # Also add Big Five scores if available
            if hasattr(personality_data, 'personality_scores') and personality_data.personality_scores:
                big_five_prompt = self._format_big_five_prompt(personality_data.personality_scores)
                if big_five_prompt:
                    prompt_parts.append(big_five_prompt)
        
        # =====================================================================
        # LAYER 3: DYNAMIC CONTEXT (Runtime)
        # =====================================================================
        if current_message:
            # 3a. Language Detection (CRITICAL - fixes the English→Hindi bug)
            language_instruction = get_language_instruction(current_message)
            prompt_parts.append(language_instruction)
            logger.debug(f"Added Layer 3a: Language instruction")
            
            # 3b. Profanity Handling (CRITICAL - prevents profanity echo)
            history_dicts = None
            if chat_history:
                history_dicts = [
                    {"role": "user" if msg.get("sender_type") == "user" else "assistant",
                     "content": msg.get("message_text", "")}
                    for msg in chat_history
                ]
            
            profanity_guidance = get_response_guidance(current_message, history_dicts)
            if profanity_guidance:
                prompt_parts.append(profanity_guidance)
                logger.debug("Added Layer 3b: Profanity handling guidance")
        
        # 3c. Mood-based guidance
        if detected_mood and detected_mood != "neutral":
            from core.prompts.base_persona import get_mood_guidelines
            mood_guidance = get_mood_guidelines(detected_mood)
            prompt_parts.append(f"\n## Current Mood Context\nUser seems: {detected_mood}\n{mood_guidance}")
            logger.debug(f"Added Layer 3c: Mood guidance for {detected_mood}")
        
        final_prompt = "\n\n".join(filter(None, prompt_parts))
        logger.info(f"Created layered system prompt (length: {len(final_prompt)} chars)")
        
        return final_prompt
    
    def _extract_personality_section(self, old_prompt: str) -> Optional[str]:
        """
        Extract useful personality info from old prompts without hardcoded language terms.
        
        Filters out problematic patterns like:
        - Hardcoded বন্ধু, दोस्त, etc.
        - Old "DIGITAL TWIN MODE" sections (we have better now)
        - Generic filler text
        """
        if not old_prompt:
            return None
        
        # Skip if it's mostly just the old template
        if "DIGITAL TWIN MODE" in old_prompt and len(old_prompt) < 2000:
            return None
        
        # Import re at method start - needed for both interests and personality trait extraction
        import re
        
        # Look for personality-specific sections
        useful_sections = []
        
        # Extract interests if mentioned
        if "interests" in old_prompt.lower() or "hobbies" in old_prompt.lower():
            # Find sentences about interests
            interest_pattern = r"(?:interests?|hobbies|likes|enjoys?)[:\s]+([^.]+\.)"
            matches = re.findall(interest_pattern, old_prompt, re.IGNORECASE)
            if matches:
                useful_sections.append("## User Interests")
                useful_sections.extend(matches[:3])  # Limit to 3 interest mentions
        
        # Extract Big Five interpretations if present
        if any(trait in old_prompt.lower() for trait in ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]):
            useful_sections.append("\n## Personality Notes from Onboarding")
            # Extract sentences containing personality traits
            for trait in ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]:
                trait_pattern = rf"[^.]*{trait}[^.]*\."
                matches = re.findall(trait_pattern, old_prompt, re.IGNORECASE)
                if matches:
                    # Filter out generic template text
                    for match in matches[:1]:
                        if len(match) < 200 and "বন্ধু" not in match and "दोस्त" not in match:
                            useful_sections.append(f"- {match.strip()}")
        
        if len(useful_sections) > 1:
            return "\n".join(useful_sections)
        
        return None
    
    def _format_big_five_prompt(self, scores: dict) -> Optional[str]:
        """Format Big Five personality scores as prompt guidance."""
        if not scores:
            return None
        
        parts = ["## Personality-Based Communication Style"]
        
        openness = scores.get("openness", 50)
        conscientiousness = scores.get("conscientiousness", 50)
        extraversion = scores.get("extraversion", 50)
        agreeableness = scores.get("agreeableness", 50)
        neuroticism = scores.get("neuroticism", 50)
        
        if extraversion > 70:
            parts.append("- High extraversion: Match their high energy, be enthusiastic")
        elif extraversion < 30:
            parts.append("- Introverted: Keep energy calm, don't overwhelm")
        
        if openness > 70:
            parts.append("- High openness: Can explore creative/abstract topics")
        elif openness < 30:
            parts.append("- Practical: Stick to concrete, actionable topics")
        
        if conscientiousness > 70:
            parts.append("- Highly organized: Be structured, detail-oriented in responses")
        elif conscientiousness < 30:
            parts.append("- Flexible personality: Keep it casual, don't overload with details")
        
        if neuroticism > 70:
            parts.append("- Emotionally sensitive: Extra supportive, validate feelings")
        elif neuroticism < 30:
            parts.append("- Emotionally stable: Can be more direct")
        
        if agreeableness < 30:
            parts.append("- Direct personality: Can handle blunt feedback")
        
        if len(parts) > 1:
            return "\n".join(parts)
        
        return None
    
    async def _get_user_relevant_memories(self, user_id: str, current_message: str, max_memories: int = 3) -> str:
        """
        Retrieve relevant user memories related to the current message.
        Special handling for "about me" queries - returns ALL high-priority memories.
        
        Args:
            user_id: The user's ID
            current_message: Current message to find related memories
            max_memories: Maximum memories to retrieve (ignored for "about me" queries)
            
        Returns:
            Formatted string of relevant memories or empty string
        """
        try:
            # Get all user memories (sync method, no await needed)
            memories = self.memory_service.get_memories(user_id)
            
            if not memories:
                return ""
            
            # Handle list format (from database)
            if isinstance(memories, list):
                # Convert list to dict format
                memories_dict = {}
                for mem in memories:
                    if isinstance(mem, dict):
                        key = mem.get('key', '')
                        if key:
                            memories_dict[key] = mem
                memories = memories_dict
            
            message_lower = current_message.lower()
            
            # ✅ SPECIAL CASE: "What do you know about me" or similar queries
            about_me_keywords = ["what do you know about me", "tell me about myself", "what do you know", 
                                "who am i", "about me", "my profile", "my information", "about myself"]
            
            is_about_me_query = any(keyword in message_lower for keyword in about_me_keywords)
            
            if is_about_me_query:
                # Return ALL high and medium priority memories for "about me" queries
                relevant_memories = []
                
                for memory_key, memory_data in memories.items():
                    importance = memory_data.get('importance', 'low')
                    # Include high and medium priority memories
                    if importance in ['high', 'medium']:
                        relevant_memories.append({
                            'key': memory_key,
                            'value': memory_data.get('value', ''),
                            'category': memory_data.get('category', ''),
                            'importance': importance
                        })
                
                logger.info(f"🎯 'About me' query detected - returning {len(relevant_memories)} high/medium priority memories")
                
            else:
                # Standard behavior: filter for relevant memories based on message keywords
                relevant_memories = []
                
                for memory_key, memory_data in memories.items():
                    memory_value = str(memory_data.get('value', '')).lower()
                    
                    # Check if memory is relevant to current message
                    # Simple heuristic: check if key or value has common words with message
                    keywords = [word for word in message_lower.split() if len(word) > 3]
                    
                    if any(keyword in memory_value or keyword in memory_key.lower() for keyword in keywords):
                        relevant_memories.append({
                            'key': memory_key,
                            'value': memory_data.get('value', ''),
                            'category': memory_data.get('category', ''),
                            'importance': memory_data.get('importance', 'low')
                        })
                
                # Sort by importance and limit
                importance_order = {'high': 0, 'medium': 1, 'low': 2}
                relevant_memories.sort(key=lambda x: importance_order.get(x['importance'], 3))
                relevant_memories = relevant_memories[:max_memories]
            
            if not relevant_memories:
                return ""
            
            # Format memories for inclusion in prompt
            memory_context = "User's Stored Information:\n"
            
            # Group by importance for "about me" queries
            if is_about_me_query:
                # Group by importance
                high_priority = [m for m in relevant_memories if m['importance'] == 'high']
                medium_priority = [m for m in relevant_memories if m['importance'] == 'medium']
                
                if high_priority:
                    memory_context += "📌 Key Information:\n"
                    for mem in high_priority:
                        memory_context += f"  - {mem['key'].replace('_', ' ').title()}: {mem['value']}\n"
                
                if medium_priority:
                    memory_context += "ℹ️ Additional Information:\n"
                    for mem in medium_priority:
                        memory_context += f"  - {mem['key'].replace('_', ' ').title()}: {mem['value']}\n"
            else:
                # Standard format for topic-specific queries
                for mem in relevant_memories:
                    memory_context += f"- {mem['key'].replace('_', ' ')}: {mem['value']}\n"
            
            logger.info(f"Retrieved {len(relevant_memories)} memories for user {user_id}")
            return memory_context
            
        except Exception as e:
            logger.error(f"Error retrieving user memories: {e}")
            return ""
    
    async def _analyze_mood_sentiment(self, message: str) -> Dict[str, Any]:
        """
        Analyze mood and sentiment from user message using simple heuristics.
        
        Args:
            message: User's message text
            
        Returns:
            Dict with mood and sentiment_score
        """
        # Simple keyword-based mood detection
        message_lower = message.lower()
        
        # Mood keywords
        positive_moods = {
            "happy": ["happy", "joy", "excited", "great", "wonderful", "amazing", "fantastic", "good", "better"],
            "grateful": ["thank", "grateful", "appreciate", "blessed"],
            "calm": ["calm", "peaceful", "relaxed", "content", "serene"],
            "motivated": ["motivated", "energized", "inspired", "determined"]
        }
        
        negative_moods = {
            "sad": ["sad", "down", "unhappy", "depressed", "blue", "miserable"],
            "anxious": ["anxious", "worried", "nervous", "stressed", "panic", "overwhelmed"],
            "angry": ["angry", "mad", "frustrated", "annoyed", "irritated", "furious"],
            "lonely": ["lonely", "alone", "isolated", "abandoned"],
            "tired": ["tired", "exhausted", "drained", "weary", "fatigue"]
        }
        
        # Check for moods
        detected_mood = "neutral"
        sentiment_score = 0.5  # neutral baseline
        
        for mood, keywords in positive_moods.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_mood = mood
                sentiment_score = 0.7 + (len([k for k in keywords if k in message_lower]) * 0.05)
                break
        
        if detected_mood == "neutral":
            for mood, keywords in negative_moods.items():
                if any(keyword in message_lower for keyword in keywords):
                    detected_mood = mood
                    sentiment_score = 0.3 - (len([k for k in keywords if k in message_lower]) * 0.05)
                    break
        
        # Clamp sentiment score between 0 and 1
        sentiment_score = max(0.0, min(1.0, sentiment_score))
        
        logger.debug(f"Detected mood: {detected_mood}, sentiment: {sentiment_score:.2f}")
        
        return {
            "mood": detected_mood,
            "sentiment_score": round(sentiment_score, 2)
        }
    
    async def get_chat_history(
        self, 
        user_id: str, 
        session_id: Optional[str] = None,
        limit: int = 20
    ) -> list[Dict[str, Any]]:
        """
        Get recent chat history for a user, optionally filtered by session.
        
        Args:
            user_id: The user's ID
            session_id: Optional session ID to filter messages
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of chat messages
        """
        try:
            from core.database.supabase_client import get_supabase_client
            supabase_client = get_supabase_client()
            
            # Build query with user filter
            query = supabase_client.supabase.table("chat_messages").select(
                "sender_type", "message_text", "timestamp"
            ).eq("user_id", user_id)
            
            # Filter by session if provided
            if session_id:
                query = query.eq("session_id", session_id)
            
            # Order by timestamp and limit results
            response = query.order("timestamp", desc=True).limit(limit).execute()
            
            # Convert to the format expected by the service
            history = []
            for msg in reversed(response.data):  # Reverse to get chronological order
                history.append({
                    "role": msg["sender_type"],
                    "content": msg["message_text"]
                })
            
            logger.info(f"Retrieved {len(history)} chat history messages for user {user_id}" + 
                       (f" (session: {session_id})" if session_id else ""))
            return history
            
        except Exception as e:
            logger.error(f"Error retrieving chat history for user {user_id}: {e}")
            return []
    
    async def _analyze_conversation_for_rl(
        self,
        user_id: str,
        user_message: str,
        ai_response: str,
        session_id: Optional[str] = None
    ) -> None:
        """Analyze conversation and trigger RL learning."""
        try:
            chat_history = await self.get_chat_history(user_id, session_id, limit=15)
            
            if len(chat_history) < 5:
                return
            
            user_messages = [m['content'] for m in chat_history if m['role'] == 'user']
            topics = self._extract_topics_from_messages(user_messages)
            emotions = self._extract_emotions_from_messages(user_messages)
            
            conversation_data = {
                'topics': topics,
                'emotions': emotions,
                'user_messages': user_messages,
                'ai_messages': [m['content'] for m in chat_history if m['role'] == 'ai'],
                'message_count': len(user_messages)
            }
            
            personality_context = await self._load_personality_context(user_id)
            if not personality_context or not personality_context.personality_profile:
                return
            
            if user_id not in self.chat_rl:
                from core.rl.chat_recommendation_rl import ChatRecommendationRL
                self.chat_rl[user_id] = ChatRecommendationRL(user_id)
            
            result = await self.chat_rl[user_id].process_conversation_feedback(
                conversation_data,
                {
                    PersonalityTrait.OPENNESS: personality_context.personality_profile.openness,
                    PersonalityTrait.CONSCIENTIOUSNESS: personality_context.personality_profile.conscientiousness,
                    PersonalityTrait.EXTRAVERSION: personality_context.personality_profile.extraversion,
                    PersonalityTrait.AGREEABLENESS: personality_context.personality_profile.agreeableness,
                    PersonalityTrait.NEUROTICISM: personality_context.personality_profile.neuroticism
                }
            )
            
            if result.get('processed'):
                logger.info(f"Chat RL: {result.get('adjustments')}")
        
        except Exception as e:
            logger.error(f"Error in chat RL: {e}")
    
    async def _log_crisis_event(
        self,
        user_id: str,
        crisis_result,
        session_id: Optional[str] = None
    ) -> None:
        """
        Log a crisis event to the database for tracking and follow-up.
        
        Args:
            user_id: The user's ID
            crisis_result: CrisisDetectionResult from crisis detector
            session_id: Optional session ID
        """
        try:
            from core.database.supabase_client import get_supabase_client
            supabase = get_supabase_client()
            
            # Log to database via RPC
            response = supabase.supabase.rpc(
                "log_crisis_event",
                {
                    "p_user_id": user_id,
                    "p_trigger_type": "chat_message",
                    "p_trigger_source": "chat",
                    "p_trigger_message_id": None,  # Could be added if we have message ID
                    "p_severity": crisis_result.severity.value,
                    "p_severity_score": float(crisis_result.severity_score),
                    "p_detected_signals": crisis_result.detected_signals,
                    "p_intervention_type": crisis_result.recommended_intervention.value,
                    "p_resources_provided": crisis_result.resources
                }
            ).execute()
            
            event_id = response.data
            logger.info(f"Crisis event logged: {event_id} for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error logging crisis event: {e}")
    
    def _extract_topics_from_messages(self, messages: List[str]) -> List[str]:
        topics = set()
        all_text = ' '.join(messages).lower()
        
        topic_keywords = {
            'work': ['work', 'job', 'career', 'office', 'boss'],
            'relationships': ['relationship', 'friend', 'family', 'partner'],
            'anxiety': ['anxious', 'worried', 'stress', 'nervous'],
            'goals': ['goal', 'plan', 'achieve'],
            'health': ['health', 'exercise', 'sleep', 'tired'],
            'learning': ['learn', 'study', 'book', 'course'],
            'creativity': ['creative', 'art', 'music', 'idea'],
            'social': ['social', 'party', 'people', 'meet']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in all_text for keyword in keywords):
                topics.add(topic)
        
        return list(topics)
    
    def _extract_emotions_from_messages(self, messages: List[str]) -> List[str]:
        emotions = set()
        all_text = ' '.join(messages).lower()
        
        emotion_keywords = {
            'anxious': ['anxious', 'anxiety', 'worried', 'nervous'],
            'stressed': ['stressed', 'stress', 'overwhelmed'],
            'sad': ['sad', 'down', 'depressed', 'unhappy'],
            'happy': ['happy', 'joy', 'excited', 'great'],
            'angry': ['angry', 'mad', 'frustrated'],
            'calm': ['calm', 'peaceful', 'relaxed'],
            'grateful': ['grateful', 'thankful', 'appreciate']
        }
        
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in all_text for keyword in keywords):
                emotions.add(emotion)
        
        return list(emotions)
    
    async def _get_communication_profile(self, user_id: str, session_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get or build communication profile for user.
        Analyzes their actual messages to create linguistic fingerprint.
        
        Args:
            user_id: User's ID
            session_id: Optional session ID
            
        Returns:
            Communication profile dict or None
        """
        try:
            # Check memory cache first
            if user_id in self.communication_profiles:
                profile = self.communication_profiles[user_id]
                confidence = profile.get('analysis_metadata', {}).get('confidence', 0)
                
                # Return if recent and high confidence
                if confidence >= 0.7:
                    return profile
            
            # Try to load from database
            from core.database.supabase_client import get_supabase_client
            db_client = get_supabase_client()
            stored_profile = await db_client.get_communication_profile(user_id)
            
            if stored_profile and stored_profile.get('analysis_metadata', {}).get('confidence', 0) >= 0.6:
                # Use stored profile
                self.communication_profiles[user_id] = stored_profile
                logger.info(f"Loaded communication profile from database for {user_id}")
                return stored_profile
            
            # Build fresh profile from message history
            chat_history = await self.get_chat_history(user_id, session_id, limit=50)
            user_messages = [msg['content'] for msg in chat_history if msg['role'] == 'user']
            
            if len(user_messages) < 5:
                logger.info(f"Insufficient messages ({len(user_messages)}) for communication profile")
                return None
            
            # Analyze messages
            profile = self.communication_analyzer.analyze_messages(user_messages)
            
            # Save to cache
            self.communication_profiles[user_id] = profile
            
            # Save to database (async, non-blocking)
            if profile.get('analysis_metadata', {}).get('confidence', 0) >= 0.6:
                asyncio.create_task(db_client.save_communication_profile(user_id, profile))
            
            logger.info(f"Built communication profile for {user_id}: "
                       f"slang={profile['slang']['usage_frequency']}, "
                       f"formality={profile['formality']['level']}, "
                       f"confidence={profile['analysis_metadata']['confidence']:.2f}")
            
            return profile
            
        except Exception as e:
            logger.error(f"Error building communication profile: {e}")
            return None
    
    async def _update_communication_profile_realtime(
        self, 
        user_id: str, 
        new_message: str,
        session_id: Optional[str]
    ):
        """
        Update communication profile in real-time as user sends messages.
        Incrementally adjusts profile based on current conversation.
        
        Args:
            user_id: User ID
            new_message: Latest message from user
            session_id: Current session ID
        """
        try:
            # Get current profile from cache
            current_profile = self.communication_profiles.get(user_id)
            
            if not current_profile:
                logger.debug(f"No cached profile for {user_id} - skipping realtime update")
                return
            
            # Quick analysis of new message
            slang_count = sum(1 for word in ['lowkey', 'fr', 'bro', 'yaar', 'ngl', 'tbh'] 
                            if word in new_message.lower())
            emoji_count = len([c for c in new_message if ord(c) > 127000])
            message_length = len(new_message)
            
            # Update slang frequency (exponential moving average)
            current_slang_freq = float(current_profile['slang']['usage_frequency'])
            new_slang_freq = slang_count / max(len(new_message.split()), 1)
            updated_slang_freq = 0.7 * current_slang_freq + 0.3 * new_slang_freq  # Weight toward current
            current_profile['slang']['usage_frequency'] = updated_slang_freq
            
            # Update emoji frequency
            current_emoji_freq = float(current_profile['emoji']['usage_frequency'])
            new_emoji_freq = emoji_count / max(len(new_message), 1)
            updated_emoji_freq = 0.7 * current_emoji_freq + 0.3 * new_emoji_freq
            current_profile['emoji']['usage_frequency'] = updated_emoji_freq
            
            # Update average message length
            current_avg_length = float(current_profile['message_style']['average_length'])
            updated_avg_length = 0.8 * current_avg_length + 0.2 * message_length
            current_profile['message_style']['average_length'] = updated_avg_length
            
            # Update length category
            if updated_avg_length < 30:
                current_profile['message_style']['length_category'] = 'brief'
            elif updated_avg_length < 100:
                current_profile['message_style']['length_category'] = 'medium'
            else:
                current_profile['message_style']['length_category'] = 'verbose'
            
            # Update cache
            self.communication_profiles[user_id] = current_profile
            
            # Save to database every 5 messages (check confidence)
            messages_analyzed = current_profile.get('analysis_metadata', {}).get('messages_analyzed', 0)
            if messages_analyzed % 5 == 0 and current_profile.get('analysis_metadata', {}).get('confidence', 0) >= 0.6:
                from core.database.supabase_client import get_supabase_client
                db_client = get_supabase_client()
                asyncio.create_task(db_client.save_communication_profile(user_id, current_profile))
                logger.debug(f"Updated communication profile for {user_id} in database")
            
        except Exception as e:
            logger.error(f"Error updating communication profile in real-time: {e}")
    
    async def _improve_mood_with_gemini(
        self,
        user_id: str,
        message: str,
        recent_history: list,
        session_id: Optional[str]
    ):
        """
        Run Gemini mood detection in background (separate API quota).
        Non-blocking - doesn't affect Cerebras rate limits or response latency.
        
        Uses Google Gemini 2.5 Flash (free tier: 15 RPM, 1M TPM, 1500 RPD).
        """
        try:
            # Run Gemini mood detection (more accurate than keywords)
            gemini_mood = await self.gemini_mood_detector.detect_mood_background(message, recent_history)
            
            # Store for future pattern learning
            logger.debug(f"Background Gemini mood for user {user_id}: {gemini_mood.get('mood')} "
                        f"(confidence: {gemini_mood.get('confidence'):.2f}, method: {gemini_mood.get('method')})")
            
            # TODO: Compare with keyword mood to improve keyword patterns
            # If keyword != gemini → learn the pattern for better keyword detection
            
        except Exception as e:
            logger.error(f"Error in background Gemini mood detection: {e}")
    
    async def _check_trait_learning(self, user_id: str):
        """
        Check if user is ready for long-term trait learning (15+ days).
        Updates stored system prompt with permanent traits.
        Runs only once per user session (cached).
        """
        try:
            # Skip if already checked in this session
            if user_id in self.trait_learning_checked:
                return
            
            # Mark as checked
            self.trait_learning_checked[user_id] = True
            
            from core.database.supabase_client import get_supabase_client
            db_client = get_supabase_client()
            
            # Check if user is eligible for trait learning
            should_learn = await self.trait_learner.should_run_learning(user_id, db_client)
            
            if not should_learn:
                logger.debug(f"User {user_id} not yet eligible for trait learning")
                return
            
            logger.info(f"🎯 Running long-term trait learning for user {user_id}")
            
            # Detect permanent traits
            permanent_traits = await self.trait_learner.detect_permanent_traits(
                user_id,
                db_client,
                self.communication_analyzer
            )
            
            if not permanent_traits:
                logger.info(f"No significant permanent traits detected for user {user_id}")
                return
            
            # Update system prompt in database
            success = await self.trait_learner.update_system_prompt_with_traits(
                user_id,
                permanent_traits,
                db_client
            )
            
            if success:
                logger.info(f"✅ Updated system prompt with {len(permanent_traits)} permanent traits for user {user_id}")
            else:
                logger.warning(f"Failed to update system prompt for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error in trait learning check: {e}")


# Singleton instance
_chat_service: Optional[CerebrasChatService] = None


def get_chat_service() -> CerebrasChatService:
    """Get or create the singleton chat service instance.
    
    Uses Cerebras LLM (configured model) for all chat operations.
    Supports tool calling with llama-3.3-70b.
    
    Returns:
        CerebrasChatService instance
        
    Raises:
        RuntimeError: If Cerebras service cannot be initialized
    """
    global _chat_service
    if _chat_service is None:
        try:
            logger.info("🚀 Initializing Cerebras chat service...")
            _chat_service = CerebrasChatService()
            logger.info(f"✅ Chat service is ready (Cerebras {_chat_service.config.cerebras.model})")
        except Exception as e:
            logger.critical(f"❌ CRITICAL: Cannot initialize Cerebras chat service: {e}", exc_info=True)
            raise RuntimeError(f"Failed to initialize chat service: {e}")
    
    return _chat_service