"""
Fast Mood Detection using Google Gemini 2.5 Flash (Free Tier)
Runs in background without affecting Cerebras rate limits.
Uses REST API directly to avoid package conflicts.
"""

import logging
import os
import json
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger("bondhu.gemini_mood")


class GeminiMoodDetector:
    """
    Uses Google Gemini 2.5 Flash for background mood detection via REST API.
    Free tier: 15 RPM, 1M TPM, 1500 RPD - separate from Cerebras quota.
    """
    
    def __init__(self):
        # Get API key from environment
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found - mood detection will use keywords only")
            self.enabled = False
        else:
            self.enabled = True
            # Gemini REST API endpoint (using gemini-2.5-flash for v1beta API)
            self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
            logger.info("✅ Gemini 2.5 Flash initialized for background mood detection (REST API)")
        
        # Ultra-short prompt for speed
        self.mood_prompt = """Analyze user's mood in ONE WORD.
Options: sad, stressed, anxious, angry, happy, lonely, motivated, neutral.
Consider: sarcasm, mixed emotions, context.
Respond with ONLY the mood word."""
    
    async def detect_mood_background(self, user_message: str, recent_messages: list = None) -> Dict[str, Any]:
        """
        Background mood detection using Gemini REST API (doesn't block main response).
        
        Args:
            user_message: Current user message
            recent_messages: Optional recent conversation context (max 2)
            
        Returns:
            Dict with mood and confidence
        """
        if not self.enabled:
            return self._keyword_fallback(user_message)
        
        try:
            # Build context (keep SHORT for speed)
            context = user_message
            if recent_messages and len(recent_messages) > 0:
                recent = recent_messages[-2:]
                context = " | ".join([m.get('message_text', '') for m in recent]) + f" | {user_message}"
            
            # Truncate if too long
            words = context.split()
            if len(words) > 100:
                context = " ".join(words[-100:])
            
            # Make Gemini REST API call
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "contents": [{
                            "parts": [{
                                "text": f"{self.mood_prompt}\n\nUser message: {context}"
                            }]
                        }],
                        "generationConfig": {
                            "temperature": 0.3,
                            "maxOutputTokens": 10,
                            "topP": 1,
                            "topK": 1
                        }
                    }
                )
            
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return self._keyword_fallback(user_message)
            
            result = response.json()
            
            # Extract mood from response
            if 'candidates' in result and len(result['candidates']) > 0:
                candidate = result['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    detected_mood = candidate['content']['parts'][0]['text'].strip().lower()
                    
                    # Validate mood
                    valid_moods = ['sad', 'stressed', 'anxious', 'angry', 'happy', 'lonely', 'motivated', 'neutral']
                    if detected_mood not in valid_moods:
                        logger.warning(f"Invalid mood from Gemini: {detected_mood}, falling back")
                        return self._keyword_fallback(user_message)
                    
                    logger.info(f"Gemini mood detected: {detected_mood}")
                    
                    return {
                        "mood": detected_mood,
                        "confidence": 0.85,
                        "method": "gemini",
                        "sentiment_score": self._mood_to_sentiment(detected_mood)
                    }
            
            # Fallback if response format unexpected
            return self._keyword_fallback(user_message)
            
        except Exception as e:
            logger.error(f"Gemini mood detection failed: {e}")
            return self._keyword_fallback(user_message)
    
    def _keyword_fallback(self, message: str) -> Dict[str, Any]:
        """Instant keyword-based detection."""
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
            "confidence": 0.6,
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
