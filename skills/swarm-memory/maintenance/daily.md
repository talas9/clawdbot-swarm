# Daily Memory Maintenance Task

## Objective
Perform routine memory hygiene to keep the system efficient and prevent unbounded growth.

## Execution Schedule
Runs daily at 03:00 AM via cron job `memory-daily-sweep`.

## Steps (Execute via specialists in CSP/1)

### 1. Decay Check (Neo4j)
```
TASK REQ:decay IN:MEM OUT:STATS
PARAMS {"days_inactive": 7, "decay_rate": 0.1, "threshold": 0.1}
```

**Expected Response:**
```
STATUS OK
SCOPE [memory,neo4j]
DATA entities_decayed:23,relations_decayed:45
```

### 2. Find Duplicate Entities
```
TASK REQ:find_duplicates IN:MEM OUT:DUPLICATE_PAIRS
PARAMS {"similarity_threshold": 0.9, "type": "all"}
```

**Logic:**
- Compare entity names (Levenshtein distance < 3)
- Compare tags (Jaccard similarity > 0.8)
- Compare creation dates (within 1 hour)

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA auth.ts|auth-utils.ts,jwt-handler|jwt_handler
RATIONALE 2 duplicate pairs found based on name similarity
```

### 3. Merge Duplicates
For each duplicate pair, merge to keep higher-relevance entity:
```
TASK REQ:merge IN:MEM OUT:CONFIRM
PARAMS {"keep": "auth.ts", "remove": "auth-utils.ts"}
```

**Merge Logic:**
1. Transfer all relationships from `remove` to `keep`
2. Combine tags (union)
3. Keep higher relevance score
4. Update `last_accessed` to most recent
5. Delete `remove` entity

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA merged:auth.ts,removed:auth-utils.ts,relations_transferred:5
```

### 4. Orphan Links Cleanup
Find and remove relationships to deleted entities:
```
TASK REQ:find_orphan_links IN:MEM OUT:LINK_IDS
```

**Cypher Query:**
```cypher
MATCH ()-[r]->(e:Entity)
WHERE NOT exists(e.id)
RETURN id(r) as orphan_id
```

Then delete:
```
TASK REQ:delete_links IN:MEM OUT:CONFIRM
PARAMS {"link_ids": [123, 456, 789]}
```

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA links_deleted:3
```

### 5. Compact Daily Logs (>7 days old)
Move entries from `memory/YYYY-MM-DD.md` older than 7 days to archive:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "cd ~/clawd/memory && find . -name '*.md' -mtime +7 -exec gzip {} \\;"
```

**Expected Response:**
```
STATUS OK
SCOPE [shell]
DATA exit:0
EXEC_TIME 234
STDOUT_SUMMARY "Compressed 3 files"
```

### 6. Database Statistics
Query Neo4j for health metrics:
```
TASK REQ:query_graph IN:MEM OUT:STATS
PARAMS {"operation": "stats"}
```

**Cypher Query:**
```cypher
MATCH (e:Entity)
RETURN count(e) as entity_count,
       avg(e.relevance) as avg_relevance,
       sum(CASE WHEN e.relevance < 0.3 THEN 1 ELSE 0 END) as low_relevance_count;

MATCH ()-[r]->()
RETURN count(r) as relation_count,
       avg(r.weight) as avg_weight;
```

**Expected Response:**
```
STATUS OK
SCOPE [memory,stats]
DATA entity_count:1234,avg_relevance:0.72,low_relevance_count:45,relation_count:3456,avg_weight:0.68
```

### 7. Write Summary Report
Store maintenance summary in daily log:
```
TASK REQ:store IN:MEM OUT:CONFIRM
CONTENT "Daily maintenance: Decayed 23 entities, 45 relations. Merged 2 duplicates. Cleaned 3 orphan links. DB health: 1234 entities (avg relevance 0.72), 3456 relations (avg weight 0.68)."
TIER short
TAGS [maintenance,daily,stats]
```

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA mem:uuid-maintenance-report
TIER_WRITTEN short
```

## Health Metrics

### Success Criteria
- Entities decayed: 10-50 per day (normal growth)
- Relations decayed: 20-100 per day
- Duplicates merged: 0-5 per day
- Orphan links: 0-10 per day
- Average relevance: >0.6
- Average weight: >0.5

### Alert Triggers
- Entity count growth >20% per day (investigate)
- Average relevance <0.5 (decay rate too aggressive)
- Average weight <0.4 (relation quality degrading)
- Orphan links >50 (data integrity issue)

## Error Handling

### Neo4j Connection Failure
```
STATUS FAIL
ERROR neo4j_connection_failed
RATIONALE Database unavailable, skipping maintenance
```

**Action:** Retry in 1 hour, escalate if fails 3 times.

### Decay Operation Timeout
```
STATUS PARTIAL
DATA entities_decayed:100,timeout_at:30s
RATIONALE Decay partially complete, will resume next run
```

**Action:** Log partial success, continue with other steps.

## Performance Targets
- Total execution time: <5 minutes
- Neo4j queries: <500ms each
- File operations: <1 minute total
- Memory footprint: <100MB

## Logging
All maintenance operations logged to:
- `memory/maintenance-logs/YYYY-MM-DD.jsonl` (structured)
- `memory/YYYY-MM-DD.md` (summary)
