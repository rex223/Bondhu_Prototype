"""Handles short-lived conversation gists for digital twin prompts."""

from typing import List, Optional
import logging
import re

from core.cache.redis_client import cache_set

logger = logging.getLogger("bondhu.chat.gist")

GIST_TTL_SECONDS = 180
GIST_KEY_TEMPLATE = "conversation:gist:{}"

TOPIC_KEYWORDS = {
    "time": ["time", "clock", "hour"],
    "dating": ["date", "dating", "bitches", "love", "relationship", "gf", "mf"],
    "location": ["where", "location", "city", "state", "country"],
    "mood": ["sad", "happy", "angry", "depressed", "stress", "excited"],
    "technology": ["llm", "ai", "bondhu", "chat", "model"],
}

QUESTION_WORDS = ["who", "what", "when", "where", "why", "how", "did", "do", "does", "can", "could", "would"]

MOOD_DESCRIPTIONS = {
    "sad": "down, needs gentle support",
    "stressed": "tense, needs grounding",
    "anxious": "worried, needs calm",
    "angry": "upset, needs validation",
    "happy": "energized, match hype",
    "motivated": "driven, keep the momentum",
    "lonely": "craving presence",
    "neutral": "balanced",
}


def _normalize_message(message: str) -> str:
    return re.sub(r"\s+", " ", message.strip().lower())


def _extract_topics(messages: List[str]) -> List[str]:
    topics = []
    for msg in messages:
        text = _normalize_message(msg)
        for topic, keywords in TOPIC_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                if topic not in topics:
                    topics.append(topic)
    return topics


def _extract_last_question(messages: List[str]) -> Optional[str]:
    for msg in reversed(messages):
        text = msg.strip()
        if not text:
            continue
        if "?" in text or any(text.lower().startswith(word + " ") for word in QUESTION_WORDS):
            return text
    return None


def build_conversation_gist(messages: List[str], mood: str, realtime_adjustments: dict) -> Optional[str]:
    if not messages:
        return None

    topics = _extract_topics(messages[-6:])
    last_question = _extract_last_question(messages[-4:])
    mood_desc = MOOD_DESCRIPTIONS.get(mood, "steady")
    emoji_hint = None

    if realtime_adjustments:
        emoji_usage = realtime_adjustments.get("emoji_usage")
        if emoji_usage == "frequent":
            emoji_hint = "Likes emojis, keep to 3-4"
        elif emoji_usage == "minimal":
            emoji_hint = "Uses very few emojis"

    parts = [f"Mood: {mood_desc}"]
    if topics:
        parts.append(f"Topics: {', '.join(topics)}")
    if last_question:
        parts.append(f"Pending question: {last_question}")
    if emoji_hint:
        parts.append(emoji_hint)

    gist = " | ".join(parts)
    return gist


def cache_conversation_gist(session_id: str, gist: str) -> bool:
    key = GIST_KEY_TEMPLATE.format(session_id)
    try:
        return cache_set(key, gist, ttl_seconds=GIST_TTL_SECONDS)
    except Exception as e:
        logger.error(f"Unable to cache gist for {session_id}: {e}")
        return False


def build_and_cache_gist(
    session_id: str,
    user_messages: List[str],
    mood: str,
    realtime_adjustments: dict
) -> Optional[str]:
    gist = build_conversation_gist(user_messages, mood, realtime_adjustments)
    if gist:
        cache_conversation_gist(session_id, gist)
    return gist
