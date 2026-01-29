# Clawdbot Swarm Implementation - Execution Plan

**Version:** 1.0  
**Date:** January 30, 2026  
**Model:** Claude Sonnet 4.5  
**Branch:** execution-plan-sonnet  
**Status:** Ready for Review

---

## Executive Summary

**Context:** Complete architecture design merged to main. All specifications, protocols, and integration patterns documented. Ready for actual implementation.

**Current State:** DESIGN COMPLETE (0% implementation)

**Go/No-Go Recommendation:** ✅ **GO** with phased rollout and validation gates

**Estimated Timeline:** 32-40 hours total (8 phases)

**Risk Level:** MEDIUM (mitigated by extensive design, clear rollback paths)

---

## 1. MATURITY ASSESSMENT

### Methodology
Reviewed all documentation in `/Users/talas9/clawd/Projects/clawdbot-swarm/`:
- Core design documents (12 files)
- Specialist specifications (4 files)
- Memory tier configs (2 files)
- Sub-agent specs (5 files)
- Maintenance procedures (4 files)
- Testing guidelines (2 files)

### Component Ratings

#### Core Architecture - **READY** ✅
**Files:** `design/DESIGN-OVERVIEW.md`, `CSP1.md`, `router.md`, `SKILL.md`

**Status:**
- CSP/1 protocol: Fully specified with examples
- Task routing: Complete with triggers, confidence levels, debate rules
- Role hierarchy: Clear Orchestrator → Sub-agent → Specialist separation
- Communication patterns: Detailed CSP/1 vs natural language boundaries

**Gaps:** None (ready to implement)

**Evidence:**
- 60-80% token reduction measured in design
- Complete protocol specification with validation rules
- Router includes soft (prompt) and hard (code) enforcement options
- Edge cases documented with examples

#### Memory Tier Design - **READY** ✅
**Files:** `memory-tiers/config.md`, `memory-tiers/graph-schema.md`

**Status:**
- Tier definitions complete (ultra/short/medium/long/archive)
- Migration rules specified (upward/downward/deletion)
- Decay algorithms defined
- Storage locations clear

**Gaps:** None (ready to implement)

**Evidence:**
- Clear routing rules for each tier
- Decay thresholds specified (7/30/never days)
- Format specifications for JSONL and Markdown
- Graph schema with 7 entity types, 6 relation types

#### Graphiti Integration - **READY** ✅
**Files:** `design/specs/memory-specialist-graphiti.md`, `specialists/memory.md`

**Status:**
- Episode-based storage pattern specified
- Hybrid search (semantic + keyword + graph) documented
- Temporal query patterns defined
- MCP integration architecture clear
- Python client template provided

**Gaps:** None (implementation path clear)

**Evidence:**
- Complete API usage examples
- Bi-temporal model explained (valid_at, invalid_at, created_at)
- Auto-extraction via LLM documented
- Performance targets specified (<200ms ingestion, <300ms search)

#### Specialist Agents - **READY** ✅
**Files:** `specialists/*.md` (memory, file, web, tool)

**Status:**
- All 4 specialists fully specified
- CSP/1 input/output protocols defined
- Operations enumerated with examples
- Constraints documented (token limits, chunk sizes)

**Gaps:** None (ready to implement)

**Evidence:**
- Memory Specialist: 6 operations (store, recall, query_relations, temporal_query, link, decay)
- File Specialist: 4 operations (search, read, write, list)
- Web Specialist: 3 operations (search, fetch, api)
- Tool Specialist: 3 operations (exec, browser, mcp)
- All include error handling patterns

#### Sub-Agent Layer - **READY** ✅
**Files:** `subagents/*.md` (analyzer, planner, advocate, critic, debate-protocol)

**Status:**
- Task decomposition (Analyzer) specified
- Execution optimization (Planner) defined
- Dialectic reasoning (Advocate/Critic) complete
- Debate protocol with triggers and resolution rules

**Gaps:** None (ready to implement)

**Evidence:**
- Analyzer: Max 10 tasks, dependency tracking
- Planner: Parallel execution, token optimization
- Advocate: PLAN + CONFIDENCE + ASSUMPTIONS format
- Critic: RISKS + BLIND_SPOTS + COUNTER format
- Synthesis: 5 outcomes (PROCEED/MODIFY/RETRY/PIVOT/ESCALATE)

#### Testing & Validation - **NEEDS_WORK** ⚠️
**Files:** `TESTING.md`, `MEMORY-ACCESS-AUDIT.md`

**Status:**
- Test scenarios documented
- Validation checklists created
- Memory boundary audit completed

**Gaps:**
- No automated test suite (manual tests only)
- No performance benchmark harness
- No integration test runner

**Evidence:**
- 40+ test scenarios specified
- Pass/fail criteria defined
- But all manual execution required

**Recommendation:** Add automated test harness in Phase 4

#### Maintenance Procedures - **READY** ✅
**Files:** `maintenance/*.md` (daily, weekly, monthly, optimizer)

**Status:**
- Daily decay procedures specified
- Weekly consolidation defined
- Monthly rebuild documented
- Meta-optimizer with adjustment rules

**Gaps:** None (ready to implement as cron jobs)

**Evidence:**
- Decay parameters: 0.1/day (short), 0.05/day (medium)
- Consolidation: Promote high-access to MEMORY.md
- Rebuild: Full Neo4j backup + prune >90 days
- Optimizer: 5 metrics tracked, adjustment thresholds defined

#### CLI Utilities - **READY** ✅
**Files:** `swarm-cli/` directory

**Status:**
- UUID generation: ✅ Implemented
- Task ID hashing: ✅ Implemented
- Scaffolding: ✅ Implemented
- Memory init: ✅ Implemented
- Validation: ✅ Implemented
- Tests: 19/19 passing

**Gaps:** None (fully functional)

**Evidence:**
- All 5 commands working
- SHA-256 canonicalization tested
- Deterministic UUID generation verified
- Phase validation rules defined

### Overall Maturity Score

| Component | Rating | Readiness |
|-----------|--------|-----------|
| Core Architecture | READY | 100% |
| Memory Tiers | READY | 100% |
| Graphiti Integration | READY | 100% |
| Specialist Agents | READY | 100% |
| Sub-Agent Layer | READY | 100% |
| Testing | NEEDS_WORK | 60% |
| Maintenance | READY | 100% |
| CLI Utilities | READY | 100% |

**Average:** 95% ready (only automated testing gaps)

---

## 2. GAP ANALYSIS

### What's Well-Defined and Ready

#### 1. Architecture & Protocols ✅
- CSP/1 protocol with validation rules
- Task routing with deterministic triggers
- Memory access boundaries (ONLY Memory Specialist)
- Communication patterns (natural language vs CSP/1)
- Role hierarchy (Orchestrator → Sub-agent → Specialist)

#### 2. Memory System ✅
- Tier definitions with clear routing rules
- Graphiti integration architecture (episode-based)
- Temporal query patterns (bi-temporal model)
- Decay algorithms with thresholds
- Graph schema (entities, relations, weights)

#### 3. Agent Specifications ✅
- All 4 specialists fully defined
- All 4 sub-agents fully specified
- Dialectic debate protocol complete
- Failure tracking and loop prevention
- Error handling patterns

#### 4. Operational Procedures ✅
- Daily/weekly/monthly maintenance
- Meta-optimizer adjustment rules
- Backup and rollback strategies
- Monitoring metrics defined

### What Needs More Detail

#### 1. Automated Testing ⚠️
**Current:** Manual test scenarios documented

**Needed:**
- Test runner/harness (e.g., Jest, pytest)
- Automated boundary violation tests
- Performance benchmark suite
- Integration test orchestration
- CI/CD integration

**Priority:** HIGH (essential for validation)

**Effort:** 6-8 hours

#### 2. Production Configuration ⚠️
**Current:** Development setup documented

**Needed:**
- Production environment variables
- Secrets management (API keys, DB passwords)
- Rate limiting for OpenAI/Graphiti
- Resource limits (memory, CPU)
- Monitoring/alerting thresholds

**Priority:** MEDIUM (needed before production)

**Effort:** 2-3 hours

#### 3. Migration Strategy ⚠️
**Current:** Fresh start recommended, JSONL import option mentioned

**Needed:**
- Existing JSONL → Graphiti migration script
- Data validation after migration
- Rollback procedure if migration fails
- Timeline for migration (if not fresh start)

**Priority:** LOW (only if migrating existing data)

**Effort:** 4-5 hours (if needed)

#### 4. Error Recovery ⚠️
**Current:** Error handling patterns specified

**Needed:**
- Circuit breaker implementation (after N failures)
- Retry logic with exponential backoff
- Graceful degradation (when Graphiti unavailable)
- Fallback to JSONL if MCP fails

**Priority:** MEDIUM (improves resilience)

**Effort:** 3-4 hours

### Missing Dependencies

#### 1. Infrastructure
- ✅ Neo4j 5.26+ (install required)
- ✅ Python 3.10+ (install required)
- ✅ OpenAI API key (obtain required)
- ✅ Clawdbot MCP support (verify version)

**Action:** Phase 0 prerequisite checks

#### 2. Clawdbot Core
- ⚠️ MCP client implementation (verify exists)
- ⚠️ Sub-agent spawning capability (verify works)
- ⚠️ Session memory API (verify available)

**Action:** Phase 0 compatibility validation

#### 3. External Services
- ✅ OpenAI embeddings API (for Graphiti)
- ✅ OpenAI LLM API (for entity extraction)
- ⚠️ Alternative LLM providers (optional fallback)

**Action:** Phase 1 API key configuration

### Risks

#### Technical Risks

**Risk 1: Graphiti Entity Extraction Quality**
- **Severity:** MEDIUM
- **Likelihood:** MEDIUM
- **Impact:** Incorrect entities/relations in knowledge graph
- **Mitigation:** 
  - Test with diverse input samples
  - Manual review of first 100 episodes
  - Tune extraction prompts if needed
  - Fallback to structured episodes (explicit entities)

**Risk 2: MCP Interop Reliability**
- **Severity:** MEDIUM
- **Likelihood:** LOW
- **Impact:** Memory operations fail, system degraded
- **Mitigation:**
  - Implement fallback to direct JSONL writes
  - Circuit breaker after 3 MCP failures
  - Health check endpoint on MCP server
  - Graceful degradation mode

**Risk 3: Performance Under Load**
- **Severity:** MEDIUM
- **Likelihood:** MEDIUM
- **Impact:** Slow responses, timeout errors
- **Mitigation:**
  - Performance benchmarks before production
  - Rate limiting on Graphiti calls
  - Caching layer for frequent queries
  - Load testing with realistic traffic

**Risk 4: Context Compaction Breaking Swarm**
- **Severity:** HIGH
- **Likelihood:** LOW
- **Impact:** Specialists lose context, CSP/1 parsing fails
- **Mitigation:**
  - Store specialist state in memory files
  - Resume capability from failures.jsonl
  - Stateless specialist design (no session memory)
  - Test compaction scenarios explicitly

**Risk 5: Token Cost Explosion**
- **Severity:** MEDIUM
- **Likelihood:** LOW
- **Impact:** High OpenAI API bills
- **Mitigation:**
  - CSP/1 protocol reduces tokens by 60-80%
  - Monitor token usage per operation
  - Set monthly budget alerts
  - Local LLM fallback for entity extraction (if needed)

#### Operational Risks

**Risk 6: Incomplete Rollback**
- **Severity:** HIGH
- **Likelihood:** LOW
- **Impact:** Cannot revert to old system
- **Mitigation:**
  - Backup AGENTS.md before modification
  - Feature flags for swarm mode
  - Parallel operation during transition
  - Documented rollback procedure (Phase 6)

**Risk 7: Memory Growth Runaway**
- **Severity:** MEDIUM
- **Likelihood:** MEDIUM
- **Impact:** Neo4j database fills disk
- **Mitigation:**
  - Automated maintenance cron jobs
  - Disk space monitoring/alerts
  - Decay effectiveness metrics
  - Manual pruning procedure documented

**Risk 8: Debate Loop Stalling**
- **Severity:** LOW
- **Likelihood:** LOW
- **Impact:** Tasks hang waiting for debate resolution
- **Mitigation:**
  - Max debate time limit (60s)
  - Auto-escalate after 3 failures
  - Bypass option for user ("skip confirmation")
  - Timeout monitoring

---

## 3. PHASED EXECUTION PLAN

### Phase 0: Prerequisites & Environment Setup

**Duration:** 4-6 hours

**Objective:** Verify dependencies, install infrastructure, validate compatibility

#### Deliverables
1. Neo4j 5.26+ running and accessible
2. Python 3.10+ with Graphiti installed
3. MCP server configured and tested
4. OpenAI API key configured
5. Clawdbot compatibility validated
6. Development environment ready

#### Prerequisites
- None (starting point)

#### Tasks

**0.1 Verify Clawdbot Version (30 min)**
```bash
# Check Clawdbot has MCP support
clawdbot --version
clawdbot mcp status

# Check sub-agent spawning works
clawdbot test-spawn-subagent

# Check session memory API available
clawdbot memory-api-check
```

**Expected Output:**
- Clawdbot version with MCP support
- MCP status shows available servers
- Sub-agent spawn test passes

**Failure Action:** Upgrade Clawdbot or report incompatibility

---

**0.2 Install Neo4j (1-2 hours)**

**Option A: Docker (Recommended)**
```bash
docker pull neo4j:5.26
docker run -d \
  --name clawdbot-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/graphiti_memory_2026 \
  -v $HOME/neo4j/data:/data \
  neo4j:5.26

# Verify running
curl http://localhost:7474
```

**Option B: Neo4j Desktop**
- Download from https://neo4j.com/download/
- Install GUI application
- Create database "clawdbot-swarm"
- Set password: graphiti_memory_2026

**Validation:**
```bash
# Test connection
echo "RETURN 1 as test" | cypher-shell -a bolt://localhost:7687 -u neo4j -p graphiti_memory_2026
```

**Expected Output:** `test: 1`

**Failure Action:** Check ports 7474/7687 not in use, review Docker logs

---

**0.3 Install Python & Graphiti (1 hour)**
```bash
# Install Python 3.10+ (if needed)
pyenv install 3.10.13
pyenv global 3.10.13

# Create virtual environment
cd ~/clawd/Projects/clawdbot-swarm
python -m venv venv
source venv/bin/activate

# Install Graphiti
pip install graphiti-core

# Verify installation
python -c "from graphiti_core import Graphiti; print('Graphiti installed')"
```

**Validation:**
```python
from graphiti_core import Graphiti
graphiti = Graphiti(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="graphiti_memory_2026"
)
print("Connection successful")
```

**Expected Output:** `Connection successful`

**Failure Action:** Check Neo4j running, verify credentials, review Python version

---

**0.4 Configure MCP Server (1-2 hours)**

**Create MCP config file:** `~/.clawdbot/mcp_config.json`
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
        "NEO4J_PASSWORD": "graphiti_memory_2026",
        "GRAPHITI_LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**Test MCP server:**
```bash
# Start MCP server manually
uvx graphiti-mcp-server

# In another terminal, test MCP tools
clawdbot mcp list-tools graphiti

# Should show: memory_search, memory_get, memory_add, etc.
```

**Validation:**
```bash
clawdbot mcp call graphiti memory_search '{"query": "test"}'
```

**Expected Output:** JSON response (may be empty)

**Failure Action:** Check OPENAI_API_KEY set, verify Neo4j connection, review MCP logs

---

**0.5 Initialize Memory Structure (30 min)**
```bash
cd ~/clawd

# Create memory directories
mkdir -p memory/metrics

# Initialize files
touch memory/failures.jsonl
touch memory/active-tasks.md

# Or use CLI tool
cd Projects/clawdbot-swarm
npm run swarm init-memory --path ~/clawd
```

**Create initial files:**

**memory/active-tasks.md:**
```markdown
# Active Tasks

Last updated: 2026-01-30

## Running Tasks
_No active tasks_

## Completed Today
_No completed tasks_
```

**memory/failures.jsonl:**
```json

```
(empty file, JSONL append-only)

**Validation:**
```bash
ls -la ~/clawd/memory/
# Should show: failures.jsonl, active-tasks.md, metrics/
```

---

**0.6 Configure API Keys (30 min)**

**Add to environment:**
```bash
# ~/.zshrc or ~/.bashrc
export OPENAI_API_KEY="sk-..."
export NEO4J_PASSWORD="graphiti_memory_2026"

source ~/.zshrc
```

**Add to Clawdbot config:** `~/.clawdbot/clawdbot.json`
```json
{
  "llm": {
    "provider": "openai",
    "apiKey": "${OPENAI_API_KEY}"
  },
  "memory": {
    "graphiti": {
      "enabled": true,
      "neo4jUri": "bolt://localhost:7687",
      "neo4jUser": "neo4j",
      "neo4jPassword": "${NEO4J_PASSWORD}"
    }
  }
}
```

**Validation:**
```bash
echo $OPENAI_API_KEY | cut -c1-10
# Should show: sk-proj-...

clawdbot config validate
```

**Expected Output:** All config checks pass

---

#### Success Criteria
- [ ] Neo4j accessible at bolt://localhost:7687
- [ ] Python Graphiti library installed and imports
- [ ] MCP server starts and responds to test query
- [ ] OpenAI API key valid
- [ ] Memory directories initialized
- [ ] Clawdbot MCP support confirmed

#### Rollback Strategy
If Phase 0 fails:
- Stop Neo4j Docker container
- Deactivate Python venv
- Remove MCP config file
- Continue using Clawdbot without swarm mode

**No data loss:** No changes to existing Clawdbot installation yet

---

### Phase 1: Core Infrastructure (CSP/1, Router, Specialists)

**Duration:** 8-10 hours

**Objective:** Implement CSP/1 protocol, task routing, and specialist agents

#### Deliverables
1. CSP/1 parser and formatter (TypeScript)
2. Task router (soft enforcement)
3. All 4 specialist agents operational
4. Memory Specialist connected to Graphiti MCP
5. Specialist boundary tests passing

#### Prerequisites
- Phase 0 complete (Neo4j, Graphiti, MCP working)

#### Tasks

**1.1 Implement CSP/1 Parser (2 hours)**

**File:** `~/clawd/lib/csp1-parser.ts`

**Implementation:**
```typescript
// Based on design/specs/CSP1.md

export interface CSP1Response {
  status: 'OK' | 'PARTIAL' | 'FAIL';
  scope: string[];
  data: string[];
  readRecs?: string[];
  relevance?: number[];
  links?: Array<{ e1: string; e2: string; weight: number }>;
  snippet?: string[];
  execTime?: number;
}

export interface CSP1Task {
  action: string;
  scope: string;
  outputType: string;
  params?: Record<string, unknown>;
}

export function parseCSP1Response(raw: string): CSP1Response {
  // Parse STATUS, SCOPE, DATA, etc.
  // See template in swarm-memory-implementation-plan.md Phase 4.1
}

export function formatCSP1Task(task: CSP1Task): string {
  // Format as: TASK REQ:action IN:scope OUT:type
}

export function validateCSP1Response(response: CSP1Response): boolean {
  // L2: No full content (check data lengths)
  // L3: Max 2500 tokens
  // Return true if valid
}
```

**Test:**
```typescript
// test/csp1-parser.test.ts
describe('CSP1 Parser', () => {
  it('parses memory response', () => {
    const raw = `STATUS OK
SCOPE [auth,jwt]
DATA mem:uuid-123
RELEVANCE 0.89`;
    const parsed = parseCSP1Response(raw);
    expect(parsed.status).toBe('OK');
    expect(parsed.scope).toEqual(['auth', 'jwt']);
  });

  it('validates token limit', () => {
    const huge = { status: 'OK', scope: [], data: ['x'.repeat(10000)] };
    expect(validateCSP1Response(huge)).toBe(false);
  });
});
```

**Validation:**
```bash
npm test -- csp1-parser
# All tests pass
```

---

**1.2 Implement Task Router (2 hours)**

**File:** `~/clawd/skills/swarm-memory/router.ts`

**Implementation:**
```typescript
// Based on skills/swarm-memory/router.md

export type RoutingMode = 'ANSWER' | 'ACTION';
export type Confidence = 'STRONG' | 'WEAK' | 'NONE';

export function classifyTask(message: string): RoutingMode {
  // Priority 1: ANSWER precedence
  const questionPattern = /^(what is|explain|how does|why|should i)/i;
  const externalRefs = [
    /https?:\/\//,
    /\.(ts|md|js|py|json|yml)/,
    /src\/|\/|~\//
  ];
  
  const isQuestion = questionPattern.test(message);
  const hasExternalRefs = externalRefs.some(p => p.test(message));
  
  if (isQuestion && !hasExternalRefs) {
    return 'ANSWER';
  }
  
  // Priority 2: ACTION triggers
  const actionTriggers = [
    /(fix|debug|implement|create|update)/i,
    /(search|find|grep)/i,
    /(run|execute|deploy)/i,
    ...externalRefs
  ];
  
  if (actionTriggers.some(p => p.test(message))) {
    return 'ACTION';
  }
  
  return 'ANSWER'; // Default
}

export function getConfidence(message: string): Confidence {
  // Count triggers, return STRONG (3+), WEAK (1-2), or NONE
}

export function shouldDebate(task: string, mode: RoutingMode): boolean {
  // Check debate triggers: destructive, deployment, security, bulk
  // See router.md for full list
}
```

**Integration:** Update `AGENTS.md`
```markdown
## Task Routing (Automatic)

Before processing user request, route task:

1. Load router from `skills/swarm-memory/router.ts`
2. Classify: `const mode = classifyTask(userMessage)`
3. Get confidence: `const conf = getConfidence(userMessage)`
4. Log decision to `memory/YYYY-MM-DD.md`
5. If mode == 'ANSWER': Respond directly
6. If mode == 'ACTION': Activate swarm (decompose & delegate)
```

**Test:**
```typescript
describe('Task Router', () => {
  it('routes questions to ANSWER', () => {
    expect(classifyTask('What is HPOS?')).toBe('ANSWER');
  });

  it('routes file ops to ACTION', () => {
    expect(classifyTask('Fix the bug in src/auth.ts')).toBe('ACTION');
  });

  it('detects STRONG confidence', () => {
    const task = 'fix auth.ts and update tests';
    expect(getConfidence(task)).toBe('STRONG'); // 4 triggers
  });
});
```

---

**1.3 Implement Memory Specialist (3 hours)**

**File:** `~/clawd/skills/swarm-memory/specialists/memory-agent.ts`

**Implementation:**
```typescript
// Based on specialists/memory.md

export class MemorySpecialist {
  private mcp: MCPClient; // Clawdbot's MCP client
  
  constructor(mcpClient: MCPClient) {
    this.mcp = mcpClient;
  }
  
  async store(params: {
    content: string;
    tier: 'ultra' | 'short' | 'medium' | 'long';
    tags?: string[];
    source?: string;
  }): Promise<CSP1Response> {
    // Route to appropriate storage
    if (params.tier === 'ultra') {
      // In-context, no Graphiti
      return this.formatResponse('OK', ['memory'], [`ctx:${Date.now()}`]);
    }
    
    // For short/medium/long: Use Graphiti MCP
    const result = await this.mcp.call('graphiti', 'memory_add', {
      name: `${params.tier}_${Date.now()}`,
      episode_body: params.content,
      source_description: params.source || 'User input',
      reference_time: new Date().toISOString()
    });
    
    // Also write to daily log if short tier
    if (params.tier === 'short') {
      await this.writeToDailyLog(params.content);
    }
    
    return this.formatResponse('OK', ['memory'], [`mem:${result.uuid}`]);
  }
  
  async recall(params: {
    query: string;
    maxResults?: number;
    minRelevance?: number;
  }): Promise<CSP1Response> {
    // Call Graphiti hybrid search via MCP
    const results = await this.mcp.call('graphiti', 'memory_search', {
      query: params.query,
      num_results: params.maxResults || 5
    });
    
    // Format as CSP/1
    return this.formatMemoryResults(results);
  }
  
  // ... implement other operations (query_relations, temporal_query, etc.)
}
```

**Integration:** Spawn as sub-agent when needed
```typescript
// In Orchestrator
if (mode === 'ACTION' && taskNeedsMemory(task)) {
  const memSpec = await spawnSubAgent({
    role: 'MemorySpecialist',
    context: 'skills/swarm-memory/specialists/memory.md',
    protocol: 'CSP1'
  });
  
  const response = await memSpec.send(formatCSP1Task({
    action: 'recall',
    scope: 'MEM',
    outputType: 'MEM_REFS',
    params: { query: 'auth bugs' }
  }));
  
  const parsed = parseCSP1Response(response);
  // Use parsed.data, parsed.relevance, etc.
}
```

**Test:**
```bash
# Manual test: Store episode
clawdbot test-specialist memory store --content "Test memory" --tier short

# Manual test: Recall
clawdbot test-specialist memory recall --query "test"

# Should return episode with relevance score
```

---

**1.4 Implement File Specialist (1 hour)**

**File:** `~/clawd/skills/swarm-memory/specialists/file-agent.ts`

**Implementation:**
```typescript
// Based on specialists/file.md

export class FileSpecialist {
  async search(params: {
    pattern: string;
    scope: string;
    type: 'content' | 'filename';
  }): Promise<CSP1Response> {
    // Use ripgrep for content search
    if (params.type === 'content') {
      const results = await exec(`rg -n "${params.pattern}" ${params.scope}`);
      return this.formatFileResults(results);
    }
    
    // Use find for filename search
    const results = await exec(`find ${params.scope} -name "*${params.pattern}*"`);
    return this.formatFileResults(results);
  }
  
  async read(params: {
    file: string;
    startLine: number;
    endLine: number;
  }): Promise<CSP1Response> {
    // Enforce L4: Max 500 lines
    if (params.endLine - params.startLine > 500) {
      return this.formatResponse('FAIL', [], ['none'], 'Exceeds 500 line limit');
    }
    
    const content = await readFileLines(params.file, params.startLine, params.endLine);
    return this.formatResponse('OK', [path.dirname(params.file)], [content]);
  }
  
  // ... implement write, list
}
```

**Critical:** File Specialist NEVER accesses:
- `memory/` directory (delegate to Memory Specialist)
- `MEMORY.md` (delegate to Memory Specialist)
- Graphiti MCP

**Test:**
```typescript
describe('File Specialist Boundaries', () => {
  it('rejects memory directory access', async () => {
    const spec = new FileSpecialist();
    const result = await spec.read({ file: 'memory/2026-01-30.md', startLine: 1, endLine: 10 });
    expect(result.status).toBe('FAIL');
    expect(result.data).toContain('Access denied: memory files');
  });
});
```

---

**1.5 Implement Web & Tool Specialists (1 hour each)**

**Similar structure:**
- Web: Uses `brave_search`, `web_fetch` tools
- Tool: Uses `exec`, `browser` tools
- Both return CSP/1 format
- Neither access memory

---

**1.6 Test Specialist Boundaries (1 hour)**

**Create:** `~/clawd/test/specialist-boundaries.test.ts`

**Tests:**
- File Specialist cannot read memory/ files
- Web Specialist cannot access memory MCP
- Tool Specialist cannot access memory MCP
- Only Memory Specialist can call memory_search
- Violations return STATUS FAIL

**Run:**
```bash
npm test -- specialist-boundaries
# All tests pass (4 boundary violations correctly rejected)
```

---

#### Success Criteria
- [ ] CSP/1 parser handles all response types
- [ ] Task router correctly classifies 20+ sample tasks
- [ ] Memory Specialist stores/recalls via Graphiti MCP
- [ ] File/Web/Tool Specialists operational
- [ ] Boundary tests pass (0 violations)
- [ ] Routing decisions logged to daily memory

#### Rollback Strategy
If Phase 1 fails:
- Disable swarm mode in AGENTS.md
- Remove router from prompt
- Continue with direct responses only
- No data loss (Graphiti still accessible)

---

### Phase 2: Graphiti Memory Integration

**Duration:** 6-8 hours

**Objective:** Full Graphiti integration with hybrid search, temporal queries, and graph traversal

#### Deliverables
1. Episode-based storage working
2. Hybrid search returning relevant results
3. Temporal queries (point-in-time) functional
4. Entity relation traversal working
5. Memory tiers routing correctly

#### Prerequisites
- Phase 0 complete (Graphiti MCP running)
- Phase 1 complete (Memory Specialist operational)

#### Tasks

**2.1 Implement Episode Storage (2 hours)**

**Enhance Memory Specialist:**
```typescript
// In memory-agent.ts

async store(params): Promise<CSP1Response> {
  // Determine episode type
  const sourceType = this.inferSourceType(params.content);
  
  // Call Graphiti via MCP
  const episode = await this.mcp.call('graphiti', 'memory_add', {
    name: this.generateEpisodeName(params.tier, params.content),
    episode_body: params.content,
    source_description: params.source || 'User conversation',
    source: sourceType, // EpisodeType.message, .text, .json, .speech
    reference_time: new Date().toISOString()
  });
  
  // Log to daily file for short-term
  if (params.tier === 'short') {
    await this.appendToDailyLog({
      timestamp: new Date().toISOString(),
      content: params.content,
      episodeUuid: episode.uuid,
      tags: params.tags
    });
  }
  
  // For long-term, also append to MEMORY.md
  if (params.tier === 'long') {
    await this.appendToMemoryMd(params.content);
  }
  
  return {
    status: 'OK',
    scope: ['memory'],
    data: [`mem:${episode.uuid}`],
    tierWritten: params.tier
  };
}
```

**Test:**
```typescript
it('stores episode and returns UUID', async () => {
  const spec = new MemorySpecialist(mcpClient);
  const result = await spec.store({
    content: 'JWT refresh tokens have a race condition',
    tier: 'short',
    tags: ['auth', 'bug']
  });
  
  expect(result.status).toBe('OK');
  expect(result.data[0]).toMatch(/^mem:[a-f0-9-]+$/);
});
```

---

**2.2 Implement Hybrid Search (2 hours)**

**Enhance recall method:**
```typescript
async recall(params): Promise<CSP1Response> {
  // Call Graphiti hybrid search (semantic + keyword + graph)
  const searchResults = await this.mcp.call('graphiti', 'memory_search', {
    query: params.query,
    num_results: params.maxResults || 10,
    center_node_uuid: params.centerNode || null
  });
  
  // Filter by relevance threshold
  const filtered = searchResults
    .filter(r => r.relevance >= (params.minRelevance || 0.3))
    .slice(0, params.maxResults || 10);
  
  // Extract entities and relations
  const entities = this.extractEntities(filtered);
  const relations = this.extractRelations(filtered);
  
  // Format as CSP/1
  return {
    status: filtered.length > 0 ? 'OK' : 'PARTIAL',
    scope: entities.slice(0, 5),
    data: filtered.map(r => `mem:${r.uuid}`),
    relevance: filtered.map(r => r.relevance),
    links: relations.slice(0, 5).map(r => ({
      e1: r.source,
      e2: r.target,
      weight: r.weight
    })),
    snippet: filtered.slice(0, 3).map(r => 
      `${r.uuid}:"${r.content.slice(0, 200)}"`
    )
  };
}
```

**Test:**
```typescript
it('searches with hybrid approach', async () => {
  // Store test episodes
  await spec.store({ content: 'JWT auth implementation', tier: 'short' });
  await spec.store({ content: 'Session token handling', tier: 'short' });
  
  // Search
  const result = await spec.recall({ query: 'authentication' });
  
  expect(result.status).toBe('OK');
  expect(result.data.length).toBeGreaterThan(0);
  expect(result.relevance[0]).toBeGreaterThan(0.3);
});
```

---

**2.3 Implement Temporal Queries (2 hours)**

**Add temporal query method:**
```typescript
async temporalQuery(params: {
  entity: string;
  timestamp: string; // ISO 8601
}): Promise<CSP1Response> {
  // Query Graphiti for entity state at specific time
  // Note: Direct temporal API may not exist in MCP, 
  // may need to implement via Neo4j Cypher
  
  const query = `
    MATCH (e:Entity {name: $entity})-[r]->(related)
    WHERE r.valid_at <= datetime($timestamp)
      AND (r.invalid_at IS NULL OR r.invalid_at > datetime($timestamp))
    RETURN e, r, related
  `;
  
  // Execute via Graphiti
  const results = await this.mcp.call('graphiti', 'custom_query', {
    cypher: query,
    params: { entity: params.entity, timestamp: params.timestamp }
  });
  
  return this.formatTemporalResults(results);
}
```

**Test:**
```typescript
it('retrieves point-in-time state', async () => {
  // Store episode on Jan 15
  await spec.store({ content: 'auth.ts uses JWT', tier: 'medium' });
  
  // Store update on Jan 20
  await spec.store({ content: 'auth.ts now uses OAuth', tier: 'medium' });
  
  // Query state on Jan 18 (should show JWT)
  const result = await spec.temporalQuery({
    entity: 'auth.ts',
    timestamp: '2026-01-18T12:00:00Z'
  });
  
  expect(result.data).toContain('JWT');
  expect(result.data).not.toContain('OAuth');
});
```

---

**2.4 Implement Entity Relation Traversal (1 hour)**

**Add query_relations method:**
```typescript
async queryRelations(params: {
  entity: string;
  relationType?: string;
  maxDepth?: number;
}): Promise<CSP1Response> {
  const results = await this.mcp.call('graphiti', 'memory_search', {
    query: params.entity,
    num_results: 20,
    center_node_uuid: null // Search from entity
  });
  
  // Extract and filter relations
  const relations = results
    .flatMap(r => r.edges || [])
    .filter(e => !params.relationType || e.type === params.relationType)
    .slice(0, 10);
  
  return {
    status: 'OK',
    scope: [params.entity],
    data: [`entity:${params.entity}`],
    links: relations.map(r => ({
      e1: r.source,
      e2: r.target,
      weight: r.weight
    }))
  };
}
```

**Test:**
```typescript
it('traverses entity relations', async () => {
  // Store related episodes
  await spec.store({ content: 'auth.ts depends on token.ts', tier: 'medium' });
  await spec.store({ content: 'token.ts handles JWT', tier: 'medium' });
  
  // Query relations from auth.ts
  const result = await spec.queryRelations({ entity: 'auth.ts' });
  
  expect(result.links).toContainEqual({
    e1: 'auth.ts',
    e2: 'token.ts',
    weight: expect.any(Number)
  });
});
```

---

**2.5 Test Memory Tier Routing (1 hour)**

**Integration test:**
```typescript
describe('Memory Tier Routing', () => {
  it('routes ultra-short to context only', async () => {
    const result = await spec.store({ 
      content: 'Temporary note', 
      tier: 'ultra' 
    });
    
    // Should NOT create Graphiti episode
    expect(result.data[0]).toMatch(/^ctx:/);
  });
  
  it('routes short to daily log + Graphiti', async () => {
    const result = await spec.store({ 
      content: 'Today we fixed a bug', 
      tier: 'short' 
    });
    
    // Should create episode AND write to daily log
    const dailyLog = await fs.readFile('memory/2026-01-30.md');
    expect(dailyLog).toContain('Today we fixed a bug');
    expect(result.data[0]).toMatch(/^mem:/);
  });
  
  it('routes long to MEMORY.md + Graphiti', async () => {
    const result = await spec.store({ 
      content: 'Permanent preference: use Sonnet for planning', 
      tier: 'long' 
    });
    
    const memoryMd = await fs.readFile('MEMORY.md');
    expect(memoryMd).toContain('use Sonnet for planning');
  });
});
```

---

#### Success Criteria
- [ ] Episodes stored with automatic entity extraction
- [ ] Hybrid search returns relevant results (>0.7 relevance)
- [ ] Temporal queries retrieve correct point-in-time state
- [ ] Entity relations traversable (2+ hops)
- [ ] Memory tiers route correctly (ultra/short/medium/long)
- [ ] No memory leaks after 100 store/recall cycles

#### Rollback Strategy
If Phase 2 fails:
- Fallback to JSONL storage (no Graphiti)
- Continue with simple keyword search
- No complex temporal queries
- Maintain basic memory functionality

---

### Phase 3: Sub-Agents & Dialectic Layer

**Duration:** 6-8 hours

**Objective:** Implement Analyzer, Planner, Advocate, Critic, and debate protocol

#### Deliverables
1. Analyzer decomposes tasks correctly
2. Planner optimizes execution order
3. Advocate/Critic debate protocol working
4. Failure tracking operational
5. Debate triggers correctly fire

#### Prerequisites
- Phase 1 complete (Specialists working)
- Phase 2 complete (Graphiti integrated)

#### Tasks

**3.1 Implement Analyzer Sub-Agent (2 hours)**

**File:** `~/clawd/skills/swarm-memory/subagents/analyzer-agent.ts`

**Implementation:**
```typescript
// Based on subagents/analyzer.md

export class AnalyzerSubAgent {
  async decompose(request: string): Promise<CSP1Response> {
    // Use LLM to break down request into tasks
    const prompt = `
Decompose this request into actionable tasks:
"${request}"

Output format (CSP/1):
TASKS [
  {id:1,specialist:memory,action:recall,params:{...}},
  {id:2,specialist:file,action:search,params:{...},depends:[1]},
  ...
]
RATIONALE <brief_explanation>

Max 10 tasks. Identify dependencies.
`;
    
    const response = await llm.complete(prompt);
    
    // Parse and validate
    const tasks = this.parseTasks(response);
    if (tasks.length > 10) {
      return { status: 'FAIL', error: 'Too many tasks' };
    }
    
    return {
      status: 'OK',
      scope: ['decomposition'],
      data: [JSON.stringify(tasks)],
      rationale: this.extractRationale(response)
    };
  }
}
```

**Test:**
```typescript
it('decomposes complex request', async () => {
  const analyzer = new AnalyzerSubAgent();
  const result = await analyzer.decompose(
    'Find auth bugs we discussed, locate the code, create fix plan'
  );
  
  expect(result.status).toBe('OK');
  const tasks = JSON.parse(result.data[0]);
  expect(tasks.length).toBeGreaterThanOrEqual(3);
  expect(tasks[0].specialist).toBe('memory');
  expect(tasks[1].specialist).toBe('file');
  expect(tasks[1].depends).toContain(1);
});
```

---

**3.2 Implement Planner Sub-Agent (1 hour)**

**File:** `~/clawd/skills/swarm-memory/subagents/planner-agent.ts`

**Implementation:**
```typescript
// Based on subagents/planner.md

export class PlannerSubAgent {
  async optimize(tasks: Task[]): Promise<CSP1Response> {
    // Topological sort respecting dependencies
    const sorted = this.topologicalSort(tasks);
    
    // Identify parallelizable groups
    const groups = this.findParallelGroups(sorted);
    
    // Estimate token usage
    const totalTokens = this.estimateTokens(tasks);
    
    return {
      status: 'OK',
      scope: ['planning'],
      data: [JSON.stringify({
        executionOrder: sorted.map(t => t.id),
        parallelGroups: groups,
        estimatedTokens: totalTokens
      })]
    };
  }
  
  private findParallelGroups(tasks: Task[]): number[][] {
    // Group tasks with no interdependencies
    const groups: number[][] = [];
    const processed = new Set<number>();
    
    for (const task of tasks) {
      if (processed.has(task.id)) continue;
      
      const group = [task.id];
      const dependsOn = new Set(task.depends || []);
      
      for (const other of tasks) {
        if (other.id !== task.id && !processed.has(other.id)) {
          const otherDeps = new Set(other.depends || []);
          // Can run in parallel if no overlap in dependencies
          if (!this.hasOverlap(dependsOn, otherDeps)) {
            group.push(other.id);
          }
        }
      }
      
      groups.push(group);
      group.forEach(id => processed.add(id));
    }
    
    return groups;
  }
}
```

---

**3.3 Implement Advocate Sub-Agent (1 hour)**

**File:** `~/clawd/skills/swarm-memory/subagents/advocate-agent.ts`

**Implementation:**
```typescript
// Based on subagents/advocate.md

export class AdvocateSubAgent {
  async defendPlan(plan: string, mode: 'planning' | 'failure'): Promise<CSP1Response> {
    const prompt = mode === 'planning' 
      ? this.planningPrompt(plan)
      : this.failurePrompt(plan);
    
    const response = await llm.complete(prompt);
    
    // Parse CSP/1 format
    return this.parseAdvocateResponse(response);
  }
  
  private planningPrompt(plan: string): string {
    return `
POSITION ADVOCATE

Defend this plan:
${plan}

Output (CSP/1):
PLAN <step_by_step_approach>
CONFIDENCE <0.0-1.0>
ASSUMPTIONS [<key_assumptions>]

Be optimistic, action-oriented. Explain why this will work.
`;
  }
  
  private failurePrompt(plan: string): string {
    return `
POSITION ADVOCATE (Failure Recovery)

Previous attempt failed. Propose fix:
${plan}

Output (CSP/1):
PLAN <new_approach>
CONFIDENCE <0.0-1.0>
ASSUMPTIONS [<key_assumptions>]
DIFF_FROM_PREVIOUS <what_changed>

Must specify DIFF_FROM_PREVIOUS.
`;
  }
}
```

---

**3.4 Implement Critic Sub-Agent (1 hour)**

**File:** `~/clawd/skills/swarm-memory/subagents/critic-agent.ts`

**Implementation:**
```typescript
// Based on subagents/critic.md

export class CriticSubAgent {
  async challenge(plan: string, mode: 'planning' | 'failure'): Promise<CSP1Response> {
    const prompt = mode === 'planning'
      ? this.planningPrompt(plan)
      : this.failurePrompt(plan);
    
    const response = await llm.complete(prompt);
    
    return this.parseCriticResponse(response);
  }
  
  private planningPrompt(plan: string): string {
    return `
POSITION CRITIC

Challenge this plan:
${plan}

Output (CSP/1):
RISKS [<potential_risks>]
BLIND_SPOTS [<overlooked_factors>]
COUNTER <alternative_approach> | ALTERNATIVES [<options>]
SHOULD_ESCALATE <true|false>

Be skeptical. Agreement is failure. Find problems.
`;
  }
  
  private failurePrompt(plan: string): string {
    return `
POSITION CRITIC (Root Cause Analysis)

Previous attempt failed:
${plan}

Output (CSP/1):
RISKS [<potential_risks>]
BLIND_SPOTS [<overlooked_factors>]
ROOT_CAUSE <analysis>
COUNTER <better_approach>
SHOULD_ESCALATE <true|false>

Identify root cause, don't just propose retry.
`;
  }
}
```

---

**3.5 Implement Debate Protocol (2 hours)**

**File:** `~/clawd/skills/swarm-memory/subagents/debate-orchestrator.ts`

**Implementation:**
```typescript
// Based on subagents/debate-protocol.md

export class DebateOrchestrator {
  async conductDebate(params: {
    task: string;
    mode: 'planning' | 'failure';
    stakes?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<DebateResolution> {
    // 1. Invoke Advocate
    const advocate = new AdvocateSubAgent();
    const advocatePos = await advocate.defendPlan(params.task, params.mode);
    
    // 2. Invoke Critic
    const critic = new CriticSubAgent();
    const criticPos = await critic.challenge(params.task, params.mode);
    
    // 3. Check for escalation
    if (criticPos.shouldEscalate) {
      return {
        resolution: 'ESCALATE',
        rationale: 'Critic recommends human review',
        actions: []
      };
    }
    
    // 4. Synthesize
    const resolution = await this.synthesize(advocatePos, criticPos, params);
    
    // 5. Log to memory
    await this.logDebate(params.task, advocatePos, criticPos, resolution);
    
    return resolution;
  }
  
  private async synthesize(
    advocate: CSP1Response,
    critic: CSP1Response,
    params: DebateParams
  ): Promise<DebateResolution> {
    // Determine outcome: PROCEED | MODIFY | RETRY | PIVOT | ESCALATE
    
    if (advocate.confidence > 0.8 && critic.risks.length === 0) {
      return { resolution: 'PROCEED', rationale: 'High confidence, no risks' };
    }
    
    if (critic.risks.some(r => r.severity === 'high')) {
      return { resolution: 'MODIFY', rationale: 'High risks identified', actions: critic.counter };
    }
    
    if (params.mode === 'failure' && critic.rootCause) {
      return { resolution: 'PIVOT', rationale: critic.rootCause, actions: critic.counter };
    }
    
    return { resolution: 'MODIFY', rationale: 'Combine approaches' };
  }
}
```

---

**3.6 Implement Failure Tracking (1 hour)**

**File:** `~/clawd/lib/failure-tracker.ts`

**Implementation:**
```typescript
export class FailureTracker {
  private logFile = '~/clawd/memory/failures.jsonl';
  
  async recordFailure(params: {
    taskId: string;
    error: string;
    approach: string;
  }): Promise<number> {
    const entry = {
      task_id: params.taskId,
      attempt: await this.getAttemptCount(params.taskId) + 1,
      ts: new Date().toISOString(),
      error: params.error,
      approach: params.approach
    };
    
    await fs.appendFile(this.logFile, JSON.stringify(entry) + '\n');
    
    return entry.attempt;
  }
  
  async getAttemptCount(taskId: string): Promise<number> {
    const content = await fs.readFile(this.logFile, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    
    return lines
      .map(line => JSON.parse(line))
      .filter(entry => entry.task_id === taskId)
      .length;
  }
  
  async shouldDebate(taskId: string): Promise<boolean> {
    const count = await this.getAttemptCount(taskId);
    return count >= 2; // Debate after 2 failures
  }
  
  async shouldEscalate(taskId: string): Promise<boolean> {
    const count = await this.getAttemptCount(taskId);
    return count >= 3; // Escalate after 3 failures
  }
}
```

**Integration:**
```typescript
// In Orchestrator
try {
  await executeTask(task);
  await failureTracker.reset(taskId); // Clear on success
} catch (error) {
  const attempts = await failureTracker.recordFailure({
    taskId,
    error: error.message,
    approach: currentApproach
  });
  
  if (await failureTracker.shouldEscalate(taskId)) {
    // Auto-escalate to human
    return escalateToHuman(task, error);
  }
  
  if (await failureTracker.shouldDebate(taskId)) {
    // Invoke debate
    const resolution = await debateOrch.conductDebate({
      task,
      mode: 'failure'
    });
    
    if (resolution.resolution === 'PIVOT') {
      // Try alternative approach
      return executeTask(resolution.actions);
    }
  }
}
```

---

#### Success Criteria
- [ ] Analyzer decomposes tasks (max 10, correct dependencies)
- [ ] Planner identifies parallel groups
- [ ] Advocate proposes plans with confidence scores
- [ ] Critic identifies risks and proposes alternatives
- [ ] Debate resolution produces valid outcome
- [ ] Failure tracking triggers debate after 2 failures
- [ ] Auto-escalation triggers after 3 failures

#### Rollback Strategy
If Phase 3 fails:
- Disable debate layer (always PROCEED)
- Skip Analyzer/Planner (manual decomposition)
- Continue with Specialists only
- Debate can be re-enabled later

---

### Phase 4: Testing & Validation

**Duration:** 6-8 hours

**Objective:** Comprehensive testing, performance validation, boundary checks

#### Deliverables
1. Automated test suite (80%+ coverage)
2. Performance benchmarks pass targets
3. Boundary violation tests pass
4. Integration tests pass
5. Load testing complete

#### Prerequisites
- Phases 1-3 complete (full swarm operational)

#### Tasks

**4.1 Create Test Harness (2 hours)**

**File:** `test/swarm-integration.test.ts`

**Setup:**
```typescript
describe('Swarm Integration Tests', () => {
  let testEnv: TestEnvironment;
  
  beforeAll(async () => {
    // Setup test Neo4j database
    testEnv = await setupTestEnvironment({
      neo4jUri: 'bolt://localhost:7688', // Test DB
      cleanStart: true
    });
  });
  
  afterAll(async () => {
    await testEnv.cleanup();
  });
  
  // Tests below...
});
```

**Tests:**

**4.1.1 End-to-End Task Flow**
```typescript
it('completes complex task end-to-end', async () => {
  const task = 'Find auth bugs we discussed, locate code, create fix plan';
  
  // 1. Router classifies as ACTION
  const mode = classifyTask(task);
  expect(mode).toBe('ACTION');
  
  // 2. Analyzer decomposes
  const analyzer = new AnalyzerSubAgent();
  const decomp = await analyzer.decompose(task);
  expect(decomp.status).toBe('OK');
  
  // 3. Planner optimizes
  const planner = new PlannerSubAgent();
  const plan = await planner.optimize(JSON.parse(decomp.data[0]));
  expect(plan.status).toBe('OK');
  
  // 4. Execute via specialists
  const memSpec = new MemorySpecialist(mcpClient);
  const fileSpec = new FileSpecialist();
  
  // ... execute each task
  
  // 5. Verify results
  expect(finalResult.status).toBe('OK');
  expect(finalResult.data).toContain('fix plan');
});
```

**4.1.2 Memory Boundary Tests**
```typescript
it('enforces memory access boundaries', async () => {
  const fileSpec = new FileSpecialist();
  
  // Attempt to read memory file
  const result = await fileSpec.read({
    file: 'memory/2026-01-30.md',
    startLine: 1,
    endLine: 10
  });
  
  expect(result.status).toBe('FAIL');
  expect(result.error).toContain('memory access denied');
});

it('allows only Memory Specialist to use MCP', async () => {
  const webSpec = new WebSpecialist();
  
  // Attempt to call memory MCP tool
  const result = await webSpec.callMCP('graphiti', 'memory_search', {});
  
  expect(result.status).toBe('FAIL');
  expect(result.error).toContain('MCP access denied');
});
```

---

**4.2 Performance Benchmarks (2 hours)**

**File:** `test/performance.test.ts`

**Benchmarks:**
```typescript
describe('Performance Benchmarks', () => {
  it('episode ingestion <200ms (p95)', async () => {
    const times: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await memSpec.store({
        content: `Test episode ${i}`,
        tier: 'short'
      });
      times.push(performance.now() - start);
    }
    
    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(200);
  });
  
  it('hybrid search <300ms (p95)', async () => {
    const times: number[] = [];
    
    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      await memSpec.recall({ query: 'test query' });
      times.push(performance.now() - start);
    }
    
    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(300);
  });
  
  it('full complex task <5s (p95)', async () => {
    // End-to-end task execution
    const times: number[] = [];
    
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      await executeComplexTask('Find and fix auth bug');
      times.push(performance.now() - start);
    }
    
    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(5000);
  });
});
```

---

**4.3 Debate Protocol Tests (1 hour)**

**File:** `test/debate.test.ts`

**Tests:**
```typescript
it('triggers planning debate for destructive ops', async () => {
  const task = 'delete all .bak files';
  const shouldDebate = router.shouldDebate(task, 'ACTION');
  expect(shouldDebate).toBe(true);
});

it('conducts debate and resolves', async () => {
  const debate = new DebateOrchestrator();
  const resolution = await debate.conductDebate({
    task: 'deploy to production',
    mode: 'planning',
    stakes: 'high'
  });
  
  expect(resolution.resolution).toMatch(/PROCEED|MODIFY|ESCALATE/);
  expect(resolution.rationale).toBeTruthy();
});

it('triggers failure debate after 2 failures', async () => {
  const tracker = new FailureTracker();
  const taskId = 'fix-auth-test';
  
  await tracker.recordFailure({ taskId, error: 'MODULE_NOT_FOUND', approach: 'update import' });
  expect(await tracker.shouldDebate(taskId)).toBe(false);
  
  await tracker.recordFailure({ taskId, error: 'MODULE_NOT_FOUND', approach: 'reinstall deps' });
  expect(await tracker.shouldDebate(taskId)).toBe(true);
});
```

---

**4.4 Load Testing (1 hour)**

**File:** `test/load.test.ts`

**Tests:**
```typescript
it('handles 100 concurrent store operations', async () => {
  const promises = Array.from({ length: 100 }, (_, i) =>
    memSpec.store({ content: `Concurrent test ${i}`, tier: 'short' })
  );
  
  const results = await Promise.all(promises);
  
  expect(results.every(r => r.status === 'OK')).toBe(true);
});

it('handles 50 concurrent recall operations', async () => {
  const promises = Array.from({ length: 50 }, (_, i) =>
    memSpec.recall({ query: `test ${i % 10}` })
  );
  
  const results = await Promise.all(promises);
  
  expect(results.every(r => r.status === 'OK' || r.status === 'PARTIAL')).toBe(true);
});

it('memory footprint stays <600MB', async () => {
  const initialMem = process.memoryUsage().heapUsed;
  
  // Execute 100 tasks
  for (let i = 0; i < 100; i++) {
    await executeComplexTask(`Task ${i}`);
  }
  
  const finalMem = process.memoryUsage().heapUsed;
  const growth = (finalMem - initialMem) / 1024 / 1024; // MB
  
  expect(growth).toBeLessThan(600);
});
```

---

**4.5 Manual Testing Scenarios (1 hour)**

**Test Checklist:**
- [ ] Simple question routes to ANSWER mode
- [ ] Complex file task routes to ACTION mode
- [ ] Memory Specialist stores and recalls correctly
- [ ] File Specialist searches code correctly
- [ ] Web Specialist fetches URLs correctly
- [ ] Debate triggers on destructive operation
- [ ] Failure tracking works after 2 failures
- [ ] Auto-escalation triggers after 3 failures
- [ ] Temporal query retrieves point-in-time state
- [ ] Entity relations traversable

**Execute:**
```bash
# Run manual test suite
npm run test:manual

# Follow prompts for each scenario
# Mark pass/fail for each
```

---

**4.6 Validation Report (1 hour)**

**Create:** `VALIDATION-REPORT.md`

**Contents:**
- Test coverage summary (% lines/branches)
- Performance benchmark results
- Boundary test results
- Integration test results
- Load test results
- Manual test checklist results
- Known issues
- Risk assessment

**Example:**
```markdown
# Validation Report

**Date:** 2026-01-30  
**Phase:** 4 - Testing & Validation  
**Status:** PASS / FAIL

## Test Coverage
- Unit tests: 87% (target: 80%)
- Integration tests: 92%
- End-to-end tests: 78%

## Performance Benchmarks
| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Episode ingestion (p95) | <200ms | 178ms | ✅ |
| Hybrid search (p95) | <300ms | 267ms | ✅ |
| Complex task (p95) | <5s | 4.2s | ✅ |

## Boundary Tests
- Memory access: 4/4 pass ✅
- MCP access: 3/3 pass ✅
- File access: 5/5 pass ✅

## Known Issues
- None critical
- 2 minor (documented in GitHub issues)

## Recommendation
✅ **PASS** - Ready for Phase 5 deployment
```

---

#### Success Criteria
- [ ] Test coverage >80%
- [ ] All performance benchmarks pass
- [ ] All boundary tests pass (0 violations)
- [ ] Integration tests pass
- [ ] Load tests pass (no crashes)
- [ ] Validation report complete

#### Rollback Strategy
If Phase 4 fails:
- Identify failing component
- Roll back that component only
- Continue with passing components
- Document issues for future fix

---

### Phase 5: Deployment & Monitoring

**Duration:** 4-6 hours

**Objective:** Deploy to production, configure monitoring, establish maintenance

#### Deliverables
1. Production configuration applied
2. Monitoring dashboards operational
3. Cron jobs scheduled
4. Backup procedures tested
5. Rollback tested
6. Documentation updated

#### Prerequisites
- Phase 4 complete (all tests passing)
- Production environment ready

#### Tasks

**5.1 Production Configuration (1 hour)**

**Update:** `~/.clawdbot/clawdbot.json`
```json
{
  "environment": "production",
  "memory": {
    "graphiti": {
      "enabled": true,
      "neo4jUri": "bolt://localhost:7687",
      "neo4jUser": "neo4j",
      "neo4jPassword": "${NEO4J_PASSWORD}",
      "rateLimits": {
        "storePerMinute": 60,
        "searchPerMinute": 120
      }
    }
  },
  "swarm": {
    "enabled": true,
    "routerMode": "soft",
    "debateEnabled": true,
    "debugLogging": false
  },
  "monitoring": {
    "metricsEnabled": true,
    "metricsPath": "~/clawd/memory/metrics",
    "alertThresholds": {
      "responseTime": 5000,
      "errorRate": 0.05,
      "memoryUsage": 600000000
    }
  }
}
```

**Create:** `~/.clawdbot/secrets.env`
```bash
export OPENAI_API_KEY="sk-proj-..."
export NEO4J_PASSWORD="graphiti_memory_2026"
export GRAPHITI_LOG_LEVEL="INFO"
```

**Secure secrets:**
```bash
chmod 600 ~/.clawdbot/secrets.env
```

---

**5.2 Update AGENTS.md (30 min)**

**Backup current:**
```bash
cp ~/clawd/AGENTS.md ~/clawd/AGENTS.md.backup
```

**Add Swarm Mode section:**
```markdown
## 🦾 Swarm Mode - Orchestrator Behavior

### Activation
Swarm mode activates automatically via Task Router when ACTION mode detected.

### Role Hierarchy
**You are the ORCHESTRATOR** in ACTION mode:
- Interface to human (natural language in/out)
- Decompose tasks via Analyzer sub-agent
- Optimize execution via Planner sub-agent
- Delegate to specialists via CSP/1 protocol
- Synthesize results and respond to human
- **NEVER directly access:** files, web, memory, tools in ACTION mode

### Memory Access Boundary
**CRITICAL:** ONLY Memory Specialist can access:
- Graphiti MCP server (memory_search, memory_get, memory_add)
- memory/ directory files
- MEMORY.md (main session only)

### Task Routing
1. Load router from skills/swarm-memory/router.ts
2. Classify task: const mode = classifyTask(userMessage)
3. If mode == 'ANSWER': Respond directly
4. If mode == 'ACTION': Activate swarm (decompose & delegate)

### Delegation Pattern
Need file content? → TASK to File Specialist (CSP/1)
Need web search? → TASK to Web Specialist (CSP/1)
Need memory recall? → TASK to Memory Specialist (CSP/1)
Need tool execution? → TASK to Tool Specialist (CSP/1)

### Debate Triggers
High-stakes operations trigger Advocate/Critic debate:
- Destructive: delete, drop, remove, truncate
- Deployment: deploy, publish, release
- Security: auth, token, password, secret
- Bulk: "all", "every", wildcard patterns
- Failure: 2+ consecutive failures on same task

### Memory Hygiene
After EVERY significant interaction in ACTION mode:
1. Extract key facts/decisions
2. TASK Memory Specialist to store in appropriate tier
3. Memory Specialist creates entity/relation links

Example:
TASK REQ:store IN:MEM OUT:CONFIRM
CONTENT "Fixed JWT refresh bug - added expiry check"
TIER short
TAGS [auth,jwt,bugfix]
```

---

**5.3 Configure Cron Jobs (1 hour)**

**Add to:** `~/.clawdbot/clawdbot.json`
```json
{
  "cron": {
    "jobs": [
      {
        "id": "memory-daily-sweep",
        "schedule": "0 3 * * *",
        "agent": "main",
        "task": "Execute daily memory maintenance: decay unused entries, check graph health, archive old logs. See skills/swarm-memory/maintenance/daily.md",
        "enabled": true
      },
      {
        "id": "memory-weekly-consolidate",
        "schedule": "0 4 * * 0",
        "agent": "main",
        "task": "Execute weekly memory consolidation: strengthen links, form clusters, promote to long-term. See skills/swarm-memory/maintenance/weekly.md",
        "enabled": true
      },
      {
        "id": "memory-monthly-rebuild",
        "schedule": "0 5 1 * *",
        "agent": "main",
        "task": "Execute monthly memory rebuild: full backup, prune old relations, optimize indexes, run meta-optimizer. See skills/swarm-memory/maintenance/monthly.md",
        "enabled": true
      },
      {
        "id": "neo4j-backup",
        "schedule": "0 2 * * *",
        "agent": "main",
        "task": "Backup Neo4j database to ~/backups/neo4j/backup-$(date +%Y%m%d).dump",
        "enabled": true
      }
    ]
  }
}
```

**Test cron jobs:**
```bash
# List jobs
clawdbot cron list

# Test execution
clawdbot cron run memory-daily-sweep --dry-run

# Enable all
clawdbot cron enable-all
```

---

**5.4 Setup Monitoring (2 hours)**

**Create:** `~/clawd/lib/metrics-collector.ts`

**Implementation:**
```typescript
export class MetricsCollector {
  private metricsFile = '~/clawd/memory/metrics/YYYY-MM-DD.jsonl';
  
  async recordOperation(params: {
    operation: string;
    specialist?: string;
    durationMs: number;
    status: 'success' | 'failure';
    tokenUsage?: number;
  }) {
    const entry = {
      ts: new Date().toISOString(),
      ...params
    };
    
    await fs.appendFile(this.getMetricsFile(), JSON.stringify(entry) + '\n');
    
    // Check alert thresholds
    await this.checkAlerts(params);
  }
  
  async checkAlerts(params) {
    if (params.durationMs > 5000) {
      await this.sendAlert('Response time exceeded 5s', params);
    }
    
    const recentFailures = await this.getRecentFailures();
    if (recentFailures > 10) {
      await this.sendAlert('High error rate detected', { recentFailures });
    }
  }
  
  private getMetricsFile(): string {
    const date = new Date().toISOString().split('T')[0];
    return this.metricsFile.replace('YYYY-MM-DD', date);
  }
}
```

**Integration:** Wrap specialist calls
```typescript
const metrics = new MetricsCollector();

async function callSpecialist(specialist, task) {
  const start = performance.now();
  try {
    const result = await specialist.execute(task);
    await metrics.recordOperation({
      operation: task.action,
      specialist: specialist.name,
      durationMs: performance.now() - start,
      status: result.status === 'OK' ? 'success' : 'failure',
      tokenUsage: result.tokenUsage
    });
    return result;
  } catch (error) {
    await metrics.recordOperation({
      operation: task.action,
      specialist: specialist.name,
      durationMs: performance.now() - start,
      status: 'failure'
    });
    throw error;
  }
}
```

**Create dashboard script:** `~/clawd/bin/metrics-dashboard.sh`
```bash
#!/bin/bash
# Display last 24h metrics

METRICS_FILE=~/clawd/memory/metrics/$(date +%Y-%m-%d).jsonl

echo "=== Swarm Metrics (Last 24h) ==="
echo

echo "Total operations: $(wc -l < $METRICS_FILE)"
echo "Success rate: $(jq -s '[.[] | select(.status == "success")] | length / (input | length) * 100' $METRICS_FILE)%"
echo

echo "Average response time: $(jq -s '[.[] | .durationMs] | add / length' $METRICS_FILE)ms"
echo "P95 response time: $(jq -s '[.[] | .durationMs] | sort | .[length * 0.95 | floor]' $METRICS_FILE)ms"
echo

echo "By specialist:"
jq -s 'group_by(.specialist) | map({specialist: .[0].specialist, count: length, avg_duration: (map(.durationMs) | add / length)})' $METRICS_FILE
```

**Run dashboard:**
```bash
chmod +x ~/clawd/bin/metrics-dashboard.sh
~/clawd/bin/metrics-dashboard.sh
```

---

**5.5 Test Backup & Rollback (1 hour)**

**Backup procedure:**
```bash
#!/bin/bash
# ~/clawd/bin/backup-swarm.sh

BACKUP_DIR=~/backups/clawdbot-swarm/$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup Neo4j
docker exec clawdbot-neo4j neo4j-admin database dump neo4j --to-path=/backups
docker cp clawdbot-neo4j:/backups/neo4j.dump $BACKUP_DIR/

# Backup memory files
cp -r ~/clawd/memory/ $BACKUP_DIR/

# Backup config
cp ~/.clawdbot/clawdbot.json $BACKUP_DIR/
cp ~/clawd/AGENTS.md $BACKUP_DIR/

echo "Backup complete: $BACKUP_DIR"
```

**Rollback procedure:**
```bash
#!/bin/bash
# ~/clawd/bin/rollback-swarm.sh

BACKUP_DIR=$1

if [ -z "$BACKUP_DIR" ]; then
  echo "Usage: rollback-swarm.sh <backup_directory>"
  exit 1
fi

# Restore config
cp $BACKUP_DIR/clawdbot.json ~/.clawdbot/
cp $BACKUP_DIR/AGENTS.md ~/clawd/

# Restore Neo4j
docker exec clawdbot-neo4j neo4j-admin database load neo4j --from-path=/backups

# Restore memory files
cp -r $BACKUP_DIR/memory/ ~/clawd/

# Restart gateway
clawdbot gateway restart

echo "Rollback complete from $BACKUP_DIR"
```

**Test:**
```bash
# Create backup
~/clawd/bin/backup-swarm.sh

# Verify backup exists
ls ~/backups/clawdbot-swarm/

# Test rollback (dry-run)
~/clawd/bin/rollback-swarm.sh ~/backups/clawdbot-swarm/LATEST --dry-run
```

---

**5.6 Deploy & Verify (30 min)**

**Deployment steps:**
```bash
# 1. Create final backup
~/clawd/bin/backup-swarm.sh

# 2. Restart gateway with new config
clawdbot gateway restart

# 3. Verify swarm mode active
clawdbot test-route "fix the bug in src/auth.ts"
# Should show: MODE=ACTION, SWARM=ACTIVE

# 4. Test end-to-end
clawdbot test-swarm-e2e

# 5. Monitor for 1 hour
watch -n 60 ~/clawd/bin/metrics-dashboard.sh
```

**Validation:**
- [ ] Gateway restarts successfully
- [ ] Swarm mode activates on ACTION tasks
- [ ] Memory Specialist connects to Graphiti
- [ ] Cron jobs execute successfully
- [ ] Metrics being recorded
- [ ] No errors in logs

---

#### Success Criteria
- [ ] Production config applied
- [ ] AGENTS.md updated with Swarm Mode
- [ ] Cron jobs scheduled and tested
- [ ] Monitoring operational
- [ ] Backup tested
- [ ] Rollback tested
- [ ] System stable for 1 hour

#### Rollback Strategy
If Phase 5 deployment fails:
```bash
# Execute rollback
~/clawd/bin/rollback-swarm.sh ~/backups/clawdbot-swarm/LATEST

# Verify rollback
clawdbot gateway status
clawdbot test-basic-operation

# Document failure
echo "Deployment failed: <reason>" >> ~/clawd/DEPLOYMENT-LOG.md
```

---

## 4. RISK ASSESSMENT

### Technical Risks (Detailed)

**Risk Matrix:**

| Risk | Severity | Likelihood | Impact | Mitigation | Cost |
|------|----------|------------|--------|------------|------|
| Graphiti entity extraction quality | MEDIUM | MEDIUM | Incorrect graph structure | Manual review first 100, tune prompts, fallback to structured | Low |
| MCP interop reliability | MEDIUM | LOW | Memory ops fail | Circuit breaker, fallback to JSONL, health checks | Low |
| Performance under load | MEDIUM | MEDIUM | Slow responses | Benchmarks, rate limiting, caching, load testing | Low |
| Context compaction breaks swarm | HIGH | LOW | State loss | Stateless design, resume from failures.jsonl, test compaction | Medium |
| Token cost explosion | MEDIUM | LOW | High API bills | CSP/1 (60-80% reduction), monitoring, budget alerts | Low |
| Incomplete rollback | HIGH | LOW | Cannot revert | Backups, feature flags, parallel operation, documented procedure | Low |
| Memory growth runaway | MEDIUM | MEDIUM | Disk full | Automated maintenance, monitoring, decay metrics | Low |
| Debate loop stalling | LOW | LOW | Tasks hang | Time limits (60s), auto-escalate after 3 fails, bypass option | Low |

### Operational Risks

**Infrastructure:**
- Neo4j crashes → Restart, restore from backup (RTO: 5 min, RPO: 24h)
- MCP server unresponsive → Restart, fallback to JSONL (degraded mode)
- Disk full → Prune old episodes, add disk space, alert thresholds

**Integration:**
- Clawdbot incompatibility → Verify version first (Phase 0), upgrade if needed
- OpenAI API rate limits → Reduce ingestion rate, use caching, consider alternatives
- Network issues → Retry with exponential backoff, timeout handling

**Human:**
- Learning curve → Documentation, examples, gradual rollout
- Over-reliance on swarm → Maintain direct access option
- Debugging complexity → Logging, metrics, validation reports

### Cost Estimates

**Infrastructure:**
- Neo4j: $0 (self-hosted Docker)
- Python runtime: $0 (local)
- Total: $0/month

**API Costs (OpenAI):**
- Entity extraction: ~$0.01 per episode (GPT-4 Turbo)
- Embeddings: ~$0.0001 per episode (text-embedding-3-small)
- Estimated usage: 100-200 episodes/day
- **Monthly cost: $30-60**

**Development:**
- Initial implementation: 32-40 hours (one-time)
- Maintenance: 2-4 hours/month (automated cron + occasional manual)

**Total First Year:**
- Development: $0 (autonomous agent)
- API costs: $360-720
- Maintenance: Minimal (mostly automated)
- **Total: ~$400-800/year**

### Risk Mitigation Summary

**High Priority (Implement in Phase 0-2):**
1. ✅ Backup strategy (Phase 5)
2. ✅ Rollback procedure (Phase 5)
3. ✅ Memory boundary enforcement (Phase 1)
4. ✅ Stateless specialist design (Phase 1)

**Medium Priority (Implement in Phase 3-4):**
1. ✅ Performance benchmarks (Phase 4)
2. ✅ Circuit breakers (Phase 2 enhancement)
3. ✅ Monitoring/alerting (Phase 5)
4. ✅ Debate time limits (Phase 3)

**Low Priority (Post-deployment):**
1. Alternative LLM providers (future enhancement)
2. Advanced caching layer (performance optimization)
3. Multi-instance deployment (scalability)

---

## 5. GO/NO-GO RECOMMENDATION

### ✅ **GO** - Proceed with Implementation

**Confidence Level:** HIGH (85%)

### Justification

**Strengths:**
1. **Complete design:** All components fully specified, no major gaps
2. **Clear architecture:** Well-defined boundaries, protocols, and patterns
3. **Risk mitigation:** Rollback procedures, monitoring, automated tests
4. **Incremental deployment:** Phased with validation gates
5. **Token efficiency:** 60-80% reduction measured in design
6. **Battle-tested tech:** Graphiti (Zep), Neo4j, CSP protocols
7. **CLI tooling:** Already functional, tests passing

**Mitigated Risks:**
- Context compaction: Stateless design + failures.jsonl
- Performance: Benchmarks in Phase 4, targets achievable
- Rollback: Documented procedures + backups
- Cost: Affordable (~$400-800/year), CSP reduces token usage

**Timeline:** Realistic 32-40 hours with clear milestones

**Effort:** Single developer, autonomous agent assistance possible

### Conditions for GO

1. **Phase 0 validation passes:** Neo4j, Graphiti, MCP all working
2. **Each phase passes success criteria** before proceeding to next
3. **Rollback tested** before production deployment (Phase 5)
4. **Monitoring operational** before declaring complete (Phase 5)

### Contingency Plan

If implementation stalls:
- **After Phase 0:** No changes made, zero cost to abort
- **After Phase 1:** Basic swarm works, can pause and use partially
- **After Phase 2:** Graphiti integrated, valuable even without sub-agents
- **After Phase 3:** Full swarm works, can skip automated testing (manual only)
- **After Phase 4:** Production-ready, proceed to deployment

**Fallback:** At any point, disable swarm mode and revert to standard Clawdbot

### Expected Outcomes (6 months post-deployment)

**Success Metrics:**
- Token usage reduced by 50-70% (from CSP/1 efficiency)
- Complex tasks completed 40% faster (parallel execution)
- Memory recall accuracy >80% (hybrid search)
- Zero data loss incidents (backup/rollback procedures)
- System uptime >99% (monitoring + automated maintenance)
- Cost within budget ($400-800/year)

**Intangible Benefits:**
- Improved reasoning quality (dialectic debates)
- Better knowledge retention (temporal graph)
- Reduced human intervention (automated maintenance)
- Scalable architecture (can add specialists/sub-agents)

---

## Implementation Timeline Summary

| Phase | Duration | Start | End | Validation Gate |
|-------|----------|-------|-----|----------------|
| **Phase 0: Prerequisites** | 4-6h | Day 1 | Day 1 | Infrastructure working |
| **Phase 1: Core Infrastructure** | 8-10h | Day 2 | Day 3 | Specialists operational |
| **Phase 2: Graphiti Integration** | 6-8h | Day 3 | Day 4 | Memory system working |
| **Phase 3: Sub-Agents & Dialectic** | 6-8h | Day 4 | Day 5 | Debate protocol working |
| **Phase 4: Testing & Validation** | 6-8h | Day 5 | Day 6 | All tests passing |
| **Phase 5: Deployment** | 4-6h | Day 6 | Day 6 | Production stable 1h |

**Total:** 32-40 hours (~6 working days)

**Buffer:** 20% (6-8 additional hours for unexpected issues)

**Target Completion:** 7-8 days

---

## Appendix: Quick Reference

### Key Files
```
~/clawd/
├── AGENTS.md (update with Swarm Mode)
├── lib/
│   ├── csp1-parser.ts (Phase 1)
│   ├── failure-tracker.ts (Phase 3)
│   └── metrics-collector.ts (Phase 5)
├── skills/swarm-memory/
│   ├── router.ts (Phase 1)
│   ├── specialists/
│   │   ├── memory-agent.ts (Phase 1)
│   │   ├── file-agent.ts (Phase 1)
│   │   ├── web-agent.ts (Phase 1)
│   │   └── tool-agent.ts (Phase 1)
│   └── subagents/
│       ├── analyzer-agent.ts (Phase 3)
│       ├── planner-agent.ts (Phase 3)
│       ├── advocate-agent.ts (Phase 3)
│       ├── critic-agent.ts (Phase 3)
│       └── debate-orchestrator.ts (Phase 3)
├── test/
│   ├── csp1-parser.test.ts (Phase 1)
│   ├── specialist-boundaries.test.ts (Phase 1)
│   ├── swarm-integration.test.ts (Phase 4)
│   ├── performance.test.ts (Phase 4)
│   └── debate.test.ts (Phase 4)
├── bin/
│   ├── backup-swarm.sh (Phase 5)
│   ├── rollback-swarm.sh (Phase 5)
│   └── metrics-dashboard.sh (Phase 5)
└── memory/
    ├── failures.jsonl
    ├── active-tasks.md
    └── metrics/
```

### Command Cheat Sheet
```bash
# Phase 0
docker run -d --name clawdbot-neo4j -p 7474:7474 -p 7687:7687 neo4j:5.26
pip install graphiti-core
clawdbot mcp status

# Phase 1
npm test -- csp1-parser
npm test -- specialist-boundaries
clawdbot test-specialist memory recall --query "test"

# Phase 2
# (Graphiti operations via MCP - no direct commands)

# Phase 3
npm test -- debate

# Phase 4
npm test -- performance
npm test -- swarm-integration
npm run test:manual

# Phase 5
~/clawd/bin/backup-swarm.sh
clawdbot gateway restart
~/clawd/bin/metrics-dashboard.sh
```

### Validation Checklist
```markdown
## Phase 0
- [ ] Neo4j accessible
- [ ] Graphiti imports
- [ ] MCP server responds
- [ ] API keys valid

## Phase 1
- [ ] CSP/1 parser works
- [ ] Router classifies correctly
- [ ] Specialists operational
- [ ] Boundaries enforced

## Phase 2
- [ ] Episodes stored
- [ ] Hybrid search works
- [ ] Temporal queries work
- [ ] Relations traversable

## Phase 3
- [ ] Analyzer decomposes
- [ ] Planner optimizes
- [ ] Debate resolves
- [ ] Failures tracked

## Phase 4
- [ ] Tests pass (80%+ coverage)
- [ ] Benchmarks pass
- [ ] Boundaries hold
- [ ] Load tests pass

## Phase 5
- [ ] Config applied
- [ ] Cron jobs scheduled
- [ ] Monitoring operational
- [ ] Backup tested
- [ ] System stable
```

---

**END OF EXECUTION PLAN**

**Next Steps:**
1. Review this plan with stakeholders
2. Validate prerequisites (Phase 0 readiness)
3. Allocate 7-8 days for implementation
4. Begin Phase 0 when approved

**Status:** Ready for approval ✅
