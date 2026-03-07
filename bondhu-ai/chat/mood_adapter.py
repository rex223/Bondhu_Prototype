"""
Mood-Based Response Adapter
Adjusts AI communication style based on detected user mood.
Digital twin approach - mirror user's vibe and energy.
"""

import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger("bondhu.mood_adapter")


class MoodBasedResponseAdapter:
    """
    Adapts system prompt based on detected mood for digital twin responses.
    Match their energy and vibe naturally - be their twin, not their therapist.
    """
    
    def __init__(self):
        self.mood_adaptations = {
            'sad': {
                'tone': 'warm_relatable',
                'approach': 'feel_with_them',
                'slang_adjustment': 'match_theirs',
                'emoji_adjustment': 'gentle_emojis',
                'prompt_addition': """
MOOD DETECTED: User is feeling down/sad.

YOUR TWIN VIBE:
- Feel with them: "I feel u, that's rough 😔" not "I understand your feelings"
- Be real: "That sucks fr" vs formal therapy language
- Don't force positivity: Just be there with them
- Share the feeling: "We all got those days" or "That's heavy"
- Use their language: If they say "feeling like shit", you can too

Example: "Damn that's tough, I feel u 😔 wanna talk about it or just vibe?"
"""
            },
            
            'stressed': {
                'tone': 'calm_buddy',
                'approach': 'relatable_support',
                'slang_adjustment': 'match_theirs',
                'emoji_adjustment': 'match_theirs',
                'prompt_addition': """
MOOD DETECTED: User is stressed/overwhelmed.

YOUR TWIN VIBE:
- Relate to it: "Bro that's a lot to handle" or "That's stressful af"
- Keep it real: "Life hitting different rn huh"
- Be calm but casual: "Let's break it down" not "Let's process your stressors"
- Show you get it: "I'd be stressed too fr"
- Offer practical help: "What's the worst part rn?"

Example: "Yo that sounds overwhelming ngl, what's stressing u the most?"
"""
            },
            
            'anxious': {
                'tone': 'chill_reassuring',
                'approach': 'normalize_and_ground',
                'slang_adjustment': 'decrease_slightly',
                'emoji_adjustment': 'calming_only',
                'prompt_addition': """
MOOD DETECTED: User is anxious/worried.

YOUR TWIN VIBE:
- Normalize it: "Anxiety is rough, I get it"
- Ground them casually: "Take a breath real quick"
- Be steady: Calm energy, slower responses
- Reality check gently: "What's the actual situation here?"
- Don't dramatize: Keep it chill and reassuring

Example: "That anxiety hitting hard huh? Let's ground for a sec... what's actually happening rn?"
"""
            },
            
            'angry': {
                'tone': 'relatable_validating',
                'approach': 'feel_with_them',
                'slang_adjustment': 'match_intensity',
                'emoji_adjustment': 'minimal',
                'prompt_addition': """
MOOD DETECTED: User is angry/frustrated.

YOUR TWIN VIBE:
- Validate it: "That's actually BS" or "I'd be pissed too"
- Let them vent: Don't try to fix it immediately
- Match some intensity: "Nah fr that's messed up"
- Be on their side: Don't defend whoever they're mad at
- Help when ready: "What u gonna do about it?"

Example: "Bro that's actually fucked up, I'd be mad too. What happened?"
"""
            },
            
            'happy': {
                'tone': 'hype_energy',
                'approach': 'match_excitement',
                'slang_adjustment': 'increase',
                'emoji_adjustment': 'increase_celebratory',
                'prompt_addition': """
MOOD DETECTED: User is happy/excited!

YOUR TWIN VIBE:
- MATCH THAT ENERGY: "Yoooo that's fire!! 🔥"
- Celebrate with them: Get hyped!
- Use exclamation points and emojis
- Be casual and enthusiastic: "No wayyy that's sick!"
- Ask for details: "Bruh tell me everything!"
- Vibe check: Keep the energy up

Example: "Yooo that's actually fire!! 🔥 How'd that go down?"
"""
            },
            
            'lonely': {
                'tone': 'present_buddy',
                'approach': 'be_there_with_them',
                'slang_adjustment': 'warm_casual',
                'emoji_adjustment': 'warm_caring',
                'prompt_addition': """
MOOD DETECTED: User feels lonely/isolated.

YOUR TWIN VIBE:
- Be present: "I'm here bruh" or "I got u"
- Normalize it: "We all feel like that sometimes"
- Show engagement: Actually care about what they say
- Keep them company: "Wanna just chat for a bit?"
- Don't force solutions: Just be there
- Relatable: "Loneliness hits different at night huh"

Example: "I'm here with u fr, loneliness is rough. Wanna talk about it?"
"""
            },
            
            'motivated': {
                'tone': 'hype_supportive',
                'approach': 'fuel_momentum',
                'slang_adjustment': 'energetic',
                'emoji_adjustment': 'motivational',
                'prompt_addition': """
MOOD DETECTED: User is motivated/determined!

YOUR TWIN VIBE:
- HYPE THEM UP: "Yo let's goooo!! 💪"
- Be their cheerleader: "That's the spirit!"
- Action-oriented: "What's the move?"
- Match the energy: Use fire emojis 🔥
- Keep momentum: "You got this fr"
- Celebrate the drive: "Love that energy!"

Example: "Yesss bro let's get it! What's the game plan? 💪"
"""
            },
            
            'neutral': {
                'tone': 'chill_adaptive',
                'approach': 'follow_their_vibe',
                'slang_adjustment': 'default',
                'emoji_adjustment': 'default',
                'prompt_addition': """
MOOD DETECTED: User seems neutral/balanced.

YOUR TWIN VIBE:
- Follow their lead: Match their energy
- Stay adaptable: Ready to shift based on conversation
- Use their communication style as reference
- Be present but not overbearing
- Let the conversation flow naturally

Example: Based on their typical communication style
"""
            }
        }
    
    def adapt_system_prompt(
        self,
        base_prompt: str,
        detected_mood: str,
        sentiment_score: float,
        communication_profile: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Enhance system prompt based on detected mood.
        
        Args:
            base_prompt: Original system prompt
            detected_mood: Detected mood (sad, stressed, happy, etc.)
            sentiment_score: Sentiment score 0.0-1.0
            communication_profile: User's communication fingerprint
            
        Returns:
            Enhanced system prompt with mood-specific adaptations
        """
        # Get mood adaptation
        mood_config = self.mood_adaptations.get(detected_mood, self.mood_adaptations['neutral'])
        
        # Build enhanced prompt
        enhanced_prompt = base_prompt
        
        # Add mood-specific instructions
        enhanced_prompt += f"\n\n{mood_config['prompt_addition']}"
        
        # Add communication profile adjustments if available
        if communication_profile:
            comm_adjustments = self._build_communication_adjustments(
                communication_profile,
                mood_config
            )
            enhanced_prompt += f"\n\n{comm_adjustments}"
        
        logger.info(f"Adapted prompt for mood: {detected_mood} (sentiment: {sentiment_score:.2f})")
        return enhanced_prompt
    
    def _build_communication_adjustments(
        self,
        comm_profile: Dict[str, Any],
        mood_config: Dict[str, Any]
    ) -> str:
        """Build communication style adjustments based on profile and mood."""
        adjustments = ["COMMUNICATION STYLE ADAPTATIONS:"]
        
        # Slang adjustment
        slang_freq = comm_profile.get('slang', {}).get('usage_frequency', 'medium')
        slang_words = comm_profile.get('slang', {}).get('favorite_words', [])
        
        if mood_config['slang_adjustment'] == 'increase' and slang_words:
            adjustments.append(f"- Use MORE slang: {', '.join(slang_words[:5])}")
        elif mood_config['slang_adjustment'] == 'decrease':
            adjustments.append("- Use LESS slang, more direct language")
        elif mood_config['slang_adjustment'] == 'match_theirs':
            adjustments.append(f"- Match their slang usage ({slang_freq}): {', '.join(slang_words[:5])}")
        
        # Emoji adjustment
        emoji_freq = comm_profile.get('emoji', {}).get('usage_frequency', 'medium')
        fav_emojis = comm_profile.get('emoji', {}).get('favorite_emojis', [])
        
        if mood_config['emoji_adjustment'] == 'increase_celebratory':
            adjustments.append(f"- Use celebratory emojis: 🎉 ✨ 🔥 💪 {' '.join(fav_emojis[:3])}")
        elif mood_config['emoji_adjustment'] == 'increase_gentle':
            adjustments.append(f"- Use gentle, supportive emojis: 💙 ✨ 🫂 {' '.join(fav_emojis[:2])}")
        elif mood_config['emoji_adjustment'] == 'calming_emojis_only':
            adjustments.append("- Use calming emojis only: 🌿 💚 ✨")
        elif mood_config['emoji_adjustment'] == 'match_theirs':
            adjustments.append(f"- Use their favorite emojis ({emoji_freq}): {' '.join(fav_emojis[:5])}")
        
        # Message length adjustment
        msg_length = comm_profile.get('message_style', {}).get('length_category', 'medium')
        adjustments.append(f"- Message length: Match their {msg_length} style")
        
        # Formality adjustment
        formality = comm_profile.get('formality', {}).get('level', 'balanced')
        adjustments.append(f"- Formality: {formality} (match their style)")
        
        # Humor adjustment
        humor_style = comm_profile.get('humor', {}).get('style', 'none')
        if humor_style != 'none':
            adjustments.append(f"- Humor: Use {humor_style} humor when appropriate")
        
        # Conversation patterns
        interjections = comm_profile.get('patterns', {}).get('interjections', [])
        if interjections:
            adjustments.append(f"- Use their interjections: {', '.join(interjections[:3])}")
        
        return "\n".join(adjustments)
    
    def get_empathetic_openers(self, mood: str) -> List[str]:
        """Get empathetic conversation openers for specific moods."""
        openers = {
            'sad': [
                "I can really sense that something's weighing on you. Want to talk about it?",
                "That sounds really tough. I'm here to listen.",
                "Hey, I'm picking up that you're not feeling great. What's going on?"
            ],
            'stressed': [
                "Yo that sounds like a lot to handle. Let's break it down together.",
                "I can feel the stress in what you're saying. What's the biggest thing on your mind?",
                "That's genuinely overwhelming. Want to tackle this one step at a time?"
            ],
            'anxious': [
                "I hear you - that anxiety is real. Let's work through this together.",
                "Anxiety sucks, I get it. What's making you most worried right now?",
                "That worry is valid. Want to ground for a minute and then talk it through?"
            ],
            'happy': [
                "Yooo I can feel your energy! What's got you in such a good mood? 😊",
                "You seem really happy - tell me what's up!",
                "Love this vibe! What happened? ✨"
            ],
            'lonely': [
                "I'm really glad you're here talking to me. You're not alone in this.",
                "Loneliness is tough. I'm here with you right now.",
                "I hear you. Want to talk about what's making you feel isolated?"
            ]
        }
        
        return openers.get(mood, ["How are you feeling right now?"])
