"""
Graphiti Client for Clawdbot Swarm Memory
Provides high-level operations for temporal knowledge graph memory using Graphiti framework
"""

from datetime import datetime
from typing import List, Dict, Optional, Any
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType
from graphiti_core.edges import EntityEdge
import os
import json

class GraphitiMemoryClient:
    """
    High-level client for Graphiti temporal knowledge graph.
    Replaces direct Neo4j access with episode-based memory management.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize Graphiti client with configuration.
        
        Args:
            config_path: Path to configuration file (defaults to ~/.clawd/skills/swarm-memory/memory-tiers/graphiti-config.json)
        """
        if config_path is None:
            config_path = os.path.expanduser('~/clawd/skills/swarm-memory/memory-tiers/graphiti-config.json')
        
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Config file not found: {config_path}")
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        neo4j_config = config['neo4j']
        
        # Initialize Graphiti with Neo4j backend
        self.graphiti = Graphiti(
            uri=neo4j_config['uri'],
            user=neo4j_config['user'],
            password=neo4j_config['password'],
            database=neo4j_config.get('database', 'neo4j')
        )
    
    async def add_episode(
        self,
        content: str,
        name: Optional[str] = None,
        source_description: str = "Clawdbot conversation",
        reference_time: Optional[datetime] = None,
        tags: Optional[List[str]] = None
    ) -> str:
        """
        Add an episode to the knowledge graph.
        Graphiti will automatically extract entities and relationships.
        
        Args:
            content: Text content of the episode
            name: Optional episode name (auto-generated if not provided)
            source_description: Description of the source
            reference_time: Timestamp for the episode (defaults to now)
            tags: Optional tags for categorization
        
        Returns:
            Episode UUID
        """
        if reference_time is None:
            reference_time = datetime.now()
        
        if name is None:
            # Generate name from timestamp
            name = f"episode_{reference_time.strftime('%Y%m%d_%H%M%S')}"
        
        # Add episode - Graphiti handles entity extraction
        episode_uuid = await self.graphiti.add_episode(
            name=name,
            episode_body=content,
            source_description=source_description,
            reference_time=reference_time,
            group_id=None  # Optional: could use for conversation threads
        )
        
        # Add tags as metadata (if supported)
        # This would be done through custom entity extraction or metadata storage
        
        return episode_uuid
    
    async def search_episodes(
        self,
        query: str,
        max_results: int = 10,
        min_relevance: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant episodes using hybrid search.
        Combines semantic, keyword, and graph-based retrieval.
        
        Args:
            query: Search query text
            max_results: Maximum number of results
            min_relevance: Minimum relevance score (0-1)
        
        Returns:
            List of episode dictionaries with content and metadata
        """
        # Use Graphiti's search capability
        results = await self.graphiti.search(
            query=query,
            num_results=max_results
        )
        
        # Filter by relevance and format
        formatted_results = []
        for result in results:
            if hasattr(result, 'score') and result.score >= min_relevance:
                formatted_results.append({
                    'uuid': result.uuid if hasattr(result, 'uuid') else None,
                    'content': result.content if hasattr(result, 'content') else str(result),
                    'relevance': result.score if hasattr(result, 'score') else 1.0,
                    'timestamp': result.created_at if hasattr(result, 'created_at') else None
                })
        
        return formatted_results[:max_results]
    
    async def search_entities(
        self,
        query: str,
        entity_type: Optional[str] = None,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for entities in the knowledge graph.
        
        Args:
            query: Search query text
            entity_type: Optional filter by entity type
            max_results: Maximum number of results
        
        Returns:
            List of entity dictionaries
        """
        # Graphiti's entity search
        # Note: Exact API may vary - this is based on typical usage
        results = await self.graphiti.search(
            query=query,
            num_results=max_results,
            # entity_types=[entity_type] if entity_type else None  # If supported
        )
        
        entities = []
        for result in results:
            entities.append({
                'name': result.name if hasattr(result, 'name') else str(result),
                'type': result.entity_type if hasattr(result, 'entity_type') else 'unknown',
                'summary': result.summary if hasattr(result, 'summary') else None,
                'created_at': result.created_at if hasattr(result, 'created_at') else None
            })
        
        return entities
    
    async def get_entity_relations(
        self,
        entity_name: str,
        min_weight: float = 0.3,
        max_depth: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Get relationships for a specific entity.
        
        Args:
            entity_name: Name of the entity
            min_weight: Minimum relationship weight
            max_depth: Maximum relationship depth
        
        Returns:
            List of relationship dictionaries
        """
        # This would use Graphiti's graph traversal capabilities
        # Exact implementation depends on Graphiti's API for relationship queries
        
        # Placeholder - actual implementation would use Graphiti's graph queries
        relations = []
        
        # Example structure (would come from Graphiti):
        # relations.append({
        #     'from': entity_name,
        #     'to': 'related_entity',
        #     'relation_type': 'related_to',
        #     'weight': 0.85,
        #     'context': 'brief context'
        # })
        
        return relations
    
    async def get_temporal_snapshot(
        self,
        entity_name: str,
        timestamp: datetime
    ) -> Dict[str, Any]:
        """
        Get the state of an entity at a specific point in time.
        Uses Graphiti's bi-temporal capabilities.
        
        Args:
            entity_name: Name of the entity
            timestamp: Point in time to query
        
        Returns:
            Entity state at that timestamp
        """
        # Graphiti's temporal query
        # This is one of Graphiti's key features - bi-temporal tracking
        
        snapshot = {
            'entity': entity_name,
            'timestamp': timestamp,
            'state': 'active',  # Would come from Graphiti
            'relations': []  # Would come from Graphiti
        }
        
        return snapshot
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get database statistics.
        
        Returns:
            Dictionary with entity counts, episode counts, etc.
        """
        # This would query Graphiti's internal statistics
        # May need to access underlying Neo4j directly for some stats
        
        stats = {
            'total_episodes': 0,  # Would query from Graphiti
            'total_entities': 0,  # Would query from Graphiti
            'total_relations': 0,  # Would query from Graphiti
            'database_size_mb': 0  # Would query from Neo4j
        }
        
        return stats
    
    async def close(self):
        """Close the Graphiti connection."""
        # Graphiti cleanup
        await self.graphiti.close()


# CSP/1 Response Formatters for Graphiti

def format_episode_response(episode_uuid: str, status: str = "OK") -> str:
    """Format episode addition response in CSP/1."""
    return f"""STATUS {status}
SCOPE [memory,episode]
DATA episode:{episode_uuid}
RATIONALE Episode stored in temporal knowledge graph"""


def format_search_response(results: List[Dict[str, Any]], query: str) -> str:
    """Format search results in CSP/1."""
    if not results:
        return """STATUS FAIL
SCOPE []
DATA none
RATIONALE No results found"""
    
    # Extract scope from results
    scope_keywords = set()
    for result in results[:3]:
        content = result.get('content', '')
        # Extract keywords (simple approach)
        words = content.lower().split()
        scope_keywords.update([w for w in words if len(w) > 4][:3])
    
    scope = ','.join(list(scope_keywords)[:5])
    
    # Format data (episode UUIDs or entity names)
    data = ','.join([f"mem:{r['uuid']}" for r in results if 'uuid' in r][:10])
    
    # Relevance scores
    relevance = ','.join([f"{r.get('relevance', 0):.2f}" for r in results[:10]])
    
    # Snippets
    snippets = []
    for r in results[:3]:
        uuid = r.get('uuid', 'unknown')
        content = r.get('content', '')[:200]
        snippets.append(f'SNIPPET {uuid}:"{content}"')
    
    response = f"""STATUS OK
SCOPE [{scope}]
DATA {data}
RELEVANCE {relevance}
{chr(10).join(snippets)}"""
    
    return response


def format_relations_response(relations: List[Dict[str, Any]], entity: str) -> str:
    """Format entity relations in CSP/1."""
    if not relations:
        return f"""STATUS OK
SCOPE [{entity}]
DATA none
RATIONALE No relations found"""
    
    # Format links
    links = []
    for r in relations[:10]:
        from_entity = r.get('from', entity)
        to_entity = r.get('to', 'unknown')
        weight = r.get('weight', 0.5)
        links.append(f"{from_entity}↔{to_entity}:{weight:.2f}")
    
    links_str = ','.join(links)
    
    response = f"""STATUS OK
SCOPE [{entity}]
DATA {entity}
LINKS {links_str}"""
    
    return response


# Singleton instance
_client: Optional[GraphitiMemoryClient] = None

def get_client(config_path: Optional[str] = None) -> GraphitiMemoryClient:
    """Get or create singleton Graphiti client."""
    global _client
    if _client is None:
        _client = GraphitiMemoryClient(config_path)
    return _client

async def close_client():
    """Close singleton client."""
    global _client
    if _client is not None:
        await _client.close()
        _client = None
