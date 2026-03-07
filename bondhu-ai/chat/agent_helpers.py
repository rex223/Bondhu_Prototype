"""
Helper methods for agent integration in chat service.
"""

from typing import Dict, Any, Optional
import logging

logger = logging.getLogger("bondhu.chat.agent_helpers")

async def check_agent_routing(coordinator, user_id: str, message: str) -> Optional[Dict[str, Any]]:
    """Check if message should be routed to agents."""
    try:
        agent_response = await coordinator.process_query(message)
        
        if agent_response.get("intent") != "general_chat":
            logger.info(f"Query routed to agents: {agent_response.get('intent')}")
            return agent_response
        
        return None
        
    except Exception as e:
        logger.error(f"Error in agent routing: {e}")
        return None

def format_agent_context(agent_response: Dict[str, Any]) -> str:
    """Format agent response as context for LLM."""
    intent = agent_response.get("intent")
    summary = agent_response.get("natural_language_summary", "")
    
    context = f"\n\nRELEVANT USER DATA ({intent}):\n{summary}"
    
    if intent == "music_preference":
        data = agent_response.get("data", {})
        top_artists = data.get("top_artists", [])[:3]
        if top_artists:
            artists = ", ".join([a.get("name", "") for a in top_artists])
            context += f"\nTop Artists: {artists}"
    
    elif intent == "recommendation":
        recs = agent_response.get("recommendations", {})
        if "music" in recs:
            context += f"\nMusic recommendations prepared: {len(recs['music'])} genres"
        if "video" in recs:
            context += f"\nVideo recommendations prepared: {len(recs['video'])} videos"
    
    return context
