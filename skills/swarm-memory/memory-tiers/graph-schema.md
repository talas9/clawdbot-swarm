# Memory Graph Schema (Graphiti)

## Entity Types

Graphiti auto-extracts entities from episodes, but custom types can be defined via Pydantic models.

### Default Entity Types
- **File** - Source code files, documents
- **Concept** - Abstract ideas, topics, patterns
- **Person** - Users, collaborators, authors
- **Project** - Named projects, repositories
- **Decision** - Recorded decisions, architectural choices
- **Preference** - User preferences, settings
- **Event** - Timestamped occurrences, milestones

### Entity Properties
```python
{
  "uuid": str,                     # Unique identifier (auto-generated)
  "name": str,                     # Human-readable name
  "entity_type": str,              # One of the types above (or custom)
  "summary": str,                  # Brief description (LLM-generated)
  "created_at": datetime,          # Creation timestamp
  "valid_from": datetime,          # When this entity became valid
  "valid_to": Optional[datetime],  # null = currently valid
  "embedding": List[float],        # Semantic embedding vector
  "group_ids": List[str]          # Group membership (for filtering)
}
```

## Relation Types

Graphiti auto-extracts relationship types but supports predefined types for consistency.

### Default Relationship Types
- **RELATED_TO** - Generic association (default)
- **DEPENDS_ON** - Dependency relationship (code, tasks)
- **PART_OF** - Hierarchical containment
- **CAUSED_BY** - Causal relationship
- **SIMILAR_TO** - Semantic similarity
- **CONTRADICTS** - Conflicting information (invalidates previous)
- **IMPLEMENTS** - Implementation relationship
- **USES** - Usage relationship
- **OCCURRED_AFTER** - Temporal sequencing

### Relationship Properties
```python
{
  "uuid": str,                     # Unique identifier
  "source_node_uuid": str,         # Source entity UUID
  "target_node_uuid": str,         # Target entity UUID
  "relation_type": str,            # Relationship type
  "fact": str,                     # Human-readable description
  "created_at": datetime,          # Creation timestamp
  "valid_from": datetime,          # When relation became valid
  "valid_to": Optional[datetime],  # null = currently valid
  "expired_at": Optional[datetime], # Set when invalidated
  "embedding": List[float],        # Semantic embedding of fact
  "episodes": List[str]            # Episode UUIDs that mention this
}
```

## Temporal Model

Graphiti uses **bi-temporal tracking**:
1. **Valid time**: When the fact was true in the real world
2. **Transaction time**: When Graphiti learned about it

### Example
```python
# Episode 1 (Jan 1): "auth.ts depends on token.ts"
# Creates relation with valid_from=Jan 1, expired_at=null

# Episode 2 (Jan 15): "auth.ts now depends on jwt-utils.ts instead"
# Invalidates old relation: sets expired_at=Jan 15
# Creates new relation: valid_from=Jan 15
```

This allows point-in-time queries: "What did auth.ts depend on as of Jan 10?"

## Weight/Relevance Model

Graphiti doesn't use explicit "weights" but calculates relevance via:

### Hybrid Search Scoring
1. **Semantic similarity** (embedding cosine distance)
2. **Keyword matching** (BM25 full-text search)
3. **Graph proximity** (distance from query entities)
4. **Temporal recency** (newer facts score higher)
5. **Episode frequency** (mentioned in multiple episodes)

### Relevance Decay
- Facts not accessed decay naturally via temporal filtering
- Use `valid_to` and `expired_at` for explicit invalidation
- Graphiti's maintenance routines prune stale data

## Integration Patterns

### Adding Episodes

**Text-based (auto-extraction):**
```python
await graphiti.add_episode(
    content="Fixed JWT refresh bug - auth.ts now checks expiry before rotation",
    source_description="Code commit",
    reference_time=datetime.now(),
    group_id="project-auth"
)
# Graphiti extracts: auth.ts (File), JWT (Concept), refresh bug (Event)
# Relations: auth.ts IMPLEMENTS JWT, refresh bug CAUSED_BY auth.ts
```

**Structured JSON (explicit entities):**
```python
await graphiti.add_episode(
    content={
        "entities": [
            {"name": "auth.ts", "type": "File"},
            {"name": "token.ts", "type": "File"}
        ],
        "relations": [
            {
                "source": "auth.ts",
                "target": "token.ts",
                "type": "DEPENDS_ON",
                "fact": "auth.ts depends on token.ts for session handling"
            }
        ]
    },
    source_description="Architecture doc",
    reference_time=datetime.now()
)
```

### Querying the Graph

**Entity search:**
```python
# Hybrid search (semantic + keyword + graph)
results = await graphiti.search_entities(
    query="authentication files",
    num_results=10,
    group_ids=["project-auth"]
)
# Returns: [Entity(name="auth.ts", summary="...", score=0.89), ...]
```

**Relationship search:**
```python
results = await graphiti.search_edges(
    query="auth dependencies",
    num_results=10
)
# Returns: [Edge(source="auth.ts", target="token.ts", fact="...", score=0.85), ...]
```

**Build context (subgraph):**
```python
context = await graphiti.build_context(
    entity_names=["auth.ts"],
    max_facts=20
)
# Returns: Subgraph of entities/relations related to auth.ts
```

**Point-in-time query:**
```python
context = await graphiti.build_context(
    entity_names=["auth.ts"],
    max_facts=20,
    reference_time=datetime(2026, 1, 10)  # What was true on Jan 10?
)
```

## Maintenance Operations

### Invalidation (Handle Contradictions)
```python
# When new episode contradicts old information:
# Graphiti automatically sets expired_at on old relation
await graphiti.add_episode(
    content="auth.ts no longer depends on token.ts, now uses jwt-utils.ts",
    reference_time=datetime.now()
)
# Old relation marked as expired
```

### Pruning Stale Data
```python
# Remove invalidated relations older than 90 days
# (Not exposed via public API - handled by Graphiti maintenance)
# Implement via custom Cypher if needed:
MATCH ()-[r:Relation]-()
WHERE r.expired_at IS NOT NULL 
  AND duration.between(r.expired_at, datetime()).days > 90
DELETE r
```

### Reranking Search Results
```python
# Graphiti supports reranking via cross-encoder
results = await graphiti.search_edges(
    query="auth token flow",
    num_results=20,
    rerank=True,  # Use cross-encoder for better precision
    center_node_uuid="<auth_entity_uuid>"
)
```

## Custom Entity Definitions

Define domain-specific entities via Pydantic:

```python
from pydantic import BaseModel

class CodeFile(BaseModel):
    name: str
    path: str
    language: str
    last_modified: datetime

class BugReport(BaseModel):
    id: str
    title: str
    severity: str
    status: str

# Pass to Graphiti during episode ingestion
# (Implementation details depend on Graphiti API version)
```

## Performance Optimization

### Indexing
Graphiti automatically creates:
- **Full-text indexes** on entity names and facts (BM25)
- **Vector indexes** on embeddings (HNSW for ANN search)
- **Graph indexes** on UUIDs and types

### Query Patterns

**Efficient:**
```python
# Use group_ids for filtering (avoids full graph scan)
results = await graphiti.search_entities(
    query="bug fixes",
    group_ids=["project-auth", "sprint-12"]
)

# Bounded context retrieval
context = await graphiti.build_context(
    entity_names=["auth.ts"],
    max_facts=20  # Limit results
)
```

**Avoid:**
```python
# Don't fetch entire graph
all_entities = await graphiti.get_entities()  # NO!

# Don't iterate all relationships
for edge in await graphiti.get_edges():  # NO!
    # Process...
```

### Batch Operations
```python
# Add multiple episodes in parallel
episodes = [
    {"content": "...", "source": "...", "reference_time": ...},
    {"content": "...", "source": "...", "reference_time": ...},
]

# Graphiti handles parallelism internally via SEMAPHORE_LIMIT
for episode in episodes:
    await graphiti.add_episode(**episode)
```

## Monitoring & Health Checks

### Entity Count
```python
# Via Graphiti API (if exposed)
stats = await graphiti.get_stats()
print(f"Entities: {stats['entity_count']}")
print(f"Relations: {stats['edge_count']}")
print(f"Episodes: {stats['episode_count']}")
```

### Stale Data Detection
```python
# Find entities not accessed in 60+ days
# (Implementation via custom Cypher or Graphiti maintenance API)
MATCH (e:Entity)
WHERE duration.between(e.valid_from, datetime()).days > 60
  AND NOT EXISTS((e)-[:Relation]-())
RETURN e.name, e.entity_type, e.valid_from
```

## Migration from Neo4j

If migrating from raw Neo4j to Graphiti:

1. **Export Neo4j entities/relations** to JSONL
2. **Convert to Graphiti episodes**:
   ```python
   for item in old_data:
       await graphiti.add_episode(
           content=item["fact"],
           source_description="Migration",
           reference_time=item["created_at"]
       )
   ```
3. **Validate extraction**: Check that entities/relations match
4. **Archive old Neo4j database** as backup

## References

- **Graphiti GitHub**: https://github.com/getzep/graphiti
- **Graphiti Docs**: https://help.getzep.com/graphiti
- **Paper**: [Zep: A Temporal Knowledge Graph Architecture](https://arxiv.org/abs/2501.13956)
- **MCP Server**: https://github.com/getzep/graphiti/tree/main/mcp_server
