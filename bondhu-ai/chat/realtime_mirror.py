"""
Real-Time Response Mirroring
Mirrors user's communication style in THIS conversation.
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger("bondhu.response_mirror")


class RealTimeResponseMirror:
    """
    Mirrors user's communication style in real-time during conversation.
    Adapts immediately based on their current messages, not just history.
    """
    
    def analyze_current_exchange(
        self,
        user_messages_in_session: List[str],
        ai_messages_in_session: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze current conversation session to mirror user's style RIGHT NOW.
        
        Args:
            user_messages_in_session: User's messages in THIS session
            ai_messages_in_session: AI's messages in THIS session
            
        Returns:
            Real-time adjustment instructions
        """
        if not user_messages_in_session:
            return {}
        
        # Analyze last 3 user messages for immediate pattern
        recent_user_messages = user_messages_in_session[-3:]
        recent_ai_messages = ai_messages_in_session[-3:] if ai_messages_in_session else []
        
        adjustments = {}
        
        # 1. Message length mirroring
        user_avg_length = sum(len(m) for m in recent_user_messages) / len(recent_user_messages)
        
        if user_avg_length < 30:
            adjustments['response_length'] = 'brief'
            adjustments['response_length_instruction'] = "Keep response under 50 words. Be concise."
        elif user_avg_length < 80:
            adjustments['response_length'] = 'medium'
            adjustments['response_length_instruction'] = "Keep response moderate, 50-100 words."
        else:
            adjustments['response_length'] = 'verbose'
            adjustments['response_length_instruction'] = "User prefers detailed responses. Go deeper, 100+ words okay."
        
        # 2. Detect if user is shortening responses (getting disengaged)
        if len(recent_user_messages) >= 2:
            first_msg_len = len(recent_user_messages[0])
            last_msg_len = len(recent_user_messages[-1])
            
            if last_msg_len < first_msg_len * 0.5:  # 50% reduction
                adjustments['engagement_dropping'] = True
                adjustments['engagement_instruction'] = "User engagement dropping (shorter messages). Ask engaging question or change topic."
        
        # 3. Real-time emoji usage
        recent_text = ' '.join(recent_user_messages)
        emoji_count = len([c for c in recent_text if ord(c) > 127000])  # Simple emoji detection
        
        if emoji_count == 0:
            adjustments['emoji_usage'] = 'none'
            adjustments['emoji_instruction'] = "User not using emojis. Don't use any emojis."
        elif emoji_count < 3:
            adjustments['emoji_usage'] = 'minimal'
            adjustments['emoji_instruction'] = "User using few emojis. Use 1-2 max."
        else:
            adjustments['emoji_usage'] = 'frequent'
            adjustments['emoji_instruction'] = f"User using many emojis ({emoji_count}). Feel free to use 3-5."
        
        # 4. Detect frustration from repetition
        if len(recent_user_messages) >= 2:
            if any(word in recent_user_messages[-1].lower() for word in ['again', 'still', 'told you', 'already said']):
                adjustments['frustration_detected'] = True
                adjustments['frustration_instruction'] = "User seems frustrated (repeating themselves). Acknowledge you understand and address their concern directly."
        
        # 5. Detect if AI is talking too much (user giving short acknowledgments)
        if len(recent_ai_messages) > 0 and len(recent_user_messages) >= 2:
            last_ai_length = len(recent_ai_messages[-1])
            last_user_length = len(recent_user_messages[-1])
            
            if last_ai_length > 200 and last_user_length < 30:
                if any(word in recent_user_messages[-1].lower() for word in ['ok', 'okay', 'yeah', 'yea', 'k', 'cool', 'got it']):
                    adjustments['ai_talking_too_much'] = True
                    adjustments['verbosity_instruction'] = "User gave short acknowledgment after long AI message. Be more concise."
        
        # 6. Detect question pattern (user asking many questions = curious)
        question_count = sum(1 for msg in recent_user_messages if '?' in msg)
        if question_count >= 2:
            adjustments['curiosity_high'] = True
            adjustments['curiosity_instruction'] = "User asking many questions. Provide detailed, informative answers."
        
        # 7. Detect sarcasm/humor attempt
        recent_lower = ' '.join(recent_user_messages).lower()
        sarcasm_indicators = ['yeah right', 'sure', 'lol', 'lmao', 'haha', 'rofl']
        if any(indicator in recent_lower for indicator in sarcasm_indicators):
            adjustments['humor_detected'] = True
            adjustments['humor_instruction'] = "User using humor/sarcasm. Match their playful tone."
        
        logger.info(f"Real-time adjustments: {adjustments}")
        return adjustments
    
    def build_realtime_prompt_addition(self, adjustments: Dict[str, Any]) -> str:
        """
        Build prompt addition for real-time adjustments.
        
        Args:
            adjustments: Real-time adjustment dict
            
        Returns:
            Prompt addition string
        """
        if not adjustments:
            return ""
        
        prompt_lines = ["\n🔄 REAL-TIME ADJUSTMENTS (THIS CONVERSATION):"]
        
        if 'response_length_instruction' in adjustments:
            prompt_lines.append(f"• {adjustments['response_length_instruction']}")
        
        if adjustments.get('engagement_dropping'):
            prompt_lines.append(f"• {adjustments['engagement_instruction']}")
        
        if 'emoji_instruction' in adjustments:
            prompt_lines.append(f"• {adjustments['emoji_instruction']}")
        
        if adjustments.get('frustration_detected'):
            prompt_lines.append(f"• {adjustments['frustration_instruction']}")
        
        if adjustments.get('ai_talking_too_much'):
            prompt_lines.append(f"• {adjustments['verbosity_instruction']}")
        
        if adjustments.get('curiosity_high'):
            prompt_lines.append(f"• {adjustments['curiosity_instruction']}")
        
        if adjustments.get('humor_detected'):
            prompt_lines.append(f"• {adjustments['humor_instruction']}")
        
        return "\n".join(prompt_lines)
