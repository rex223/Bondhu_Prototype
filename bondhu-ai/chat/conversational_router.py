"""
Conversational Router - Routes user queries to appropriate agents.
Enables chat to answer questions about music, videos, gaming, and recommendations.
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from enum import Enum

class QueryIntent(Enum):
    """Types of user query intents."""
    MUSIC_PREFERENCE = "music_preference"
    VIDEO_PREFERENCE = "video_preference"
    GAMING_PREFERENCE = "gaming_preference"
    PERSONALITY_INSIGHT = "personality_insight"
    RECOMMENDATION = "recommendation"
    GENERAL_CHAT = "general_chat"
    MULTI_AGENT = "multi_agent"  # Requires multiple agents

class ConversationalRouter:
    """
    Routes user queries to appropriate agents based on intent.
    Enables natural language queries about preferences and recommendations.
    """
    
    def __init__(self):
        # Intent detection patterns
        self.intent_patterns = {
            QueryIntent.MUSIC_PREFERENCE: [
                r"music.*preference",
                r"what.*music.*like",
                r"favorite.*song|artist|genre",
                r"listening.*habit",
                r"spotify",
                r"what.*listen",
            ],
            QueryIntent.VIDEO_PREFERENCE: [
                r"video.*preference",
                r"what.*watch",
                r"favorite.*video|channel|youtube",
                r"viewing.*habit",
                r"youtube",
            ],
            QueryIntent.GAMING_PREFERENCE: [
                r"gaming.*preference",
                r"what.*game.*play",
                r"favorite.*game",
                r"gaming.*habit",
                r"steam",
            ],
            QueryIntent.PERSONALITY_INSIGHT: [
                r"personality",
                r"what.*kind.*person",
                r"describe.*me",
                r"my.*trait",
                r"big.*five",
            ],
            QueryIntent.RECOMMENDATION: [
                r"recommend",
                r"suggest",
                r"what.*should.*listen|watch|play",
                r"find.*me.*music|video|game",
            ],
        }
    
    def detect_intent(self, query: str) -> Tuple[QueryIntent, float]:
        """
        Detect the intent of a user query.
        Returns (intent, confidence_score).
        """
        query_lower = query.lower()
        
        # Check each intent pattern
        intent_scores = {}
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    score += 1
            if score > 0:
                intent_scores[intent] = score / len(patterns)
        
        if not intent_scores:
            return QueryIntent.GENERAL_CHAT, 1.0
        
        # Get highest scoring intent
        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        return best_intent[0], best_intent[1]
    
    def get_required_agents(self, intent: QueryIntent) -> List[str]:
        """Get list of agents needed to answer the query."""
        agent_mapping = {
            QueryIntent.MUSIC_PREFERENCE: ["music"],
            QueryIntent.VIDEO_PREFERENCE: ["video"],
            QueryIntent.GAMING_PREFERENCE: ["gaming"],
            QueryIntent.PERSONALITY_INSIGHT: ["personality"],
            QueryIntent.RECOMMENDATION: ["music", "video", "personality"],
            QueryIntent.GENERAL_CHAT: [],
            QueryIntent.MULTI_AGENT: ["music", "video", "gaming", "personality"],
        }
        return agent_mapping.get(intent, [])
    
    def extract_query_parameters(self, query: str, intent: QueryIntent) -> Dict[str, Any]:
        """Extract specific parameters from the query."""
        params = {"original_query": query}
        
        # Extract time references
        if re.search(r"recent|lately|now", query.lower()):
            params["time_range"] = "recent"
        elif re.search(r"all.*time|ever|always", query.lower()):
            params["time_range"] = "all_time"
        
        # Extract specific requests
        if "top" in query.lower() or "favorite" in query.lower():
            params["request_type"] = "top_items"
        
        # Extract count
        count_match = re.search(r"(\d+)", query)
        if count_match:
            params["count"] = int(count_match.group(1))
        
        return params
