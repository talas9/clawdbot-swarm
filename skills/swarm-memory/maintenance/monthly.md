# Monthly Memory Rebuild Task

## Objective
Full graph reindex, generate super-summaries, prune dead links, optimize database, and produce monthly analytics.

## Execution Schedule
Runs monthly on the 1st at 05:00 AM via cron job `memory-monthly-rebuild`.

## Steps (Execute via specialists in CSP/1)

### 1. Backup Neo4j Database
Create full backup before major operations:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "neo4j-admin backup --from=bolt://localhost:7687 --backup-dir=~/clawd/memory/neo4j-backups/$(date +%Y-%m-%d) --compress"
TIMEOUT_MS 300000
```

**Expected Response:**
```
STATUS OK
SCOPE [neo4j,backup]
DATA exit:0
EXEC_TIME 45678
STDOUT_SUMMARY "Backup completed: 234 MB compressed"
```

### 2. Full Graph Reindex
Rebuild all Neo4j indexes and constraints:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "cypher-shell -u neo4j -p <password> < ~/clawd/skills/swarm-memory/maintenance/rebuild-indexes.cypher"
```

**rebuild-indexes.cypher:**
```cypher
// Drop existing indexes
DROP INDEX entity_relevance IF EXISTS;
DROP INDEX entity_type IF EXISTS;
DROP INDEX entity_last_accessed IF EXISTS;
DROP INDEX entity_type_relevance IF EXISTS;
DROP INDEX relation_weight IF EXISTS;
DROP INDEX relation_last_accessed IF EXISTS;
CALL db.index.fulltext.drop("entitySearch");

// Recreate constraints
CREATE CONSTRAINT entity_unique IF NOT EXISTS
FOR (e:Entity) REQUIRE (e.name, e.type) IS UNIQUE;

CREATE CONSTRAINT entity_id_unique IF NOT EXISTS
FOR (e:Entity) REQUIRE e.id IS UNIQUE;

// Recreate indexes
CREATE INDEX entity_relevance FOR (e:Entity) ON (e.relevance);
CREATE INDEX entity_type FOR (e:Entity) ON (e.type);
CREATE INDEX entity_last_accessed FOR (e:Entity) ON (e.last_accessed);
CREATE INDEX entity_type_relevance FOR (e:Entity) ON (e.type, e.relevance);
CREATE INDEX relation_weight FOR ()-[r:RELATED_TO]-() ON (r.weight);
CREATE INDEX relation_last_accessed FOR ()-[r:RELATED_TO]-() ON (r.last_accessed);

CALL db.index.fulltext.createNodeIndex(
  "entitySearch",
  ["Entity"],
  ["name", "tags"]
);
```

**Expected Response:**
```
STATUS OK
SCOPE [neo4j,rebuild]
DATA exit:0
EXEC_TIME 12345
STDOUT_SUMMARY "Indexes rebuilt: 8 indexes, 2 constraints"
```

### 3. Prune Dead Links (Weight < 0.1)
Aggressive cleanup of low-weight relationships:
```
TASK REQ:decay IN:MEM OUT:STATS
PARAMS {"days_inactive": 90, "decay_rate": 0, "threshold": 0.1, "force_delete": true}
```

**Cypher Query:**
```cypher
MATCH ()-[r]-()
WHERE r.weight < 0.1
DELETE r
RETURN count(r) as deleted
```

**Expected Response:**
```
STATUS OK
SCOPE [memory,cleanup]
DATA relations_deleted:234
```

### 4. Prune Dead Entities (Relevance < 0.1, No Relations)
Remove orphaned low-relevance entities:
```
TASK REQ:query_graph IN:MEM OUT:ENTITY_LIST
PARAMS {"operation": "find_orphans", "max_relevance": 0.1}
```

**Cypher Query:**
```cypher
MATCH (e:Entity)
WHERE e.relevance < 0.1 AND NOT (e)-[]-()
DELETE e
RETURN count(e) as deleted
```

**Expected Response:**
```
STATUS OK
SCOPE [memory,cleanup]
DATA entities_deleted:67
```

### 5. Generate Monthly Super-Summary
Aggregate insights from last 30 days into MEMORY.md:
```
TASK REQ:recall IN:MEM OUT:MEM_REFS
PARAMS {"query": "monthly summary key events decisions", "days_back": 30, "min_relevance": 0.75, "max_results": 20}
```

**Then synthesize:**
```
TASK REQ:store IN:MEM OUT:CONFIRM
CONTENT "## Monthly Summary (YYYY-MM)\n\n[Synthesized key events, decisions, learnings from top 20 high-relevance entries]"
TIER long
TAGS [monthly,summary,synthesis]
```

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA mem:monthly-summary-uuid
TIER_WRITTEN long
```

### 6. Database Compaction
Run Neo4j database compaction to reclaim space:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "neo4j-admin store-info --store=~/Library/Application\\ Support/Neo4j/data/databases/neo4j && neo4j-admin database compact neo4j"
TIMEOUT_MS 600000
```

**Expected Response:**
```
STATUS OK
SCOPE [neo4j,compact]
DATA exit:0
EXEC_TIME 123456
STDOUT_SUMMARY "Compaction complete: 234 MB -> 189 MB (19% savings)"
```

### 7. Monthly Analytics Report
Generate comprehensive analytics:
```
TASK REQ:query_graph IN:MEM OUT:STATS
PARAMS {"operation": "monthly_analytics"}
```

**Metrics:**
- Total entities / relations
- Growth rate (month-over-month)
- Top 10 most-accessed entities
- Top 5 clusters by size
- Average relevance / weight trends
- Decay effectiveness
- Storage usage (Neo4j + files)

**Expected Response:**
```
STATUS OK
SCOPE [memory,analytics]
DATA total_entities:2345,total_relations:6789,growth_rate:+18%,top_entities:[auth.ts:145,jwt:98,...],clusters:5,avg_relevance:0.71,avg_weight:0.66,storage_mb:189
```

### 8. Update Meta-Optimizer Parameters
Based on monthly analytics, adjust decay rates and thresholds:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "node ~/clawd/skills/swarm-memory/maintenance/meta-optimizer.js --mode=monthly"
```

**meta-optimizer.js logic:**
- If growth_rate >25%: increase decay_rate by 0.01
- If avg_relevance <0.6: decrease decay_rate by 0.01
- If decay_effectiveness <0.1: increase decay_rate by 0.02
- If decay_effectiveness >0.3: decrease decay_rate by 0.01

**Expected Response:**
```
STATUS OK
SCOPE [optimizer]
DATA exit:0
EXEC_TIME 234
STDOUT_SUMMARY "Decay rate adjusted: 0.10 -> 0.11 (growth too high)"
```

### 9. Archive Old Backups
Keep last 12 monthly backups, delete older:
```
TASK REQ:exec IN:SHELL OUT:EXEC_RESULT
COMMAND "cd ~/clawd/memory/neo4j-backups && ls -t | tail -n +13 | xargs rm -rf"
```

**Expected Response:**
```
STATUS OK
SCOPE [shell]
DATA exit:0
EXEC_TIME 123
STDOUT_SUMMARY "Removed 2 old backups"
```

### 10. Generate Monthly Report
Create markdown report for human review:
```
TASK REQ:store IN:MEM OUT:CONFIRM
CONTENT "# Memory System Monthly Report (YYYY-MM)\n\n## Statistics\n- Entities: 2345 (+18%)\n- Relations: 6789 (+22%)\n- Avg Relevance: 0.71\n- Storage: 189 MB\n\n## Top Entities\n1. auth.ts (145 accesses)\n2. jwt-handler (98 accesses)\n...\n\n## Optimizations\n- Decay rate: 0.10 -> 0.11\n- Pruned 234 dead links\n- Removed 67 orphaned entities\n- Compaction saved 45 MB\n\n## Recommendations\n[Auto-generated based on trends]"
TIER short
TAGS [monthly,report,admin]
```

**Expected Response:**
```
STATUS OK
SCOPE [memory]
DATA mem:monthly-report-uuid
TIER_WRITTEN short
```

## Health Metrics

### Success Criteria
- Backup completed: <5 minutes
- Reindex completed: <3 minutes
- Compaction savings: 10-30%
- Dead links pruned: 100-500 per month
- Dead entities pruned: 50-200 per month
- Monthly report generated successfully

### Alert Triggers
- Backup failed (critical - abort remaining steps)
- Reindex failed (critical - database may be corrupted)
- Compaction savings <5% (may indicate healthy growth or issue)
- Dead links >1000 (investigate decay settings)
- Storage growth >50% month-over-month (unsustainable)

## Performance Targets
- Total execution time: <30 minutes
- Backup: <5 minutes
- Reindex: <3 minutes
- Compaction: <10 minutes
- Memory footprint: <500MB

## Rollback Plan
If critical failure occurs:
1. Stop all operations
2. Restore from backup:
   ```bash
   neo4j stop
   rm -rf ~/Library/Application Support/Neo4j/data/databases/neo4j
   neo4j-admin restore --from=<latest_backup> --database=neo4j
   neo4j start
   ```
3. Verify restoration
4. Log incident for investigation

## Logging
All rebuild operations logged to:
- `memory/maintenance-logs/monthly-YYYY-MM.jsonl`
- Monthly report saved to `memory/monthly-reports/YYYY-MM.md`
