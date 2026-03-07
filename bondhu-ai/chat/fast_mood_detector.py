"""
Fast Mood Detection using Cerebras LLM
Runs in parallel with main response to minimize latency.
"""

import logging
from typing import Dict, Any, Optional
from cerebras.cloud.sdk import Cerebras

logger = logging.getLogger("bondhu.mood_detector")


class FastMoodDetector:
    """
    Uses Cerebras llama3.1-8b for accurate mood detection.
    Designed for minimal latency with short prompts and low max_tokens.
    """
    
    def __init__(self, cerebras_client: Cerebras):
        self.client = cerebras_client
        
        # Ultra-short system prompt for speed
        self.mood_detection_prompt = """Analyze user's mood in ONE WORD.
Options: sad, stressed, anxious, angry, happy, lonely, motivated, neutral.
Consider: sarcasm, mixed emotions, context.
Respond with ONLY the mood word."""
    
    async def detect_mood_fast(self, user_message: str, recent_messages: list = None) -> Dict[str, Any]:
        """
        Fast mood detection using Cerebras with minimal tokens.
        
        Args:
            user_message: Current user message
            recent_messages: Optional recent conversation context (max 2 messages)
            
        Returns:
            Dict with mood and confidence
        """
        try:
            # Build context (keep it SHORT for speed)
            context = user_message
            if recent_messages and len(recent_messages) > 0:
                # Only use last 2 messages for context
                recent = recent_messages[-2:]
                context = " | ".join([m.get('message_text', '') for m in recent]) + f" | {user_message}"
            
            # Truncate if too long (keep under 100 words for speed)
            words = context.split()
            if len(words) > 100:
                context = " ".join(words[-100:])
            
            # Make fast API call with minimal tokens
            completion = self.client.chat.completions.create(
                model="llama3.1-8b",
                messages=[
                    {"role": "system", "content": self.mood_detection_prompt},
                    {"role": "user", "content": context}
                ],
                temperature=0.3,  # Lower temperature for consistent mood classification
                max_tokens=10,  # ONLY need 1 word!
                stream=False
            )
            
            detected_mood = completion.choices[0].message.content.strip().lower()
            
            # Validate mood
            valid_moods = ['sad', 'stressed', 'anxious', 'angry', 'happy', 'lonely', 'motivated', 'neutral']
            if detected_mood not in valid_moods:
                # Fallback to keyword detection if LLM returns invalid
                logger.warning(f"Invalid mood from LLM: {detected_mood}, falling back to keywords")
                return self._keyword_fallback(user_message)
            
            logger.info(f"Fast mood detected: {detected_mood}")
            
            return {
                "mood": detected_mood,
                "confidence": 0.85,  # LLM-based = higher confidence
                "method": "llm",
                "sentiment_score": self._mood_to_sentiment(detected_mood)
            }
            
        except Exception as e:
            logger.error(f"Error in fast mood detection: {e}")
            # Fallback to keyword-based
            return self._keyword_fallback(user_message)
    
    def _keyword_fallback(self, message: str) -> Dict[str, Any]:
        """Fallback keyword-based detection if LLM fails."""
        message_lower = message.lower()
        
        # Quick keyword checks
        if any(word in message_lower for word in ['sad', 'depressed', 'down', 'crying', 'tears']):
            mood = 'sad'
        elif any(word in message_lower for word in ['stressed', 'overwhelmed', 'pressure', 'busy', 'tired']):
            mood = 'stressed'
        elif any(word in message_lower for word in ['anxious', 'worried', 'nervous', 'scared', 'afraid']):
            mood = 'anxious'
        elif any(word in message_lower for word in ['angry', 'mad', 'pissed', 'furious', 'annoyed']):
            mood = 'angry'
        elif any(word in message_lower for word in ['happy', 'excited', 'great', 'awesome', 'amazing', 'love']):
            mood = 'happy'
        elif any(word in message_lower for word in ['lonely', 'alone', 'isolated', 'miss']):
            mood = 'lonely'
        elif any(word in message_lower for word in ['motivated', 'pumped', 'ready', 'let\'s go', 'determined']):
            mood = 'motivated'
        else:
            mood = 'neutral'
        
        return {
            "mood": mood,
            "confidence": 0.6,  # Lower confidence for keywords
            "method": "keyword",
            "sentiment_score": self._mood_to_sentiment(mood)
        }
    
    def _mood_to_sentiment(self, mood: str) -> float:
        """Convert mood to sentiment score (-1 to 1)."""
        mood_scores = {
            'happy': 0.8,
            'motivated': 0.7,
            'neutral': 0.0,
            'anxious': -0.4,
            'stressed': -0.5,
            'lonely': -0.6,
            'sad': -0.7,
            'angry': -0.8
        }
        return mood_scores.get(mood, 0.0)
