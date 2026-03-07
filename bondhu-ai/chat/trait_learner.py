"""
Long-Term Trait Learning System
Detects permanent communication patterns and updates stored system prompts.
Runs after 15+ days of conversation history.
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from collections import Counter

logger = logging.getLogger("bondhu.trait_learner")


class LongTermTraitLearner:
    """
    Learns permanent user traits from 15+ days of conversations.
    Updates stored system prompts with discovered permanent patterns.
    """
    
    # Minimum days of conversation before learning permanent traits
    MIN_DAYS_FOR_LEARNING = 15
    MIN_MESSAGES_FOR_TRAIT = 50  # Need 50+ messages to confirm a trait
    CONFIDENCE_THRESHOLD = 0.75  # 75% consistency = permanent trait
    
    def __init__(self):
        self.permanent_traits = {
            'communication_style': [
                'sarcastic', 'humorous', 'serious', 'playful', 
                'philosophical', 'practical', 'emotional', 'analytical'
            ],
            'conversation_preferences': [
                'brief_responses', 'detailed_responses', 
                'uses_emojis', 'avoids_emojis',
                'casual_language', 'formal_language'
            ],
            'recurring_moods': [
                'generally_optimistic', 'generally_anxious', 
                'mood_stable', 'mood_variable'
            ]
        }
    
    async def should_run_learning(
        self, 
        user_id: str, 
        supabase_client
    ) -> bool:
        """
        Check if user has enough conversation history to learn permanent traits.
        
        Args:
            user_id: User's UUID
            supabase_client: Supabase client instance
            
        Returns:
            True if ready for trait learning
        """
        try:
            # Get user's first message timestamp
            response = supabase_client.supabase.table('chat_messages').select(
                'timestamp'
            ).eq('user_id', user_id).eq('sender_type', 'user').order(
                'timestamp', desc=False
            ).limit(1).execute()
            
            if not response.data:
                return False
            
            first_message = datetime.fromisoformat(response.data[0]['timestamp'].replace('Z', '+00:00'))
            days_active = (datetime.now(first_message.tzinfo) - first_message).days
            
            # Count total user messages
            count_response = supabase_client.supabase.table('chat_messages').select(
                'id', count='exact'
            ).eq('user_id', user_id).eq('sender_type', 'user').execute()
            
            message_count = count_response.count or 0
            
            logger.info(f"User {user_id}: {days_active} days active, {message_count} messages")
            
            return (
                days_active >= self.MIN_DAYS_FOR_LEARNING and 
                message_count >= self.MIN_MESSAGES_FOR_TRAIT
            )
            
        except Exception as e:
            logger.error(f"Error checking learning eligibility: {e}")
            return False
    
    async def detect_permanent_traits(
        self,
        user_id: str,
        supabase_client,
        communication_analyzer
    ) -> Dict[str, Any]:
        """
        Analyze user's conversation history to detect permanent traits.
        
        Args:
            user_id: User's UUID
            supabase_client: Supabase client instance
            communication_analyzer: CommunicationProfileAnalyzer instance
            
        Returns:
            Dictionary of permanent traits with confidence scores
        """
        try:
            # Get last 100 messages (spans 15+ days for most users)
            response = supabase_client.supabase.table('chat_messages').select(
                'message_text, timestamp'
            ).eq('user_id', user_id).eq('sender_type', 'user').order(
                'timestamp', desc=True
            ).limit(100).execute()
            
            if not response.data or len(response.data) < self.MIN_MESSAGES_FOR_TRAIT:
                logger.warning(f"Not enough messages for trait learning: {len(response.data) if response.data else 0}")
                return {}
            
            messages = [msg['message_text'] for msg in response.data]
            
            # Analyze communication patterns
            profile = communication_analyzer.analyze_messages(messages, min_messages=50)
            
            permanent_traits = {}
            
            # Helper to convert frequency string to float
            def freq_to_float(freq_str: str) -> float:
                """Convert 'low'/'medium'/'high' to numeric value."""
                freq_map = {'low': 0.15, 'medium': 0.4, 'high': 0.7}
                return freq_map.get(str(freq_str).lower(), 0.0)
            
            # 1. SARCASM/HUMOR (permanent if consistent)
            humor_style = profile.get('humor', {}).get('style')
            humor_freq_raw = profile.get('humor', {}).get('frequency', 'low')
            humor_freq = freq_to_float(humor_freq_raw)
            
            if humor_freq > 0.3:  # 30%+ of messages have humor
                permanent_traits['humor_style'] = {
                    'value': humor_style,
                    'confidence': min(humor_freq * 1.5, 1.0),
                    'description': f"Consistently uses {humor_style} humor in conversations"
                }
            
            # 2. EMOJI USAGE (permanent preference)
            emoji_freq_raw = profile.get('emoji', {}).get('usage_frequency', 'low')
            emoji_freq = freq_to_float(emoji_freq_raw)
            
            if emoji_freq > 0.5:  # Uses emojis in 50%+ of messages
                permanent_traits['emoji_preference'] = {
                    'value': 'frequent_emoji_user',
                    'confidence': emoji_freq,
                    'description': f"Uses emojis regularly ({emoji_freq:.0%} of messages)"
                }
            elif emoji_freq < 0.2:  # Rarely/never uses emojis
                permanent_traits['emoji_preference'] = {
                    'value': 'avoids_emojis',
                    'confidence': 1.0 - emoji_freq,
                    'description': "Prefers text-only communication"
                }
            
            # 3. MESSAGE LENGTH (permanent style)
            length_category = profile.get('message_style', {}).get('length_category', 'medium')
            avg_length = profile.get('message_style', {}).get('average_length', 50)
            
            # Check consistency across samples
            length_consistency = self._check_length_consistency(messages)
            
            if length_consistency > self.CONFIDENCE_THRESHOLD:
                permanent_traits['response_length_preference'] = {
                    'value': length_category,
                    'confidence': length_consistency,
                    'description': f"Consistently sends {length_category} messages (avg {avg_length:.0f} chars)"
                }
            
            # 4. FORMALITY LEVEL (permanent if stable)
            formality_score = profile.get('formality', {}).get('score', 0.5)
            # Ensure formality_score is a float
            if isinstance(formality_score, str):
                formality_score = 0.5
            formality_level = profile.get('formality', {}).get('level', 'casual')
            
            if formality_score < 0.3 or formality_score > 0.7:  # Clear preference
                permanent_traits['formality'] = {
                    'value': formality_level,
                    'confidence': abs(formality_score - 0.5) * 2,  # Distance from neutral
                    'description': f"Communication style is {formality_level}"
                }
            
            # 5. SLANG USAGE (permanent vocabulary)
            slang_freq_raw = profile.get('slang', {}).get('usage_frequency', 'low')
            slang_freq = freq_to_float(slang_freq_raw)
            favorite_words = profile.get('slang', {}).get('favorite_words', [])
            
            if slang_freq > 0.2 and favorite_words:  # 20%+ messages have slang
                permanent_traits['slang_vocabulary'] = {
                    'value': favorite_words[:10],  # Top 10 words
                    'confidence': min(slang_freq * 2, 1.0),
                    'description': f"Regular vocabulary: {', '.join(favorite_words[:5])}"
                }
            
            logger.info(f"Detected {len(permanent_traits)} permanent traits for user {user_id}")
            return permanent_traits
            
        except Exception as e:
            logger.error(f"Error detecting permanent traits: {e}")
            return {}
    
    def _check_length_consistency(self, messages: List[str]) -> float:
        """Check if message length is consistent across samples."""
        lengths = [len(msg) for msg in messages]
        
        # Categorize each message
        categories = []
        for length in lengths:
            if length < 30:
                categories.append('brief')
            elif length < 100:
                categories.append('medium')
            else:
                categories.append('verbose')
        
        # Calculate consistency (most common category frequency)
        counter = Counter(categories)
        most_common_freq = counter.most_common(1)[0][1] / len(categories)
        
        return most_common_freq
    
    def generate_trait_update_prompt(self, permanent_traits: Dict[str, Any]) -> str:
        """
        Generate text to append to user's system prompt based on permanent traits.
        
        Args:
            permanent_traits: Dictionary of detected permanent traits
            
        Returns:
            Text to append to system prompt
        """
        if not permanent_traits:
            return ""
        
        trait_text = "\n\n🎯 PERMANENT COMMUNICATION TRAITS (learned from 15+ days):\n"
        
        for trait_name, trait_data in permanent_traits.items():
            confidence = trait_data.get('confidence', 0)
            description = trait_data.get('description', '')
            
            if confidence >= self.CONFIDENCE_THRESHOLD:
                trait_text += f"• {description}\n"
        
        return trait_text
    
    async def update_system_prompt_with_traits(
        self,
        user_id: str,
        permanent_traits: Dict[str, Any],
        supabase_client
    ) -> bool:
        """
        Update user's stored system prompt with permanent traits.
        
        Args:
            user_id: User's UUID
            permanent_traits: Dictionary of permanent traits
            supabase_client: Supabase client instance
            
        Returns:
            True if successful
        """
        try:
            # Get current system prompt
            current_llm_context = await supabase_client.get_personality_llm_context(user_id)
            
            if not current_llm_context or 'systemPrompt' not in current_llm_context:
                logger.warning(f"No existing system prompt for user {user_id}")
                return False
            
            current_prompt = current_llm_context['systemPrompt']
            
            # Check if already has permanent traits section
            if '🎯 PERMANENT COMMUNICATION TRAITS' in current_prompt:
                # Remove old traits section
                parts = current_prompt.split('🎯 PERMANENT COMMUNICATION TRAITS')
                current_prompt = parts[0].rstrip()
            
            # Add new permanent traits
            trait_text = self.generate_trait_update_prompt(permanent_traits)
            updated_prompt = current_prompt + trait_text
            
            # Update in database
            updated_context = current_llm_context.copy()
            updated_context['systemPrompt'] = updated_prompt
            updated_context['permanent_traits'] = permanent_traits
            updated_context['traits_learned_at'] = datetime.utcnow().isoformat()
            
            response = supabase_client.supabase.table('personality_profiles').update({
                'personality_llm_context': updated_context,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', user_id).execute()
            
            if response.data:
                logger.info(f"✅ Updated system prompt with permanent traits for user {user_id}")
                return True
            else:
                logger.error(f"Failed to update system prompt for user {user_id}")
                return False
            
        except Exception as e:
            logger.error(f"Error updating system prompt with traits: {e}")
            return False
