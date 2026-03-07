"""
Dynamic System Prompt Rewriter
Actually rewrites the prompt's tone instead of just appending instructions.
"""

import logging
import re
from typing import Dict, Any, Optional

logger = logging.getLogger("bondhu.prompt_rewriter")


class DynamicPromptRewriter:
    """
    Rewrites system prompts to match user's actual communication style.
    Doesn't just append instructions - actually changes the prompt's tone.
    """
    
    def rewrite_for_mood_and_style(
        self,
        base_prompt: str,
        mood: Optional[str],
        communication_profile: Dict[str, Any],
        realtime_adjustments: Dict[str, Any]
    ) -> str:
        """
        Dynamically rewrite system prompt to match user's style.
        
        Args:
            base_prompt: Original system prompt
            mood: Detected mood (sad, stressed, happy, etc.)
            communication_profile: User's historical communication profile
            realtime_adjustments: Real-time conversation adjustments
            
        Returns:
            Rewritten system prompt
        """
        rewritten = base_prompt
        
        # 1. Adjust formality level
        if communication_profile:
            formality = communication_profile.get('formality', {})
            formality_score = formality.get('score', 0.5)
            
            if formality_score < 0.3:  # Very casual user
                rewritten = self._make_casual(rewritten)
            elif formality_score > 0.7:  # Very formal user
                rewritten = self._make_formal(rewritten)
        
        # 2. Inject slang naturally
        if communication_profile:
            slang = communication_profile.get('slang', {})
            favorite_words = slang.get('favorite_words', [])
            
            if favorite_words:
                # Add natural slang injection instruction
                slang_note = f"\n💬 User's common words: {', '.join(favorite_words[:5])}. Naturally incorporate these when appropriate."
                rewritten = f"{rewritten}{slang_note}"
        
        # 3. Mood-based tone rewriting
        if mood == 'sad':
            rewritten = self._add_warmth(rewritten)
        elif mood == 'stressed':
            rewritten = self._add_calm(rewritten)
        elif mood == 'happy':
            rewritten = self._add_energy(rewritten)
        elif mood == 'angry':
            rewritten = self._add_patience(rewritten)
        
        # 4. Real-time length constraint (PRIORITY)
        if realtime_adjustments:
            response_length = realtime_adjustments.get('response_length')
            
            if response_length == 'brief':
                # Inject HARD constraint at top
                rewritten = f"⚠️ CRITICAL: Keep response under 50 words. User prefers brief messages.\n\n{rewritten}"
            elif response_length == 'verbose':
                rewritten = f"✅ User prefers detailed responses. Provide depth and context.\n\n{rewritten}"
        
        # 5. Engagement adjustment
        if realtime_adjustments and realtime_adjustments.get('engagement_dropping'):
            # Priority alert at top
            rewritten = f"🚨 ENGAGEMENT DROPPING: User messages getting shorter. Ask engaging question or change topic.\n\n{rewritten}"
        
        # 6. Emoji mirroring (LIMIT TO 4 EMOJIS MAX)
        if realtime_adjustments:
            emoji_usage = realtime_adjustments.get('emoji_usage')
            
            if emoji_usage == 'none':
                # Remove any emoji suggestions from prompt
                rewritten = re.sub(r'emoji|🎯|✨|💪|🔥', '', rewritten, flags=re.IGNORECASE)
                rewritten = f"❌ NO EMOJIS - User doesn't use them.\n\n{rewritten}"
            elif emoji_usage == 'minimal':
                rewritten = f"✨ User uses 1-2 emojis. Match their style - use 1-2 MAX.\n\n{rewritten}"
            elif emoji_usage == 'frequent':
                rewritten = f"✨ User loves emojis ({realtime_adjustments.get('emoji_count', 3)}+). Use 3-4 naturally (MAX 4).\n\n{rewritten}"
        
        # 🚫 CRITICAL: No repetitive questions
        rewritten = f"🚫 NO REPETITION: If user already answered something in conversation, DON'T ask again. You remember what they said.\n\n{rewritten}"
        
        # 🌍 HARD CONSTRAINT: Language consistency
        rewritten = f"🌍 LANGUAGE RULE: Always respond in the SAME language the user is speaking. Do NOT switch languages unless explicitly asked.\n\n{rewritten}"
        
        # 🚨 HARD CONSTRAINT: Never exceed 4 emojis
        rewritten = f"⚠️ EMOJI LIMIT: Maximum 4 emojis per response. Quality over quantity.\n\n{rewritten}"
        
        return rewritten
    
    def _make_casual(self, prompt: str) -> str:
        """Make prompt more casual."""
        # Replace formal phrases
        replacements = {
            'you should': 'you could',
            'I would recommend': 'I think',
            'It is important': 'It matters',
            'Please note': 'Heads up',
            'Furthermore': 'Also',
            'Additionally': 'Plus',
        }
        
        for formal, casual in replacements.items():
            prompt = prompt.replace(formal, casual)
        
        return prompt
    
    def _make_formal(self, prompt: str) -> str:
        """Make prompt more formal."""
        replacements = {
            'gonna': 'going to',
            'wanna': 'want to',
            'gotta': 'have to',
            'kinda': 'kind of',
            'sorta': 'sort of',
        }
        
        for casual, formal in replacements.items():
            prompt = prompt.replace(casual, formal)
        
        return prompt
    
    def _add_warmth(self, prompt: str) -> str:
        """Add warmth for sad mood."""
        warmth_note = "\n🤗 TONE: Warm, validating, gentle. User seems down - acknowledge feelings, offer comfort."
        return f"{prompt}{warmth_note}"
    
    def _add_calm(self, prompt: str) -> str:
        """Add calm for stressed mood."""
        calm_note = "\n🧘 TONE: Calm, grounding, steady. User is stressed - be the calm presence they need."
        return f"{prompt}{calm_note}"
    
    def _add_energy(self, prompt: str) -> str:
        """Add energy for happy mood."""
        energy_note = "\n🎉 TONE: Upbeat, celebratory, energized. User is happy - match their positive vibe!"
        return f"{prompt}{energy_note}"
    
    def _add_patience(self, prompt: str) -> str:
        """Add patience for angry mood."""
        patience_note = "\n😌 TONE: Patient, non-defensive, understanding. User is frustrated - don't escalate."
        return f"{prompt}{patience_note}"
