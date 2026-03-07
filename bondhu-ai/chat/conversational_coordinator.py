"""
Conversational Coordinator - Coordinates agents to answer user queries.
Integrates chat system with multi-agent personality analysis.
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List

from core.agent_communication import get_communication_hub, AgentMessage, MessageType
from core.chat.conversational_router import ConversationalRouter, QueryIntent
from agents import MusicIntelligenceAgent, VideoIntelligenceAgent, GamingIntelligenceAgent, PersonalityAnalysisAgent

class ConversationalCoordinator:
    """
    Coordinates agents to answer conversational queries.
    Bridges the gap between chat and agent systems.
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.logger = logging.getLogger("bondhu.conversational_coordinator")
        self.router = ConversationalRouter()
        self.comm_hub = get_communication_hub()
        
        # Initialize agents
        self.agents = {}
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Initialize and register all agents."""
        try:
            self.agents["music"] = MusicIntelligenceAgent(user_id=self.user_id)
            self.agents["video"] = VideoIntelligenceAgent(user_id=self.user_id)
            self.agents["gaming"] = GamingIntelligenceAgent(user_id=self.user_id)
            self.agents["personality"] = PersonalityAnalysisAgent(user_id=self.user_id)
            
            # Register with communication hub
            for name, agent in self.agents.items():
                self.comm_hub.register_agent(name, agent)
                self.comm_hub.register_handler(name, self._create_agent_handler(agent))
            
            self.logger.info(f"Initialized {len(self.agents)} agents for user {self.user_id}")
        except Exception as e:
            self.logger.error(f"Error initializing agents: {e}")
    
    def _create_agent_handler(self, agent):
        """Create a message handler for an agent."""
        async def handler(message: AgentMessage) -> Dict[str, Any]:
            """Handle incoming messages for this agent."""
            if message.message_type == MessageType.QUERY:
                query = message.content.get("query")
                context = message.content.get("context", {})
                
                # Route to appropriate agent method
                if "preference" in query.lower():
                    data = await agent.collect_data()
                    return {"data": data, "agent": agent.agent_type.value}
                elif "recommend" in query.lower():
                    # Get recommendations
                    return {"recommendations": "placeholder", "agent": agent.agent_type.value}
            
            return {"status": "received", "agent": agent.agent_type.value}
        
        return handler
    
    async def process_query(self, query: str, conversation_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process a user query by routing to appropriate agents.
        
        Args:
            query: User's natural language query
            conversation_context: Previous conversation context
            
        Returns:
            Structured response with agent insights
        """
        try:
            # Detect intent
            intent, confidence = self.router.detect_intent(query)
            self.logger.info(f"Detected intent: {intent.value} (confidence: {confidence:.2f})")
            
            # Extract parameters
            params = self.router.extract_query_parameters(query, intent)
            
            # Get required agents
            required_agents = self.router.get_required_agents(intent)
            
            # Route to appropriate handler
            if intent == QueryIntent.MUSIC_PREFERENCE:
                return await self._handle_music_query(query, params)
            elif intent == QueryIntent.VIDEO_PREFERENCE:
                return await self._handle_video_query(query, params)
            elif intent == QueryIntent.GAMING_PREFERENCE:
                return await self._handle_gaming_query(query, params)
            elif intent == QueryIntent.PERSONALITY_INSIGHT:
                return await self._handle_personality_query(query, params)
            elif intent == QueryIntent.RECOMMENDATION:
                return await self._handle_recommendation_query(query, params)
            else:
                return await self._handle_general_query(query, params)
                
        except Exception as e:
            self.logger.error(f"Error processing query: {e}")
            return {
                "error": str(e),
                "fallback_response": "I'm having trouble accessing that information right now."
            }
    
    async def _handle_music_query(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle music-related queries."""
        music_agent = self.agents.get("music")
        if not music_agent:
            return {"error": "Music agent not available"}
        
        # Collect music data
        music_data = await music_agent.collect_data()
        
        # Format response
        response = {
            "intent": "music_preference",
            "data": {
                "top_tracks": music_data.get("top_tracks", [])[:5],
                "top_artists": music_data.get("top_artists", [])[:5],
                "genre_analysis": music_data.get("genre_analysis", {}),
                "listening_patterns": music_data.get("listening_patterns", {})
            },
            "natural_language_summary": self._generate_music_summary(music_data)
        }
        
        return response
    
    async def _handle_video_query(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle video-related queries."""
        video_agent = self.agents.get("video")
        if not video_agent:
            return {"error": "Video agent not available"}
        
        # Get video preferences
        video_data = await video_agent.collect_data()
        
        return {
            "intent": "video_preference",
            "data": video_data,
            "natural_language_summary": "Your video preferences analysis"
        }
    
    async def _handle_gaming_query(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle gaming-related queries."""
        gaming_agent = self.agents.get("gaming")
        if not gaming_agent:
            return {"error": "Gaming agent not available"}
        
        gaming_data = await gaming_agent.collect_data()
        
        return {
            "intent": "gaming_preference",
            "data": gaming_data,
            "natural_language_summary": "Your gaming preferences analysis"
        }
    
    async def _handle_personality_query(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle personality insight queries."""
        personality_agent = self.agents.get("personality")
        if not personality_agent:
            return {"error": "Personality agent not available"}
        
        # Get personality context
        personality_context = await personality_agent.get_personality_context()
        
        return {
            "intent": "personality_insight",
            "data": personality_context,
            "natural_language_summary": "Your personality insights"
        }
    
    async def _handle_recommendation_query(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle recommendation queries - requires agent collaboration.
        Example: "What music should I listen to based on my personality?"
        """
        # Get personality context first
        personality_agent = self.agents.get("personality")
        personality_context = await personality_agent.get_personality_context()
        
        if not personality_context or not personality_context.personality_profile:
            return {"error": "Personality profile not available"}
        
        personality_profile = personality_context.personality_profile
        
        # Determine what type of recommendation
        recommendations = {}
        
        if "music" in query.lower():
            music_agent = self.agents.get("music")
            # Agent collaboration: Music agent uses personality data
            music_recs = await music_agent.get_recommendations_by_genre(
                personality_profile=personality_profile.scores,
                songs_per_genre=3
            )
            recommendations["music"] = music_recs
        
        if "video" in query.lower():
            video_agent = self.agents.get("video")
            # Agent collaboration: Video agent uses personality data
            video_recs = await video_agent.get_personalized_recommendations(
                personality_profile=personality_profile.scores,
                watch_history=[],
                max_results=10
            )
            recommendations["video"] = video_recs
        
        return {
            "intent": "recommendation",
            "recommendations": recommendations,
            "personality_context": personality_profile.scores,
            "natural_language_summary": self._generate_recommendation_summary(recommendations)
        }
    
    async def _handle_general_query(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle general chat queries."""
        return {
            "intent": "general_chat",
            "requires_llm": True,
            "query": query
        }
    
    def _generate_music_summary(self, music_data: Dict[str, Any]) -> str:
        """Generate natural language summary of music preferences."""
        top_artists = music_data.get("top_artists", [])[:3]
        genres = music_data.get("genre_analysis", {})
        
        if not top_artists:
            return "I don't have enough music data yet to describe your preferences."
        
        artist_names = [artist.get("name", "Unknown") for artist in top_artists]
        top_genre = max(genres.items(), key=lambda x: x[1])[0] if genres else "various genres"
        
        summary = f"You love listening to {', '.join(artist_names)}. "
        summary += f"Your music taste leans towards {top_genre}. "
        
        diversity = music_data.get("listening_patterns", {}).get("diversity_score", 0)
        if diversity > 0.7:
            summary += "You have very diverse musical tastes!"
        elif diversity < 0.3:
            summary += "You tend to stick with your favorite artists."
        
        return summary
    
    def _generate_recommendation_summary(self, recommendations: Dict[str, Any]) -> str:
        """Generate natural language summary of recommendations."""
        summary_parts = []
        
        if "music" in recommendations:
            music_count = sum(len(songs) for songs in recommendations["music"].values())
            summary_parts.append(f"{music_count} music recommendations")
        
        if "video" in recommendations:
            video_count = len(recommendations["video"])
            summary_parts.append(f"{video_count} video recommendations")
        
        if summary_parts:
            return f"I've prepared {' and '.join(summary_parts)} based on your personality!"
        
        return "Here are some recommendations for you!"
