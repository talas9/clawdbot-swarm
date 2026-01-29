# Clawdbot Swarm Implementation — Execution Plan

**Version:** 1.0  
**Date:** 2026-01-30  
**Author:** Opus Execution Planner  
**Branch:** execution-plan-opus  
**Status:** 📋 READY FOR REVIEW

---

## Executive Summary

The Clawdbot Swarm architecture design is **substantially complete** with well-defined protocols, specs, and documentation. However, **no actual runtime implementation exists**. This plan provides a phased approach to move from design documents to working system.

**Estimated Total Time:** 6-8 hours (implementation) + 2-3 hours (testing)  
**Risk Level:** Medium (Graphiti/Neo4j external dependencies)  
**Recommendation:** ✅ **GO** (with Phase 0 prerequisites validation)

---

## 1. Maturity Assessment

### Component Ratings

| Component | Status | Rating | Notes |
|-----------|--------|--------|-------|
| CSP/1 Protocol | Design complete | ✅ READY | Well-defined, includes debate extensions |
| Task Router | Design complete | ✅ READY | Soft + hard enforcement documented |
| Specialist Specs | Docs exist | ⚠️ NEEDS_WORK | No executable code, just markdown |
| Sub-agent Specs | Docs exist | ⚠️ NEEDS_WORK | Analyzer, Planner, Advocate, Critic specced |
| Graphiti Integration | Template only | 🔴 BLOCKED | Neo4j not installed, Graphiti not installed |
| CLI Tools | Working | ✅ READY | 19/19 tests passing |
| Memory Tiers | Designed | ⚠️ NEEDS_WORK | No backend running |
| AGENTS.md Swarm Mode | Documented | ⚠️ NEEDS_WORK | Untested in practice |
| Debate Protocol | Specced | ⚠️ NEEDS_WORK | No runtime implementation |
| Parser/Formatter | Template | ⚠️ NEEDS_WORK | TypeScript templates, not compiled |

### Summary
- **READY:** 3 components (CSP/1, Router spec, CLI)
- **NEEDS_WORK:** 6 components (Specialists, Sub-agents, Memory, AGENTS.md, Debate, Parser)
- **BLOCKED:** 1 component (Graphiti/Neo4j)

---

## 2. Gap Analysis

### Well-Defined & Ready ✅

1. **CSP/1 Protocol** (`design/specs/CSP1.md`)
   - Complete message format specification
   - Debate extensions integrated
   - Anti-patterns documented
   - Examples provided

2. **Task Router Logic** (`design/specs/router.md`)
   - ANSWER vs ACTION routing rules
   - Confidence levels (STRONG/WEAK)
   - Debate triggers
   - TypeScript implementation template

3. **CLI Tooling** (`swarm-cli/`)
   - UUID generation working
   - Task ID hashing working
   - Scaffold command working
   - Validate command working
   - All 19 tests passing

### Needs More Detail ⚠️

1. **Specialist Integration**
   - How do specialists spawn as sub-agents?
   - What session/context isolation?
   - Token budget enforcement mechanism?
   - Error propagation patterns?

2. **Python↔TypeScript Interop**
   - How does TypeScript orchestrator call Python Graphiti?
   - Subprocess? HTTP API? MCP server?
   - Latency implications?

3. **Memory Tier Promotion/Decay**
   - Exact trigger conditions for tier promotion?
   - When does decay cron run vs explicit call?
   - Threshold tuning process?

4. **Dialectic Implementation**
   - How are Advocate/Critic spawned?
   - Same-session or separate sessions?
   - How does Orchestrator synthesize their outputs?

### Missing Dependencies 🔴

1. **Infrastructure**
   - Neo4j 5.x not installed
   - Graphiti-core not installed
   - No Python virtualenv setup
   - OpenAI API key not configured for Graphiti

2. **Integration Code**
   - No Python Graphiti client (only template)
   - No interop bridge (Python↔TypeScript)
   - No specialist spawn mechanism
   - No CSP/1 parser compiled

3. **Configuration**
   - No `clawdbot.json` updates for swarm routing
   - No memory MCP configuration
   - No cron job setup

### Risks Identified ⚠️

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| OpenAI API costs (Graphiti) | Medium | High | Budget caps, fallback to JSONL |
| Neo4j memory footprint (~200MB) | Low | Medium | Monitor, tune heap |
| LLM entity extraction quality | Medium | Medium | Manual review, prompt tuning |
| Python/TS interop latency | Medium | Low | Async subprocess, caching |
| Swarm overhead for simple tasks | Low | Medium | Router bypass for trivials |
| Sub-agent spawn costs | Medium | Medium | Session pooling, lazy spawn |

---

## 3. Phased Execution Plan

### Phase 0: Prerequisites (45-60 min)

**Objective:** Ensure all dependencies are installed and configured.

#### 0.1 Install Neo4j (15 min)
```bash
# Option A: Docker (recommended)
docker run -d \
  --name clawdbot-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/graphiti_memory_2026 \
  -e NEO4J_PLUGINS='["apoc"]' \
  -v neo4j_data:/data \
  neo4j:5.26-community

# Option B: Homebrew
brew install neo4j
neo4j start
```

**Deliverable:** Neo4j accessible at `bolt://localhost:7687`  
**Success Criteria:** `cypher-shell -u neo4j -p graphiti_memory_2026 "RETURN 1"` returns 1

#### 0.2 Install Graphiti (10 min)
```bash
# Create Python virtualenv for Graphiti
python3 -m venv ~/.clawdbot/graphiti-env
source ~/.clawdbot/graphiti-env/bin/activate
pip install graphiti-core

# Verify
python -c "from graphiti_core import Graphiti; print('Graphiti OK')"
```

**Deliverable:** Graphiti importable in Python  
**Success Criteria:** Import succeeds without errors

#### 0.3 Configure OpenAI API (5 min)
```bash
# Add to ~/.zshrc or ~/.bashrc
export OPENAI_API_KEY="sk-..."

# Or in clawdbot config
echo '{"graphiti": {"openai_key": "sk-..."}}' >> ~/.clawdbot/secrets.json
```

**Deliverable:** OpenAI API accessible for entity extraction  
**Success Criteria:** Test embedding call succeeds

#### 0.4 Validate Environment (10 min)
```bash
cd /Users/talas9/clawd/Projects/clawdbot-swarm/swarm-cli
npm run swarm validate --phase 0

# Expected output: Phase 0 requirements met
```

**Deliverable:** CLI validation passes  
**Success Criteria:** All Phase 0 checks green

#### 0.5 Create Memory Directories (5 min)
```bash
npm run swarm init-memory --path ~/clawd

# Creates:
# - memory/graph.jsonl
# - memory/failures.jsonl
# - memory/active-tasks.md
# - memory/metrics/
```

**Deliverable:** Memory directory structure created  
**Success Criteria:** All files exist, writable

**Phase 0 Rollback:** Remove Docker container, delete virtualenv
```bash
docker rm -f clawdbot-neo4j
rm -rf ~/.clawdbot/graphiti-env
```

---

### Phase 1: Core Infrastructure (90-120 min)

**Objective:** Implement CSP/1 parsing, routing, and specialist spawn mechanism.

#### 1.1 Compile CSP/1 Parser (30 min)

**File:** `swarm-cli/src/parser/csp1-parser.ts`

**Tasks:**
- Implement `parseCSP1Response(raw: string): CSP1Response`
- Implement `formatCSP1Task(task: CSP1Task): string`
- Implement `validateCSP1Response(response: CSP1Response): boolean`
- Add to CLI: `npm run swarm parse <file>`

**Deliverable:** CSP/1 parser as CLI command  
**Success Criteria:** 
- `echo "STATUS OK\nSCOPE [auth]\nDATA mem:uuid-123" | npm run swarm parse` returns valid JSON
- Validation catches L2/L3 violations

#### 1.2 Implement Router Classifier (30 min)

**File:** `swarm-cli/src/router/classifier.ts`

**Tasks:**
- Implement `classifyTask(message: string): 'ANSWER' | 'ACTION'`
- Implement `getConfidence(message: string): 'STRONG' | 'WEAK' | 'NONE'`
- Implement `needsDebate(task: string, failCount: number): boolean`
- Add to CLI: `npm run swarm route "<task>"`

**Deliverable:** Router as CLI command  
**Success Criteria:**
- "What is HPOS?" → ANSWER
- "Fix src/auth.ts" → ACTION (STRONG)
- "search for examples" → ACTION (WEAK)

#### 1.3 Create Specialist Spawn Mechanism (30 min)

**File:** `swarm-cli/src/specialists/spawn.ts`

**Tasks:**
- Define specialist types (memory, file, web, tool)
- Implement `spawnSpecialist(type: SpecialistType, task: CSP1Task): Promise<CSP1Response>`
- Integrate with Clawdbot sub-agent API (if available) or mock

**Deliverable:** Specialist spawn function  
**Success Criteria:** 
- Spawn returns valid CSP/1 response
- Errors handled gracefully

#### 1.4 Update AGENTS.md with Live Routing (20 min)

**File:** `~/clawd/AGENTS.md`

**Tasks:**
- Add routing decision logging
- Add specialist delegation enforcement
- Add swarm mode activation triggers

**Deliverable:** Updated AGENTS.md  
**Success Criteria:** Main agent routes ACTION tasks to swarm

**Phase 1 Rollback:** 
```bash
git checkout ~/clawd/AGENTS.md
# CLI changes are additive, no rollback needed
```

---

### Phase 2: Graphiti Integration (90-120 min)

**Objective:** Implement Memory Specialist with Graphiti backend.

#### 2.1 Create Graphiti Client (30 min)

**File:** `~/.clawdbot/graphiti-client.py`

**Tasks:**
- Implement async Graphiti client wrapper
- Implement `store_episode(content, tier, tags, source)`
- Implement `search(query, max_results, min_relevance)`
- Implement `get_temporal_snapshot(entity, timestamp)`

```python
#!/usr/bin/env python3
import asyncio
import json
import sys
from graphiti_core import Graphiti
from datetime import datetime

async def main():
    graphiti = Graphiti(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="graphiti_memory_2026"
    )
    
    cmd = sys.argv[1]
    args = json.loads(sys.argv[2])
    
    if cmd == "store":
        result = await graphiti.add_episode(...)
    elif cmd == "search":
        result = await graphiti.search(...)
    
    print(json.dumps(result))

asyncio.run(main())
```

**Deliverable:** Python Graphiti client callable from CLI  
**Success Criteria:** 
- `python graphiti-client.py store '{"content":"test"}'` succeeds
- Episode appears in Neo4j

#### 2.2 Create Python↔TypeScript Bridge (30 min)

**File:** `swarm-cli/src/specialists/graphiti-bridge.ts`

**Tasks:**
- Implement subprocess call to Python client
- Parse JSON response
- Convert to CSP/1 format
- Handle timeouts and errors

```typescript
async function callGraphiti(cmd: string, args: object): Promise<CSP1Response> {
  const result = await execAsync(
    `source ~/.clawdbot/graphiti-env/bin/activate && python ~/.clawdbot/graphiti-client.py ${cmd} '${JSON.stringify(args)}'`
  );
  return parseGraphitiResult(result.stdout);
}
```

**Deliverable:** Bridge function for TypeScript→Python calls  
**Success Criteria:** 
- `spawnSpecialist('memory', {action: 'store', ...})` stores via Graphiti
- Latency <500ms for store operations

#### 2.3 Implement Memory Specialist (30 min)

**File:** `swarm-cli/src/specialists/memory.ts`

**Tasks:**
- Implement `handleMemoryTask(task: CSP1Task): Promise<CSP1Response>`
- Route to Graphiti for store/recall/query
- Format responses in CSP/1
- Respect token limits (L3)

**Deliverable:** Full Memory Specialist implementation  
**Success Criteria:**
- Store: `TASK REQ:store IN:MEM OUT:CONFIRM` → STATUS OK
- Recall: `TASK REQ:recall auth IN:MEM OUT:MEM_REFS` → relevant results

#### 2.4 Add JSONL Fallback (20 min)

**File:** `swarm-cli/src/specialists/memory-jsonl.ts`

**Tasks:**
- Implement JSONL append for store
- Implement grep-based search for recall
- Auto-fallback if Graphiti unavailable

**Deliverable:** JSONL fallback for offline operation  
**Success Criteria:** Memory operations work without Neo4j

**Phase 2 Rollback:**
```bash
docker rm -f clawdbot-neo4j
# Memory falls back to JSONL automatically
```

---

### Phase 3: Sub-Agents (60-90 min)

**Objective:** Implement Analyzer, Planner, Advocate, and Critic sub-agents.

#### 3.1 Implement Analyzer Sub-Agent (20 min)

**File:** `swarm-cli/src/subagents/analyzer.ts`

**Tasks:**
- Implement task decomposition logic
- Generate task list with dependencies
- Estimate token costs per task
- Output in CSP/1 format

**Deliverable:** Analyzer that decomposes complex tasks  
**Success Criteria:**
- Input: "Find auth bugs and create fix plan"
- Output: TASKS list with memory recall, file search, plan storage

#### 3.2 Implement Planner Sub-Agent (20 min)

**File:** `swarm-cli/src/subagents/planner.ts`

**Tasks:**
- Implement dependency resolution
- Optimize execution order
- Identify parallelization opportunities
- Calculate total token budget

**Deliverable:** Planner that orders tasks optimally  
**Success Criteria:**
- Input: Tasks with dependencies
- Output: EXECUTION_ORDER, PARALLEL_GROUPS

#### 3.3 Implement Advocate Sub-Agent (15 min)

**File:** `swarm-cli/src/subagents/advocate.ts`

**Tasks:**
- Implement plan defense logic
- Generate PLAN, CONFIDENCE, ASSUMPTIONS
- In failure mode: propose DIFF_FROM_PREVIOUS

**Deliverable:** Advocate that defends plans  
**Success Criteria:** Outputs valid CSP/1 POSITION ADVOCATE response

#### 3.4 Implement Critic Sub-Agent (15 min)

**File:** `swarm-cli/src/subagents/critic.ts`

**Tasks:**
- Implement risk identification
- Generate RISKS, BLIND_SPOTS, COUNTER
- Set SHOULD_ESCALATE flag when appropriate

**Deliverable:** Critic that challenges plans  
**Success Criteria:** Outputs valid CSP/1 POSITION CRITIC response with COUNTER

#### 3.5 Implement Debate Orchestration (20 min)

**File:** `swarm-cli/src/subagents/debate.ts`

**Tasks:**
- Invoke Advocate then Critic
- Synthesize into RESOLUTION
- Log debate to memory
- Handle escalation

**Deliverable:** Debate orchestration function  
**Success Criteria:**
- Planning debate produces PROCEED/MODIFY/PIVOT
- Failure debate triggers after 2 consecutive failures

**Phase 3 Rollback:**
```bash
# Sub-agents are optional enhancement
# Remove calls from orchestrator, system still works
```

---

### Phase 4: Testing & Validation (60-90 min)

**Objective:** Comprehensive testing of all components.

#### 4.1 Unit Tests (30 min)

**Tasks:**
- CSP/1 parser tests (10 cases)
- Router classifier tests (20 cases)
- Specialist response format tests
- Sub-agent output format tests

**Deliverable:** Test suite in `swarm-cli/src/test/`  
**Success Criteria:** All tests pass

#### 4.2 Integration Tests (30 min)

**Tasks:**
- End-to-end: Human query → Decomposition → Specialists → Synthesis
- Memory round-trip: Store → Recall → Verify
- Debate flow: High-stakes task → Advocate → Critic → Resolution
- Failure loop: 2 failures → Debate → Retry/Escalate

**Deliverable:** Integration test suite  
**Success Criteria:** All integration scenarios pass

#### 4.3 Performance Tests (20 min)

**Tasks:**
- Measure Graphiti latency (p95 targets)
- Measure specialist spawn time
- Measure end-to-end task completion time
- Token usage per task type

**Deliverable:** Performance baseline metrics  
**Success Criteria:**
- Episode ingestion: <200ms (p95)
- Hybrid search: <300ms (p95)
- Full task: <5s

#### 4.4 Validation Checklist (10 min)

Run CLI validation:
```bash
npm run swarm validate --phase 4 --verbose
```

**Deliverable:** All phases validated  
**Success Criteria:** 100% checks pass

**Phase 4 Rollback:** N/A (testing only)

---

### Phase 5: Deployment & Monitoring (30-45 min)

**Objective:** Deploy to production Clawdbot, set up monitoring.

#### 5.1 Update Clawdbot Configuration (15 min)

**File:** `~/.clawdbot/clawdbot.json`

**Tasks:**
- Enable swarm routing
- Configure memory MCP
- Set up cron jobs for maintenance

```json
{
  "agents": {
    "defaults": {
      "swarm": {
        "enabled": true,
        "router": "auto",
        "specialists": ["memory", "file", "web", "tool"],
        "debate": {
          "enabled": true,
          "stakes_threshold": "medium"
        }
      },
      "memorySearch": {
        "enabled": true,
        "graphiti": {
          "enabled": true,
          "fallback": "jsonl"
        }
      }
    }
  },
  "cron": {
    "jobs": [
      {"id": "memory-daily", "schedule": "0 3 * * *", "task": "Memory maintenance"},
      {"id": "memory-weekly", "schedule": "0 4 * * 0", "task": "Weekly consolidation"}
    ]
  }
}
```

**Deliverable:** Production config  
**Success Criteria:** Clawdbot gateway restarts without errors

#### 5.2 Set Up Monitoring (15 min)

**Tasks:**
- Enable routing decision logging to `memory/YYYY-MM-DD.md`
- Enable performance metrics to `memory/metrics/YYYY-MM-DD.jsonl`
- Set up alerting for Graphiti connection failures

**Deliverable:** Monitoring pipeline  
**Success Criteria:** Logs appear, metrics recorded

#### 5.3 Gradual Rollout (10 min)

**Tasks:**
- Enable swarm for specific task types first (e.g., file operations)
- Monitor for 24h
- Expand to all ACTION tasks
- Monitor for 48h
- Enable debate layer

**Deliverable:** Phased rollout complete  
**Success Criteria:** No regressions in 48h monitoring window

**Phase 5 Rollback:**
```bash
# Disable swarm in config
jq '.agents.defaults.swarm.enabled = false' ~/.clawdbot/clawdbot.json > tmp && mv tmp ~/.clawdbot/clawdbot.json
clawdbot gateway restart
```

---

## 4. Risk Assessment

### Technical Risks

| Risk | Severity | Likelihood | Mitigation | Owner |
|------|----------|------------|------------|-------|
| Neo4j connection failures | High | Low | JSONL fallback, health checks | Phase 2 |
| OpenAI API rate limits | Medium | Medium | Request queuing, backoff | Phase 2 |
| LLM extraction quality | Medium | Medium | Prompt tuning, manual review | Phase 2 |
| Python/TS interop latency | Medium | Low | Async calls, connection pooling | Phase 2 |
| Sub-agent spawn overhead | Medium | Medium | Lazy spawn, session reuse | Phase 3 |
| Swarm overhead for simple tasks | Low | High | Router bypass, ANSWER precedence | Phase 1 |
| Debate loops (infinite) | High | Low | Max 3 rounds, auto-escalate | Phase 3 |

### Operational Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Cost overrun (OpenAI) | Medium | Medium | Budget caps, monitoring |
| Memory growth (Neo4j) | Medium | Medium | Decay cron, pruning |
| Breaking existing workflows | High | Low | Feature flags, gradual rollout |
| Debugging complexity | Medium | High | Comprehensive logging, CSP/1 traces |

### Cost Estimates

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| Neo4j (Docker) | $0 | Self-hosted |
| Graphiti/OpenAI | $5-20 | Entity extraction, ~1000 episodes/mo |
| Compute overhead | ~5% | Sub-agent spawning |
| **Total** | **$5-20/mo** | Mostly OpenAI API |

---

## 5. Go/No-Go Recommendation

### Prerequisites Checklist

| Requirement | Status | Blocker? |
|-------------|--------|----------|
| Neo4j installable | ✅ Docker available | No |
| Graphiti installable | ✅ pip available | No |
| OpenAI API key | ⚠️ Needs setup | Yes |
| Clawdbot sub-agent API | ⚠️ Needs verification | Partial |
| CLI tools working | ✅ 19/19 tests pass | No |
| AGENTS.md modifiable | ✅ Full access | No |

### Go/No-Go Matrix

| Criterion | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Design completeness | 25% | 9/10 | 2.25 |
| Dependency availability | 20% | 7/10 | 1.40 |
| Risk mitigation readiness | 15% | 8/10 | 1.20 |
| Rollback capability | 15% | 9/10 | 1.35 |
| Time estimate confidence | 15% | 7/10 | 1.05 |
| Value/benefit ratio | 10% | 9/10 | 0.90 |
| **Total** | 100% | | **8.15/10** |

### Recommendation: ✅ **GO**

**Rationale:**
1. Architecture design is comprehensive and well-reviewed
2. All dependencies are available (Neo4j, Graphiti, OpenAI)
3. JSONL fallback mitigates Graphiti failures
4. CLI tooling already working (validates approach)
5. Phased rollout minimizes risk
6. Rollback procedures documented for each phase

**Conditions:**
1. **Must** verify OpenAI API key before Phase 2
2. **Must** validate Clawdbot sub-agent spawn mechanism before Phase 3
3. **Should** run Phase 0 validation before proceeding
4. **Should** allow 24h monitoring between Phase 4 and Phase 5

### Alternative: Partial Implementation

If full implementation is too risky:

1. **MVP Option:** Skip Graphiti, use JSONL-only memory
   - Removes Neo4j/OpenAI dependency
   - Reduces Phase 2 to 30 min
   - Loses temporal features, hybrid search

2. **Staged Option:** Implement Phases 0-1 only
   - Gets CSP/1 routing working
   - Specialists use existing tools directly
   - Add Graphiti later when validated

---

## 6. Summary

### Timeline

| Phase | Duration | Dependencies | Deliverables |
|-------|----------|--------------|--------------|
| Phase 0 | 45-60 min | None | Neo4j, Graphiti, env setup |
| Phase 1 | 90-120 min | Phase 0 | CSP/1 parser, router, spawn |
| Phase 2 | 90-120 min | Phase 1 | Graphiti client, Memory Specialist |
| Phase 3 | 60-90 min | Phase 2 | Sub-agents, debate orchestration |
| Phase 4 | 60-90 min | Phase 3 | Tests, validation |
| Phase 5 | 30-45 min | Phase 4 | Production deployment |
| **Total** | **6-8.5 hours** | | |

### Success Metrics

After full implementation:
- [ ] ANSWER vs ACTION routing accuracy >95%
- [ ] Specialist response time <500ms (p95)
- [ ] Memory store/recall round-trip <1s
- [ ] Debate resolution time <10s
- [ ] Zero regressions in existing workflows
- [ ] Token reduction 60-80% vs baseline

### Next Steps

1. **Review this plan** and provide feedback
2. **Verify OpenAI API key** availability
3. **Run Phase 0** to validate environment
4. **Execute Phases 1-5** sequentially
5. **Monitor for 48h** after Phase 5
6. **Iterate based on metrics**

---

**This plan is ready for execution. Begin with Phase 0 Prerequisites.**

🚀 **Estimated completion: 1-2 working days** 🚀
