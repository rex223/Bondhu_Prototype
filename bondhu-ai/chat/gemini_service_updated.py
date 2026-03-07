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
from core.database.models import PersonalityTrait

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
            
            # Create system prompt
            system_prompt = self._create_system_prompt(personality_data)
            
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
    
    # ... rest of the methods remain the same ...
