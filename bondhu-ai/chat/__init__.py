"""
Chat module for Bondhu AI

Uses Cerebras llama3.1-8b model exclusively for all chat operations.
"""

from .cerebras_service import CerebrasChatService, get_chat_service

__all__ = [
    "CerebrasChatService", 
    "get_chat_service",
]
