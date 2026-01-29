# Weekly Memory Consolidation Task

## Objective
Strengthen cross-session links, form entity clusters, promote frequently-accessed entities, and archive old short-term entries.

## Execution Schedule
Runs weekly on Sunday at 04:00 AM via cron job `memory-weekly-consolidate`.

## Steps (Execute via specialists in CSP/1)

### 1. Identify High-Access Entities
Find entities accessed 3+ times in last 7 days:
```
TASK REQ:query_graph IN:MEM OUT:ENTITY_LIST
PARAMS {"operation": "high_access", "threshold": 3, "days": 7}
```

**Cypher Query:**
```cypher
MATCH (e:Entity)
WHERE duration.between(e.created_at, datetime()).days <= 7
  AND e.access_count >= 3
RETURN e.id, e.name, e.type, e.access_count, e.relevance
ORDER BY e.access_count DESC
```

**Expected Response:**
```
STATUS OK
SCOPE [memory,promotion]
DATA auth.ts:8,jwt-handler:6,session-store:5,token-utils:4,user-model:3
```

### 2. Promote High-Access Entities
Increase relevance and create stronger cross-links:
```
TASK REQ:promote IN:MEM OUT:CONFIRM
PARAMS {"entities": ["auth.ts","jwt-handler","session-store"], "boost": 0.2}
```

**Logic:**
- Increase relevance: `relevance = min(1.0, relevance + 0.2)`
- Strengthen existing links: `weight = min(1.0, weight + 0.1)`
- Create new links between co-accessed entities (weight: 0.6)
- Reset `access_count` after promotion

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA entities_promoted:3,links_strengthened:12,new_links:5
```

### 3. Form Entity Clusters
Use Neo4j graph algorithms to identify communities:
```
TASK REQ:query_graph IN:MEM OUT:CLUSTER_LIST
PARAMS {"operation": "find_clusters", "min_size": 3}
```

**Cypher Query (using GDS library):**
```cypher
CALL gds.wcc.stream({
  nodeProjection: 'Entity',
  relationshipProjection: {
    RELATED_TO: {type: 'RELATED_TO', properties: 'weight'}
  },
  relationshipWeightProperty: 'weight',
  threshold: 0.5
})
YIELD nodeId, componentId
WITH componentId, collect(gds.util.asNode(nodeId).name) as members
WHERE size(members) >= 3
RETURN componentId, members, size(members) as cluster_size
ORDER BY cluster_size DESC
```

**Expected Response:**
```
STATUS OK
SCOPE [memory,clusters]
DATA cluster_1:[auth.ts,jwt-handler,token-utils],cluster_2:[user-model,db-schema,migrations]
```

### 4. Create Cluster Super-Entities
For large clusters (>5 members), create abstract "concept" entity:
```
TASK REQ:add_entity IN:MEM OUT:ENTITY_ID
PARAMS {"name": "authentication-system", "type": "concept", "tags": ["auth","security","abstract"]}
```

Then link cluster members to super-entity:
```
TASK REQ:link IN:MEM OUT:CONFIRM
PARAMS {"entity1": "auth.ts", "entity2": "authentication-system", "type": "PART_OF", "weight": 0.9}
```

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA super_entity:authentication-system,members_linked:5
```

### 5. Archive Old Short-Term Entries
Move `memory/YYYY-MM-DD.md` entries >30 days to annual archive:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "cd ~/clawd/memory && find . -name '*.md' -mtime +30 -exec mv {} archive/$(date +%Y)/ \\;"
```

**Expected Response:**
```
STATUS OK
SCOPE [shell]
DATA exit:0
EXEC_TIME 156
STDOUT_SUMMARY "Moved 4 files to archive/2026/"
```

### 6. Update MEMORY.md with Key Learnings
Extract high-value insights from last week and append to MEMORY.md:
```
TASK REQ:recall IN:MEM OUT:MEM_REFS
PARAMS {"query": "important decisions learnings", "days_back": 7, "min_relevance": 0.8}
```

**Then synthesize and store:**
```
TASK REQ:store IN:MEM OUT:CONFIRM
CONTENT "Weekly insights: [synthesized learnings from high-relevance entries]"
TIER long
TAGS [weekly,synthesis,learning]
```

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA mem:weekly-synthesis-uuid
TIER_WRITTEN long
```

### 7. Analyze Memory Growth Trends
Compare stats week-over-week:
```
TASK REQ:query_graph IN:MEM OUT:STATS
PARAMS {"operation": "growth_trend", "weeks": 4}
```

**Metrics:**
- Entity count growth rate
- Relation count growth rate
- Average relevance trend
- Promotion frequency
- Decay effectiveness (entities removed / created)

**Expected Response:**
```
STATUS OK
SCOPE [memory,trends]
DATA entity_growth:+15%,relation_growth:+22%,avg_relevance_trend:stable,decay_effectiveness:0.12
RATIONALE Healthy growth, decay keeping pace with creation
```

### 8. Optimize Indexes
Rebuild Neo4j indexes for performance:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "cypher-shell -u neo4j -p <password> 'CALL db.index.fulltext.drop(\"entitySearch\"); CALL db.index.fulltext.createNodeIndex(\"entitySearch\", [\"Entity\"], [\"name\", \"tags\"]);'"
```

**Expected Response:**
```
STATUS OK
SCOPE [neo4j,maintenance]
DATA exit:0
EXEC_TIME 2345
STDOUT_SUMMARY "Index rebuilt successfully"
```

## Health Metrics

### Success Criteria
- High-access entities: 10-30 per week
- Promotions: 5-20 per week
- Clusters formed: 3-10 per week
- Growth rate: 10-20% per week (sustainable)
- Decay effectiveness: 0.1-0.2 (10-20% of created entities decay)

### Alert Triggers
- No high-access entities (usage problem)
- Growth rate >30% (unsustainable)
- Decay effectiveness <0.05 (not decaying enough)
- Decay effectiveness >0.4 (too aggressive)

## Performance Targets
- Total execution time: <10 minutes
- Cluster detection: <2 minutes
- Index rebuild: <3 minutes
- Memory footprint: <200MB

## Logging
All consolidation operations logged to:
- `memory/maintenance-logs/weekly-YYYY-MM-DD.jsonl`
- Summary appended to latest `memory/YYYY-MM-DD.md`
