"""
Communication Profile Analyzer for Digital Twin Experience
Extracts user's communication patterns, slang usage, emoji preferences,
and linguistic fingerprint from actual conversation history.
"""

import logging
import re
from typing import Dict, Any, List, Optional
from collections import Counter
from datetime import datetime

logger = logging.getLogger("bondhu.communication_analyzer")


class CommunicationProfileAnalyzer:
    """
    Analyzes user's communication style to create a linguistic fingerprint.
    This enables the AI to mirror the user's actual way of speaking.
    """
    
    def __init__(self):
        # Common slang patterns (Gen Z / Indian context)
        self.slang_patterns = [
            'lowkey', 'highkey', 'ngl', 'fr', 'frfr', 'bruh', 'bro', 'yo',
            'tbh', 'imo', 'imho', 'lol', 'lmao', 'omg', 'wtf', 'nah', 'yea',
            'yaar', 'yaar', 'bhai', 'dude', 'sus', 'vibe', 'vibes', 'lit',
            'slay', 'bet', 'cap', 'no cap', 'fam', 'deadass', 'periodt',
            'kinda', 'sorta', 'gonna', 'wanna', 'gotta', 'basically',
            'literally', 'honestly', 'seriously', 'actually', 'like',
            'oof', 'ugh', 'meh', 'haha', 'hehe', 'lmfao', 'rofl'
        ]
        
        # Emoji patterns (common in Gen Z communication)
        self.emoji_pattern = re.compile(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251]+')
        
        # Interjections and sentence starters
        self.interjections = ['omg', 'wow', 'wait', 'okay', 'so', 'like', 'well', 'um', 'uh', 'hmm']
        
        # Sentence enders
        self.enders = ['though', 'tho', 'lol', 'haha', 'lmao', 'fr', 'ngl', 'tbh', 'you know', 'ya know']
    
    def analyze_messages(self, messages: List[str], min_messages: int = 10) -> Dict[str, Any]:
        """
        Analyze a list of user messages to build communication profile.
        
        Args:
            messages: List of user message texts
            min_messages: Minimum messages required for reliable analysis
            
        Returns:
            Dict containing communication fingerprint
        """
        if len(messages) < min_messages:
            logger.warning(f"Only {len(messages)} messages available, need at least {min_messages}")
            return self._get_default_profile()
        
        # Extract all patterns
        slang_usage = self._extract_slang(messages)
        emoji_usage = self._extract_emojis(messages)
        formality_score = self._calculate_formality(messages)
        message_lengths = [len(m) for m in messages]
        avg_length = sum(message_lengths) / len(message_lengths)
        humor_style = self._detect_humor_style(messages)
        conversation_patterns = self._extract_conversation_patterns(messages)
        
        profile = {
            'slang': {
                'usage_frequency': slang_usage['frequency'],  # low, medium, high
                'favorite_words': slang_usage['top_words'][:10],
                'total_slang_count': slang_usage['total_count']
            },
            'emoji': {
                'usage_frequency': emoji_usage['frequency'],
                'favorite_emojis': emoji_usage['top_emojis'][:8],
                'total_emoji_count': emoji_usage['total_count']
            },
            'formality': {
                'level': formality_score['level'],  # casual, balanced, formal
                'score': formality_score['score'],  # 0.0-1.0
                'uses_punctuation': formality_score['uses_punctuation'],
                'uses_capitalization': formality_score['uses_capitalization']
            },
            'message_style': {
                'avg_length': int(avg_length),
                'length_category': self._categorize_length(avg_length),  # brief, medium, verbose
                'uses_paragraphs': any(len(m) > 200 for m in messages)
            },
            'humor': {
                'style': humor_style['style'],  # self_deprecating, sarcastic, wholesome, none
                'frequency': humor_style['frequency']
            },
            'patterns': conversation_patterns,
            'analysis_metadata': {
                'messages_analyzed': len(messages),
                'analyzed_at': datetime.now().isoformat(),
                'confidence': self._calculate_confidence(len(messages))
            }
        }
        
        logger.info(f"Communication profile generated from {len(messages)} messages")
        return profile
    
    def _extract_slang(self, messages: List[str]) -> Dict[str, Any]:
        """Extract slang usage patterns."""
        all_text = ' '.join(messages).lower()
        slang_found = Counter()
        
        for slang in self.slang_patterns:
            count = all_text.count(slang)
            if count > 0:
                slang_found[slang] = count
        
        total_count = sum(slang_found.values())
        avg_per_message = total_count / len(messages) if messages else 0
        
        # Determine frequency level
        if avg_per_message > 2:
            frequency = 'high'
        elif avg_per_message > 0.5:
            frequency = 'medium'
        else:
            frequency = 'low'
        
        return {
            'frequency': frequency,
            'top_words': [word for word, _ in slang_found.most_common(15)],
            'total_count': total_count
        }
    
    def _extract_emojis(self, messages: List[str]) -> Dict[str, Any]:
        """Extract emoji usage patterns."""
        all_emojis = []
        
        for message in messages:
            emojis = self.emoji_pattern.findall(message)
            all_emojis.extend(emojis)
        
        emoji_counts = Counter(all_emojis)
        total_count = len(all_emojis)
        avg_per_message = total_count / len(messages) if messages else 0
        
        # Determine frequency level
        if avg_per_message > 2:
            frequency = 'high'
        elif avg_per_message > 0.5:
            frequency = 'medium'
        else:
            frequency = 'low'
        
        return {
            'frequency': frequency,
            'top_emojis': [emoji for emoji, _ in emoji_counts.most_common(10)],
            'total_count': total_count
        }
    
    def _calculate_formality(self, messages: List[str]) -> Dict[str, Any]:
        """Calculate formality score based on grammar patterns."""
        formality_signals = {
            'proper_punctuation': 0,
            'proper_capitalization': 0,
            'complete_sentences': 0,
            'formal_words': 0
        }
        
        formal_words = ['however', 'therefore', 'furthermore', 'consequently', 'indeed', 'regarding']
        
        for message in messages:
            # Check punctuation
            if message.strip() and message.strip()[-1] in '.!?':
                formality_signals['proper_punctuation'] += 1
            
            # Check capitalization
            sentences = message.split('.')
            capitalized = sum(1 for s in sentences if s.strip() and s.strip()[0].isupper())
            if capitalized / max(len(sentences), 1) > 0.7:
                formality_signals['proper_capitalization'] += 1
            
            # Check for formal words
            message_lower = message.lower()
            if any(word in message_lower for word in formal_words):
                formality_signals['formal_words'] += 1
        
        # Calculate score (0.0 = very casual, 1.0 = very formal)
        score = 0.0
        score += (formality_signals['proper_punctuation'] / len(messages)) * 0.3
        score += (formality_signals['proper_capitalization'] / len(messages)) * 0.3
        score += (formality_signals['formal_words'] / len(messages)) * 0.4
        
        # Determine level
        if score > 0.7:
            level = 'formal'
        elif score > 0.3:
            level = 'balanced'
        else:
            level = 'casual'
        
        return {
            'score': round(score, 2),
            'level': level,
            'uses_punctuation': formality_signals['proper_punctuation'] / len(messages) > 0.5,
            'uses_capitalization': formality_signals['proper_capitalization'] / len(messages) > 0.5
        }
    
    def _categorize_length(self, avg_length: float) -> str:
        """Categorize message length."""
        if avg_length < 30:
            return 'brief'
        elif avg_length < 100:
            return 'medium'
        else:
            return 'verbose'
    
    def _detect_humor_style(self, messages: List[str]) -> Dict[str, Any]:
        """Detect humor style from messages."""
        all_text = ' '.join(messages).lower()
        
        humor_indicators = {
            'self_deprecating': ['i suck', 'i fail', "i'm terrible", "i'm bad", "can't do", 'lol at me'],
            'sarcastic': ['yeah right', 'sure', 'totally', 'obviously', 'wow'],
            'wholesome': ['aww', 'cute', 'sweet', 'love', 'adorable', 'precious']
        }
        
        humor_scores = {}
        for style, keywords in humor_indicators.items():
            score = sum(all_text.count(keyword) for keyword in keywords)
            humor_scores[style] = score
        
        if all(score == 0 for score in humor_scores.values()):
            return {'style': 'none', 'frequency': 'low'}
        
        dominant_style = max(humor_scores, key=humor_scores.get)
        frequency = 'high' if humor_scores[dominant_style] > 5 else 'medium'
        
        return {
            'style': dominant_style,
            'frequency': frequency
        }
    
    def _extract_conversation_patterns(self, messages: List[str]) -> Dict[str, Any]:
        """Extract conversation habits and patterns."""
        patterns = {
            'interjections': [],
            'sentence_enders': [],
            'question_frequency': 0,
            'exclamation_frequency': 0
        }
        
        all_text_lower = ' '.join(messages).lower()
        
        # Count interjections
        interjection_counts = Counter()
        for interjection in self.interjections:
            if interjection in all_text_lower:
                interjection_counts[interjection] = all_text_lower.count(interjection)
        
        patterns['interjections'] = [word for word, _ in interjection_counts.most_common(5)]
        
        # Count sentence enders
        ender_counts = Counter()
        for ender in self.enders:
            if ender in all_text_lower:
                ender_counts[ender] = all_text_lower.count(ender)
        
        patterns['sentence_enders'] = [word for word, _ in ender_counts.most_common(5)]
        
        # Count questions and exclamations
        all_text = ' '.join(messages)
        patterns['question_frequency'] = all_text.count('?') / len(messages)
        patterns['exclamation_frequency'] = all_text.count('!') / len(messages)
        
        return patterns
    
    def _calculate_confidence(self, message_count: int) -> float:
        """Calculate confidence in the analysis based on message count."""
        if message_count < 10:
            return 0.3
        elif message_count < 30:
            return 0.6
        elif message_count < 50:
            return 0.8
        else:
            return 0.95
    
    def _get_default_profile(self) -> Dict[str, Any]:
        """Return default profile when insufficient data."""
        return {
            'slang': {'usage_frequency': 'medium', 'favorite_words': [], 'total_slang_count': 0},
            'emoji': {'usage_frequency': 'medium', 'favorite_emojis': [], 'total_emoji_count': 0},
            'formality': {'level': 'balanced', 'score': 0.5, 'uses_punctuation': True, 'uses_capitalization': True},
            'message_style': {'avg_length': 50, 'length_category': 'medium', 'uses_paragraphs': False},
            'humor': {'style': 'none', 'frequency': 'low'},
            'patterns': {'interjections': [], 'sentence_enders': [], 'question_frequency': 0, 'exclamation_frequency': 0},
            'analysis_metadata': {'messages_analyzed': 0, 'analyzed_at': datetime.now().isoformat(), 'confidence': 0.0}
        }
