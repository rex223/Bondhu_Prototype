"""Session management helpers for deterministic chat session IDs.

A session lasts from 12:00 IST (noon) until the next day's 11:59:59 IST. We
cache active session IDs in Redis so repeated requests within the same window
reuse the same session without requiring the client to send the ID.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, time, timedelta
from typing import Optional

from zoneinfo import ZoneInfo

from core.cache.redis_client import get_redis

logger = logging.getLogger("bondhu.chat.session_manager")

IST = ZoneInfo("Asia/Kolkata")
SESSION_RESET_HOUR = 12  # 12:00 (noon) IST is the boundary
SESSION_KEY_TEMPLATE = "chat:session:{user_id}:{anchor}"
TTL_BUFFER_SECONDS = 120  # small buffer to avoid premature expiry


class SessionManager:
    def __init__(self):
        self.redis = get_redis()

    def resolve_session_id(
        self,
        user_id: str,
        provided_session_id: Optional[str] = None,
    ) -> str:
        """Return the active session ID for the user, creating one if needed."""
        if provided_session_id:
            return provided_session_id

        now_ist = datetime.now(IST)
        anchor_key = self._session_anchor(now_ist)
        cache_key = SESSION_KEY_TEMPLATE.format(user_id=user_id, anchor=anchor_key)

        cached_session = self.redis.get(cache_key)
        if cached_session:
            return cached_session

        session_id = str(uuid.uuid4())
        ttl_seconds = self._seconds_until_next_window(now_ist) + TTL_BUFFER_SECONDS
        self.redis.setex(cache_key, ttl_seconds, session_id)
        logger.info(
            "Created new session %s for user %s (window anchor %s)",
            session_id,
            user_id,
            anchor_key,
        )
        return session_id

    def _session_anchor(self, now_ist: datetime) -> str:
        """Return the anchor string (date) for the current noon-based window."""
        reset_boundary = now_ist.replace(
            hour=SESSION_RESET_HOUR,
            minute=0,
            second=0,
            microsecond=0,
        )
        if now_ist < reset_boundary:
            anchor_date = (now_ist - timedelta(days=1)).date()
        else:
            anchor_date = now_ist.date()
        return f"{anchor_date.isoformat()}-noon"

    def _seconds_until_next_window(self, now_ist: datetime) -> int:
        """Compute seconds until the next 12:00 IST reset."""
        next_reset_date = now_ist.date()
        reset_time = datetime.combine(
            next_reset_date,
            time(hour=SESSION_RESET_HOUR, minute=0, tzinfo=IST),
        )
        if now_ist >= reset_time:
            reset_time += timedelta(days=1)
        return max(int((reset_time - now_ist).total_seconds()), 60)


_session_manager: Optional[SessionManager] = None


def get_session_manager() -> SessionManager:
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager
