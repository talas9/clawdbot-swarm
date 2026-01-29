# Swarm Memory Architecture - Integration Testing

## Test Phases

### Phase 0: Foundation Tests ✅
- [x] CSP/1 protocol specification exists
- [x] Task router exists
- [x] SKILL.md entry point created
- [x] Directory structure complete

**Validation:**
```bash
test -f ~/clawd/skills/swarm-memory/CSP1.md && echo "✓ CSP/1 exists"
test -f ~/clawd/skills/swarm-memory/router.md && echo "✓ Router exists"
test -f ~/clawd/skills/swarm-memory/SKILL.md && echo "✓ SKILL.md exists"
```

### Phase 0.5: CLI Utilities Tests ✅
- [x] All 5 commands implemented
- [x] Tests passing (19/19)
- [x] Build successful
- [x] README documentation complete

**Validation:**
```bash
cd ~/clawd/Projects/clawdbot-swarm/swarm-cli
npm test && echo "✓ All CLI tests pass"
npm run build && echo "✓ Build successful"
npm run swarm -- uuid && echo "✓ UUID command works"
npm run swarm -- task-id "test task" && echo "✓ Task ID command works"
```

### Phase 1: Specialist Tests
- [ ] Each specialist file parses correctly
- [ ] Memory specialist Neo4j integration ready
- [ ] CSP/1 format validation passes

**Validation:**
```bash
# Check specialist files exist
for spec in memory file web tool; do
  test -f ~/clawd/skills/swarm-memory/specialists/${spec}.md && echo "✓ ${spec} specialist exists"
done

# Validate CSP/1 examples
node -e "
const parser = require('./skills/swarm-memory/parser/csp1-parser');
const example = 'STATUS OK\nSCOPE [test]\nDATA test:1';
const result = parser.parseCSP1Response(example);
console.log(result.status === 'OK' ? '✓ Parser works' : '✗ Parser failed');
"
```

### Phase 2: Neo4j Memory Tier Tests
- [ ] Neo4j database running
- [ ] Schema applied (indexes, constraints)
- [ ] Client library connects successfully
- [ ] Basic CRUD operations work

**Validation:**
```bash
# Check Neo4j status
neo4j status && echo "✓ Neo4j running"

# Test connection
node -e "
const { Neo4jMemoryClient } = require('./skills/swarm-memory/memory-tiers/neo4j-client');
(async () => {
  const client = new Neo4jMemoryClient();
  const connected = await client.testConnection();
  console.log(connected ? '✓ Neo4j connection works' : '✗ Connection failed');
  await client.close();
})();
"

# Check indexes
cypher-shell -u neo4j -p <password> "SHOW INDEXES" | grep -q "entitySearch" && echo "✓ Indexes exist"
```

### Phase 2.5: Dialectic Layer Tests
- [ ] Advocate sub-agent spec exists
- [ ] Critic sub-agent spec exists
- [ ] Debate protocol documented
- [ ] Failure tracking initialized
- [ ] CSP/1 debate extensions added

**Validation:**
```bash
test -f ~/clawd/skills/swarm-memory/subagents/advocate.md && echo "✓ Advocate exists"
test -f ~/clawd/skills/swarm-memory/subagents/critic.md && echo "✓ Critic exists"
test -f ~/clawd/skills/swarm-memory/subagents/debate-protocol.md && echo "✓ Debate protocol exists"
test -f ~/clawd/memory/failures.jsonl && echo "✓ Failure tracking initialized"
```

### Phase 3: Orchestrator Tests
- [ ] AGENTS.md updated with swarm mode
- [ ] Delegation rules documented
- [ ] Task decomposition pattern described
- [ ] Memory hygiene guidelines added

**Validation:**
```bash
grep -q "Swarm Mode" ~/clawd/AGENTS.md && echo "✓ Swarm mode documented"
grep -q "File Specialist" ~/clawd/AGENTS.md && echo "✓ Delegation rules present"
grep -q "Dialectic Layer" ~/clawd/AGENTS.md && echo "✓ Dialectic integration documented"
```

### Phase 4: Parser Tests
- [ ] CSP/1 parser compiles
- [ ] Response formatter compiles
- [ ] Validation functions work

**Validation:**
```bash
cd ~/clawd/skills/swarm-memory/parser
npx tsc csp1-parser.ts --noEmit && echo "✓ CSP/1 parser compiles"
npx tsc response-formatter.ts --noEmit && echo "✓ Response formatter compiles"

# Test parsing
node -e "
const parser = require('./csp1-parser');
const formatted = parser.formatCSP1Response({
  status: 'OK',
  scope: ['test'],
  data: ['file:1']
});
console.log(formatted.includes('STATUS OK') ? '✓ Formatting works' : '✗ Formatting failed');
"
```

### Phase 5: Maintenance Tests
- [ ] Daily maintenance spec exists
- [ ] Weekly consolidation spec exists
- [ ] Monthly rebuild spec exists
- [ ] Meta-optimizer spec exists

**Validation:**
```bash
for task in daily weekly monthly optimizer; do
  test -f ~/clawd/skills/swarm-memory/maintenance/${task}.md && echo "✓ ${task} maintenance exists"
done
```

### Phase 6: End-to-End Integration Tests

#### Test 1: Simple Memory Recall
**Scenario:** Query memory for recent context

**Steps:**
1. Store test entry via Memory Specialist
2. Recall entry
3. Verify relevance score
4. Check Neo4j contains entity

**Expected Result:**
- Memory stored successfully
- Recall returns correct entry
- Relevance > 0.8
- Neo4j entity exists

**Validation:**
```bash
# Manual test via Orchestrator
# Input: "Remember that I prefer TypeScript over JavaScript"
# Expected: Memory Specialist stores, returns mem:uuid
# Then: "What languages do I prefer?"
# Expected: Memory Specialist recalls, mentions TypeScript
```

#### Test 2: File Search + Memory Store
**Scenario:** Multi-specialist coordination

**Steps:**
1. Request: "Find all auth files and remember them"
2. Orchestrator delegates to File Specialist
3. File Specialist returns file:line refs
4. Orchestrator delegates to Memory Specialist
5. Memory Specialist stores + creates Neo4j entities

**Expected Result:**
- File Specialist returns 3-10 auth files
- Memory Specialist stores summary
- Neo4j contains entities for found files
- Links created between auth entities

**Validation:**
```bash
# Check Neo4j for auth entities after test
cypher-shell -u neo4j -p <password> "
MATCH (e:Entity)
WHERE e.name CONTAINS 'auth'
RETURN e.name, e.type, e.relevance
LIMIT 5
" && echo "✓ Auth entities created"
```

#### Test 3: Debate System (Planning)
**Scenario:** High-stakes operation triggers debate

**Steps:**
1. Request: "Delete all .bak files in the project"
2. Task Router identifies ACTION mode + destructive + bulk
3. Orchestrator invokes Advocate sub-agent
4. Advocate proposes plan with safeguards
5. Orchestrator invokes Critic sub-agent
6. Critic challenges with risks
7. Orchestrator synthesizes → MODIFY resolution
8. Execute modified plan (trash + dry-run first)

**Expected Result:**
- Debate triggered automatically
- Advocate provides plan
- Critic provides counter/risks
- Resolution modifies approach
- Safer execution method used

#### Test 4: Failure Loop Prevention
**Scenario:** Repeated failures trigger dialectic

**Steps:**
1. Request: "Fix import error in auth.ts"
2. Attempt 1: Fails with MODULE_NOT_FOUND
3. Log to failures.jsonl
4. Attempt 2: Fails with same error
5. Failure count = 2 → invoke Critic/Advocate debate
6. Critic identifies root cause
7. Advocate proposes different approach
8. Resolution: PIVOT to alternative solution

**Expected Result:**
- Failures logged correctly
- Debate triggered after 2 failures
- Different approach tried
- Success on 3rd attempt OR escalation

#### Test 5: Memory Decay
**Scenario:** Unused entities decay over time

**Steps:**
1. Create test entity with relevance 1.0
2. Do not access for 8 days
3. Run daily maintenance
4. Check entity relevance reduced
5. Wait 30+ days
6. Run monthly maintenance
7. Verify entity deleted (relevance < 0.1)

**Expected Result:**
- Relevance decreases by decay_rate each maintenance
- Entity deleted when below threshold
- No orphan relationships remain

**Validation:**
```bash
# Create test entity
cypher-shell -u neo4j -p <password> "
CREATE (e:Entity {
  id: randomUUID(),
  name: 'test-decay-entity',
  type: 'concept',
  created_at: datetime() - duration({days: 8}),
  last_accessed: datetime() - duration({days: 8}),
  relevance: 1.0,
  access_count: 0,
  tags: ['test']
})
RETURN e.id
"

# Manually run decay
# (simulate daily maintenance)

# Check relevance decreased
cypher-shell -u neo4j -p <password> "
MATCH (e:Entity {name: 'test-decay-entity'})
RETURN e.relevance
" # Should be < 1.0
```

## Performance Tests

### Token Efficiency
**Metric:** CSP/1 should reduce inter-agent communication by 60-80%

**Measurement:**
1. Complex task requiring 5 specialist calls
2. Measure total tokens with CSP/1
3. Compare to hypothetical natural language (estimate)
4. Verify reduction >= 60%

**Target:** 
- CSP/1: ~500 tokens per specialist call
- Natural language: ~1500 tokens per specialist call
- Reduction: 67%

### Response Time
**Metrics:** p50, p95, p99 latencies

**Targets:**
- Memory recall: <100ms (p95)
- File search: <500ms (p95)
- Web search: <2s (p95)
- Task decomposition: <2s (p95)
- Debate synthesis: <3s (p95)

**Measurement:**
```bash
# Run 100 memory recalls, measure latency
for i in {1..100}; do
  # Time memory recall
done
# Calculate percentiles
```

### Memory Footprint
**Target:** Main session <200MB, specialists <50MB each

**Measurement:**
```bash
# Check process memory
ps aux | grep -E 'clawd|neo4j' | awk '{print $6, $11}'
```

## Rollback Tests

### Scenario: Neo4j Failure
**Steps:**
1. Stop Neo4j mid-operation
2. Verify graceful degradation (FAIL status)
3. Restore Neo4j
4. Verify recovery

**Expected:**
- Specialist returns STATUS FAIL
- No data corruption
- Automatic retry succeeds

### Scenario: Config Corruption
**Steps:**
1. Corrupt neo4j-config.json
2. Attempt memory operation
3. Verify error handling
4. Restore config
5. Verify recovery

**Expected:**
- Clear error message
- No crashes
- System recovers after fix

## Manual Test Checklist

- [ ] Spawn specialist sub-agent successfully
- [ ] Specialist responds in CSP/1 format
- [ ] CSP/1 response validates (L1-L4 rules)
- [ ] Memory stores to Neo4j
- [ ] Memory recalls from Neo4j
- [ ] File search returns file:line refs
- [ ] Web search returns url refs
- [ ] Tool execution returns exit code + summary
- [ ] Debate triggers on high-stakes operations
- [ ] Failure tracking logs failures
- [ ] Debate triggers after 2 failures
- [ ] Auto-escalation triggers after 3 failures
- [ ] Daily maintenance runs without errors
- [ ] Memory decay works correctly
- [ ] Entity promotion works correctly
- [ ] Graph clustering works correctly
- [ ] Monthly backup completes
- [ ] Index rebuild completes
- [ ] Meta-optimizer adjusts parameters

## Success Criteria

### Minimum Viable System
- All specialists operational
- Neo4j connected and queryable
- CSP/1 parsing works
- Basic task delegation works
- Failure tracking functional

### Full Production Ready
- All tests passing
- Performance targets met
- Debate system operational
- Maintenance automation working
- Meta-optimizer tuning parameters
- Documentation complete
- Rollback procedures validated

## Known Issues / Limitations

1. **Neo4j Installation:** Requires manual setup, password configuration
2. **First-run Performance:** Indexes need warm-up (~100 queries)
3. **Debate Overhead:** Adds 2-3s latency to high-stakes operations
4. **Memory Growth:** Requires monthly maintenance to prevent unbounded growth
5. **Token Context:** CSP/1 can still reach context limits with very large graphs

## Next Steps After Testing

1. Deploy to production environment
2. Monitor metrics for 7 days
3. Run first meta-optimization
4. Adjust parameters based on real usage
5. Document lessons learned
6. Plan Phase 7: Bootstrapping and continuous improvement
