"""
Gemini Chat Service for Bondhu AI
Handles personality-aware chat interactions using Google Gemini Pro
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import time
import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from core.config import get_config
from core.database.personality_service import get_personality_service
from core.chat.conversational_coordinator import ConversationalCoordinator
from core.chat.agent_helpers import check_agent_routing, format_agent_context
from core.database.models import PersonalityTrait

# New world-class prompt system
from core.prompts import BASE_PERSONA
from core.prompts.language_detector import get_language_instruction
from core.prompts.profanity_handler import get_response_guidance

logger = logging.getLogger("bondhu.chat")


class GeminiChatService:
    """
    Service for handling chat interactions with Google Gemini Pro.
    Loads personality context and generates empathetic responses.
    """
    
    # Rate limiting - track last request time per user
    _user_last_request = {}
    _rate_limit_delay = 1.0  # 1 second minimum between requests per user
    
    def __init__(self):
        """Initialize Gemini chat service with configuration."""
        self.config = get_config()
        self.llm = ChatGoogleGenerativeAI(
            model=self.config.gemini.model,
            temperature=self.config.gemini.temperature,
            google_api_key=self.config.gemini.api_key
        )
        self.personality_service = get_personality_service()
        self.coordinators = {}  # Cache coordinators per user
        self.chat_rl = {}  # Cache ChatRL instances per user
        logger.info("GeminiChatService initialized")
    
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
            
            # Rate limiting check
            current_time = time.time()
            last_request_time = self._user_last_request.get(user_id, 0)
            time_since_last_request = current_time - last_request_time
            
            if time_since_last_request < self._rate_limit_delay:
                wait_time = self._rate_limit_delay - time_since_last_request
                logger.warning(f"Rate limit exceeded for user {user_id}. Waiting {wait_time:.2f} seconds.")
                time.sleep(wait_time)
            
            # Update last request time
            self._user_last_request[user_id] = time.time()
            
            # Check if query needs agent routing
            agent_response = await self._check_agent_routing(user_id, message)
            
            # Load personality context
            personality_data = await self._load_personality_context(user_id)
            
            # Analyze user message for mood and sentiment
            mood_sentiment = await self._analyze_mood_sentiment(message)
            detected_mood = mood_sentiment.get("mood", "neutral")
            
            # Get chat history for context
            chat_history = []
            if include_history:
                chat_history = await self.get_chat_history(user_id, session_id, limit=15)
            
            # 🆕 Create system prompt using NEW LAYERED SYSTEM
            system_prompt = self._create_system_prompt(
                personality_data,
                current_message=message,
                chat_history=chat_history,
                detected_mood=detected_mood,
            )
            
            # Add agent insights if available
            if agent_response and not agent_response.get("requires_llm"):
                agent_context = self._format_agent_context(agent_response)
                system_prompt = f"{system_prompt}\n\n{agent_context}"
            
            # Add comprehensive context if provided
            if comprehensive_context:
                system_prompt = f"{system_prompt}\n\n{comprehensive_context}"
            
            # Build messages with conversation history if requested
            messages = [SystemMessage(content=system_prompt)]
            
            # Include conversation history if requested
            if include_history:
                chat_history = await self.get_chat_history(user_id, session_id, limit=15)
                # Use summarization for efficient context management
                summarized_context = self.summarize_conversation_context(chat_history)
                
                # Add summarized context as a system message
                if summarized_context:
                    messages.append(SystemMessage(content=f"Previous conversation context:\n{summarized_context}"))
            
            # Add the current user message
            messages.append(HumanMessage(content=message))
            
            # Get response from Gemini
            logger.debug(f"Sending to Gemini: {message[:50]}...")
            response = await self.llm.ainvoke(messages)
            
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
                "response": response.content,
                "has_personality_context": personality_data is not None,
                "personality_context": personality_context_dict,
                "mood_detected": mood_sentiment.get("mood"),
                "sentiment_score": mood_sentiment.get("sentiment_score"),
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "model": self.config.gemini.model,
                "agent_insights": agent_response if agent_response else None
            }
            
            # Analyze conversation for RL learning (async, non-blocking)
            asyncio.create_task(
                self._analyze_conversation_for_rl(user_id, message, response.content, session_id)
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
                "model": self.config.gemini.model,
                "fallback_used": True,
                "error": str(e)
            }
    
    async def summarize_conversation_context(self, chat_history: list) -> str:
        """
        Summarize conversation history for efficient context management.
        
        Args:
            chat_history: List of previous conversation messages
            
        Returns:
            Summarized context string
        """
        if not chat_history:
            return ""
        
        try:
            # For very long conversations, create a summary
            if len(chat_history) > 6:  # More than 3 message pairs
                # Extract key points from recent messages
                recent_messages = chat_history[-6:]  # Last 3 pairs
                older_messages = chat_history[:-6]
                
                # Create a brief summary of older context
                summary_prompt = [
                    SystemMessage(content="You are an AI assistant that summarizes conversations concisely."),
                    HumanMessage(content=f"Summarize these previous conversation points in one short sentence: " +
                                       " ".join([f"{msg['role']}: {msg['content']}" for msg in older_messages[:10]]))
                ]
                
                try:
                    summary_response = await self.llm.ainvoke(summary_prompt)
                    older_summary = summary_response.content[:200]  # Limit summary length
                except Exception:
                    # Fallback to simple concatenation
                    older_summary = "Previous conversation about " + \
                                  ", ".join(set([msg['content'][:20] for msg in older_messages[:5]]))
                
                # Combine summary with recent messages
                context_parts = [f"Previous context: {older_summary}"]
                for msg in recent_messages:
                    context_parts.append(f"{msg['role']}: {msg['content']}")
                
                return "\n".join(context_parts)
            else:
                # For shorter conversations, include all messages
                return "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
                
        except Exception as e:
            logger.warning(f"Error summarizing conversation context: {e}")
            # Fallback to including recent messages only
            recent_messages = chat_history[-6:] if len(chat_history) > 6 else chat_history
            return "\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages])
    
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
        
        Args:
            personality_data: The user's personality context (PersonalityContextResponse)
            current_message: The current user message (for language/profanity detection)
            chat_history: Recent conversation history
            detected_mood: Detected mood state
            
        Returns:
            Complete layered system prompt string
        """
        prompt_parts = []
        
        # Layer 1: Base Persona
        prompt_parts.append(BASE_PERSONA)
        
        # Layer 2: User Personality (from DB)
        if personality_data:
            old_prompt = personality_data.get_system_prompt()
            if old_prompt and "DIGITAL TWIN" not in old_prompt:
                # Only use if it contains useful personalization
                if len(old_prompt) > 500:
                    # Extract personality-relevant parts only
                    prompt_parts.append(f"\n## User-Specific Context\n{old_prompt[:1000]}")
        
        # Layer 3: Dynamic Context (runtime)
        if current_message:
            # 3a. Language Detection
            language_instruction = get_language_instruction(current_message)
            prompt_parts.append(language_instruction)
            
            # 3b. Profanity Handling
            history_dicts = None
            if chat_history:
                history_dicts = [
                    {"role": msg.get("sender_type", msg.get("role", "user")), 
                     "content": msg.get("message_text", msg.get("content", ""))}
                    for msg in chat_history
                ]
            
            profanity_guidance = get_response_guidance(current_message, history_dicts)
            if profanity_guidance:
                prompt_parts.append(profanity_guidance)
        
        # 3c. Mood guidance
        if detected_mood and detected_mood != "neutral":
            from core.prompts.base_persona import get_mood_guidelines
            mood_guidance = get_mood_guidelines(detected_mood)
            prompt_parts.append(f"\n## Mood Context\nUser seems: {detected_mood}\n{mood_guidance}")
        
        return "\n\n".join(filter(None, prompt_parts))
    
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
            
            # Convert to the format expected by Langchain
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


# Singleton instance
_chat_service: Optional[GeminiChatService] = None


def get_chat_service() -> GeminiChatService:
    """Get or create the singleton chat service instance."""
    global _chat_service
    if _chat_service is None:
        _chat_service = GeminiChatService()
    return _chat_service
