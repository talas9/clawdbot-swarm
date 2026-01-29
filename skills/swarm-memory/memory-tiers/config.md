# Memory Tier Configuration

## Tier Definitions

### Ultra-Short (Active Context)
- **Location:** In-context (LLM prompt)
- **Size:** 4-8k tokens max
- **Persistence:** Current conversation only
- **Access:** Direct (no specialist needed)
- **Content:** Unresolved thread, immediate task state
- **Storage:** Ephemeral (RAM only)

### Short-Term (Session Summaries)
- **Location:** memory/YYYY-MM-DD.md
- **Size:** ~50-100 entries per day
- **Persistence:** 7 days active, then decay
- **Access:** Memory Specialist only
- **Content:** One-sentence summaries, keywords, session markers
- **Storage:** Markdown files

**Format per entry:**
```markdown
## HH:MM - <topic>
<one_sentence_summary>
Tags: #tag1 #tag2
Links: [[related_entry]]
```

### Medium-Term (Graphiti Knowledge Graph)
- **Location:** Graphiti temporal knowledge graph (Neo4j backend)
- **Size:** Unlimited (auto-pruned via temporal decay)
- **Persistence:** Until explicitly invalidated or aged out
- **Access:** Memory Specialist only (via MCP server)
- **Content:** Entity/relation network with temporal tracking
- **Storage:** Neo4j database + vector embeddings

**Graphiti Architecture:**
```python
{
  "entities": [
    {
      "uuid": "<auto_generated>",
      "name": "auth.ts",
      "entity_type": "File",
      "summary": "Authentication module with JWT handling",
      "valid_from": "2026-01-15T10:00:00Z",
      "valid_to": null,  # null = currently valid
      "embedding": [0.1, 0.2, ...]  # Semantic vector
    }
  ],
  "relationships": [
    {
      "uuid": "<auto_generated>",
      "source_node_uuid": "<entity_uuid>",
      "target_node_uuid": "<entity_uuid>",
      "relation_type": "DEPENDS_ON",
      "fact": "auth.ts depends on token.ts for session handling",
      "valid_from": "2026-01-15T10:00:00Z",
      "expired_at": null,  # Set when invalidated
      "embedding": [0.3, 0.4, ...]
    }
  ]
}
```

### Long-Term (Curated Knowledge)
- **Location:** MEMORY.md
- **Size:** <5000 tokens recommended
- **Persistence:** Permanent until manual edit
- **Access:** Memory Specialist only (main session)
- **Content:** Durable facts, preferences, decisions
- **Storage:** Markdown file

### Archive (Raw Logs)
- **Location:** ~/.clawdbot/agents/<agentId>/sessions/*.jsonl
- **Size:** Unlimited
- **Persistence:** Permanent
- **Access:** Explicit deep-dive only
- **Content:** Complete conversation transcripts
- **Storage:** JSONL append-only logs

## Migration Rules

### Upward (Long-term strengthening)
**Trigger:** Entity/relation accessed 3+ times in 7 days

**Action:** Promote to next tier

**Examples:**
- **Short → Medium:** Create Graphiti episode from daily log entry
- **Medium → Long:** Extract key facts to MEMORY.md

**Implementation:**
```python
# Daily maintenance: Check access patterns in Graphiti
results = await graphiti.search(
    query="frequently accessed",
    group_ids=["recent"]
)

# Entities with high access count → add to MEMORY.md
for entity in results:
    if entity.access_count >= 3 and entity.age_days >= 7:
        append_to_memory_md(entity.summary)
```

### Downward (Decay)
**Trigger:** Entity/relation not accessed in decay period

**Action:** Mark as expired (temporal invalidation)

**Thresholds:**
- **Short:** 7 days → remove from active daily logs
- **Medium:** 90 days → mark as expired in Graphiti
- **Long:** Never auto-decay

**Graphiti Temporal Decay:**
```python
# Graphiti handles decay via temporal queries
# Old facts automatically excluded from search results
# Explicit invalidation via expired_at field

# Example: Mark fact as expired
await graphiti.add_episode(
    content="The dependency on token.ts is no longer valid",
    reference_time=datetime.now()
)
# Graphiti auto-sets expired_at on old relation
```

### Deletion
**Trigger:** Expired for 90+ days AND no references

**Action:** Prune from graph (archive preserved in session logs)

**Graphiti Implementation:**
```python
# Manual pruning (via custom Cypher or Graphiti API)
# Remove expired relations older than 90 days
MATCH ()-[r:Relation]-()
WHERE r.expired_at IS NOT NULL
  AND duration.between(r.expired_at, datetime()).days > 90
DELETE r
RETURN count(r) as deleted
```

## Graphiti Configuration

### Connection Settings
**Via MCP Server** (recommended):
```json
{
  "mcpServers": {
    "graphiti": {
      "command": "uvx",
      "args": ["graphiti-mcp-server"],
      "env": {
        "OPENAI_API_KEY": "<your_key>",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "<secure_password>"
      }
    }
  }
}
```

**Direct Graphiti Client** (for custom implementations):
```python
from graphiti_core import Graphiti

graphiti = Graphiti(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="<secure_password>",
    llm_client=llm_client,  # OpenAI, Azure, Anthropic, etc.
    embedder=embedder_client  # For semantic search
)

await graphiti.build_indices_and_constraints()
```

### Performance Tuning

**Neo4j Backend:**
```properties
# neo4j.conf
dbms.memory.heap.initial_size=512m
dbms.memory.heap.max_size=2g
dbms.memory.pagecache.size=1g
dbms.default_listen_address=0.0.0.0
```

**Graphiti Concurrency:**
```bash
# Adjust based on LLM rate limits
export SEMAPHORE_LIMIT=10  # Default: conservative
export SEMAPHORE_LIMIT=50  # If you have high rate limits
```

**Embedding Model:**
```python
# Faster but less accurate
embedder = OpenAIEmbedder(model="text-embedding-3-small", dimensions=512)

# Slower but more accurate
embedder = OpenAIEmbedder(model="text-embedding-3-large", dimensions=3072)
```

### Backup Strategy
- **Automatic:** Neo4j native backups (daily at 3 AM)
- **Manual:** Export episodes to JSONL before major changes
- **Retention:** 7 daily, 4 weekly, 12 monthly
- **Location:** memory/graphiti-backups/

```bash
# Neo4j backup
neo4j-admin backup --database=neo4j --to=/path/to/backup

# Graphiti export (if API available)
python -m graphiti_core export --output episodes.jsonl
```

## Access Patterns

### Recall (Read-Heavy)

**Via MCP Server:**
```python
# Memory Specialist sends CSP/1 request:
TASK REQ:recall auth dependencies IN:MEM OUT:MEM_REFS
PARAMS {"max_results": 10}

# MCP server executes:
results = await graphiti.search(
    query="auth dependencies",
    num_results=10,
    rerank=True
)

# Returns CSP/1:
STATUS OK
SCOPE [auth,token,jwt]
DATA edge:uuid1,edge:uuid2
RELEVANCE 0.89,0.76
SNIPPET uuid1:"auth.ts depends on token.ts for session handling"
```

**Direct Graphiti API:**
```python
# Hybrid search (semantic + keyword + graph)
entity_results = await graphiti.search(
    query="authentication components",
    num_results=10
)

edge_results = await graphiti.search(
    query="auth dependencies",
    num_results=10,
    rerank=True  # Use cross-encoder for precision
)

# Build context subgraph
context = await graphiti.search(
    entity_names=["auth.ts"],
    max_facts=20
)
```

### Store (Write-Heavy)

**Adding Episodes:**
```python
# Text-based (auto-extraction)
await graphiti.add_episode(
    content="Fixed JWT refresh bug in auth.ts by adding expiry check",
    source_description="Code commit",
    reference_time=datetime.now(),
    group_id="project-auth"
)

# Structured (explicit entities/relations)
await graphiti.add_episode(
    content={
        "entities": [
            {"name": "auth.ts", "type": "File"},
            {"name": "JWT refresh", "type": "Event"}
        ],
        "relations": [
            {
                "source": "auth.ts",
                "target": "JWT refresh",
                "type": "CAUSED_BY",
                "fact": "JWT refresh bug fixed in auth.ts"
            }
        ]
    },
    source_description="Manual entry",
    reference_time=datetime.now()
)
```

### Link (Relationship Management)

**Implicit via Episodes:**
```python
# Graphiti auto-extracts relations from text
await graphiti.add_episode(
    content="auth.ts now depends on jwt-utils.ts instead of token.ts",
    reference_time=datetime.now()
)
# Creates new relation + invalidates old one
```

**Explicit via Structured Episodes:**
```python
await graphiti.add_episode(
    content={
        "relations": [
            {
                "source": "auth.ts",
                "target": "jwt-utils.ts",
                "type": "DEPENDS_ON",
                "fact": "auth.ts migrated to jwt-utils.ts for better modularity"
            }
        ]
    },
    reference_time=datetime.now()
)
```

## Scaling Considerations

### Growth Projections
- **Entities:** ~1000/month → 12k/year
- **Relations:** ~5000/month → 60k/year
- **Episodes:** ~500/month → 6k/year
- **Queries:** ~100/day → 3k/month

### Graphiti Optimizations

**Vector Indexing:**
- Graphiti uses HNSW (Hierarchical Navigable Small World) for ANN search
- Automatically created via `build_indices_and_constraints()`
- Sub-second semantic search on 100k+ entities

**Full-Text Search:**
- BM25 indexing on entity names and relation facts
- Combined with semantic search for hybrid retrieval
- Boosts precision for keyword-heavy queries

**Graph Traversal:**
- Efficient subgraph extraction via `search()` with center_node_uuid
- Bounded depth to prevent exponential explosion
- Temporal filtering reduces search space

### Partitioning (Future)
When entity count > 100k:
- Use `group_ids` for logical partitioning (projects, teams, time periods)
- Separate Graphiti instances for different domains
- Time-based archival (>1 year old → read-only instance)

## Monitoring

### Health Checks

**Via Graphiti Stats:**
```python
stats = await graphiti.get_stats()
print(f"Entities: {stats['entity_count']}")
print(f"Relations: {stats['edge_count']}")
print(f"Episodes: {stats['episode_count']}")
```

**Via Neo4j Cypher:**
```cypher
// Entity count by type
MATCH (e:Entity)
RETURN e.entity_type as type, count(e) as count
ORDER BY count DESC

// Expired relations
MATCH ()-[r:Relation]-()
WHERE r.expired_at IS NOT NULL
RETURN count(r) as expired_count
```

### Performance Metrics
- **Query latency** (p50, p95, p99)
- **Episode ingestion rate** (episodes/second)
- **Search relevance** (precision@10)
- **Entity growth rate** (entities/day)
- **Decay effectiveness** (expired relations/day)

**Tracking:**
```python
# Log metrics to memory/metrics/YYYY-MM-DD.jsonl
{
  "timestamp": "2026-01-29T12:00:00Z",
  "query_latency_p95": 0.15,  # seconds
  "entity_count": 5432,
  "edge_count": 12890,
  "episode_count": 892
}
```

## Migration Patterns

### From Raw Neo4j to Graphiti

**Step 1: Export Neo4j entities/relations**
```cypher
// Export entities
MATCH (e:Entity)
RETURN e.name, e.type, e.created_at

// Export relations
MATCH (e1:Entity)-[r:RELATED_TO]->(e2:Entity)
RETURN e1.name, type(r), e2.name, r.context, r.weight
```

**Step 2: Convert to Graphiti episodes**
```python
for relation in old_relations:
    await graphiti.add_episode(
        content=f"{relation['source']} {relation['type']} {relation['target']}. Context: {relation['context']}",
        source_description="Migration from Neo4j",
        reference_time=relation['created_at']
    )
```

**Step 3: Validate extraction**
```python
# Search for migrated entities
results = await graphiti.search(query=old_entity_name)
assert results[0].name == old_entity_name
```

### From JSONL to Graphiti

**Step 1: Read JSONL logs**
```python
import jsonlines

with jsonlines.open('memory/relations.jsonl') as reader:
    for entry in reader:
        # Convert to episode
        await graphiti.add_episode(
            content=entry['fact'],
            source_description="JSONL migration",
            reference_time=entry['timestamp']
        )
```

## Maintenance Schedules

### Daily (Automated)
- Graphiti auto-manages temporal decay (no manual work)
- Check query latency metrics
- Review episode ingestion logs
- Backup Neo4j database

### Weekly (Automated)
- Promote high-access entities to MEMORY.md
- Generate weekly summary episode
- Archive old daily logs (>7 days)
- Optimize Neo4j indexes (auto-analyze)

### Monthly (Automated)
- Full Neo4j backup
- Prune expired relations (>90 days)
- Generate monthly analytics report
- Meta-optimizer adjustments (see maintenance/optimizer.md)

## Configuration Files

**MCP Server Config:** `~/.config/claude/mcp_config.json` (or equivalent)
```json
{
  "mcpServers": {
    "graphiti": {
      "command": "uvx",
      "args": ["graphiti-mcp-server"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "${NEO4J_PASSWORD}"
      }
    }
  }
}
```

**Graphiti Python Config:** `memory/graphiti-config.json`
```json
{
  "graph_uri": "bolt://localhost:7687",
  "graph_user": "neo4j",
  "graph_password": "<secure_password>",
  "llm_provider": "openai",
  "embedder": "openai",
  "embedding_model": "text-embedding-3-small",
  "embedding_dimensions": 1536,
  "concurrency_limit": 10,
  "decay": {
    "short_term_days": 7,
    "medium_term_days": 90
  },
  "promotion": {
    "min_access_count": 3,
    "min_age_days": 7
  }
}
```

## References

- **Graphiti GitHub**: https://github.com/getzep/graphiti
- **Graphiti MCP Server**: https://github.com/getzep/graphiti/tree/main/mcp_server
- **Neo4j Configuration**: https://neo4j.com/docs/operations-manual/current/configuration/
- **Zep Platform** (managed Graphiti): https://www.getzep.com
