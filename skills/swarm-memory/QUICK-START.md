# Clawdbot Swarm Memory - Integration Guide

**Architecture-focused guide for integrating Graphiti-based swarm memory into Clawdbot.**

---

## Overview

This system transforms Clawdbot into a hierarchical swarm with:
- **Memory Specialist** (exclusive access to Graphiti)
- **File, Web, Tool Specialists** (no direct memory access)
- **Sub-agents** (Analyzer, Planner, Advocate, Critic)
- **CSP/1 Protocol** for token-efficient inter-agent communication

**Key Architectural Principle:** ONLY Memory Specialist can access memory systems (Graphiti MCP, memory files, MEMORY.md).

---

## Architecture Pattern

```
┌─────────────────────────────────────────┐
│      Clawdbot Main Agent                │
│      (Orchestrator)                     │
└──────────────┬──────────────────────────┘
               │
               │ Spawns sub-agents
               │ Delegates via CSP/1
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌──────────┐      ┌─────────────────┐
│Sub-Agents│      │   Specialists   │
├──────────┤      ├─────────────────┤
│Analyzer  │      │Memory Specialist│◄──┐
│Planner   │      │File Specialist  │   │
│Advocate  │      │Web Specialist   │   │ ONLY path to memory
│Critic    │      │Tool Specialist  │   │
└──────────┘      └────────┬────────┘   │
                           │            │
                           │ Uses       │
                           ▼            │
                  ┌──────────────┐     │
                  │  MCP Client  │     │
                  │  (Clawdbot)  │     │
                  └──────┬───────┘     │
                         │             │
                         │ Connects    │
                         ▼             │
                  ┌──────────────┐    │
                  │ Graphiti MCP │    │
                  │   Server     │────┘
                  │  (Python)    │
                  └──────┬───────┘
                         │
                         │ Uses
                         ▼
                  ┌──────────────┐
                  │  Graphiti    │
                  │   Library    │
                  └──────┬───────┘
                         │
                         │ Stores
                         ▼
                  ┌──────────────┐
                  │    Neo4j     │
                  │   Database   │
                  └──────────────┘
```

---

## Integration Steps

### 1. Prerequisites

**Required:**
- Neo4j 5.26+ (backend for Graphiti)
- Python 3.10+ (for Graphiti MCP server)
- OpenAI API key (or alternative LLM provider)
- Clawdbot with MCP support

**Recommended:**
- Neo4j Desktop (easiest way to manage Neo4j)
- Docker (alternative to Neo4j Desktop)

### 2. Install Neo4j

**Option A: Neo4j Desktop**
```bash
# Download from https://neo4j.com/download/
# Create a new database
# Set password
# Start database
```

**Option B: Docker**
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:latest
```

**Option C: Homebrew (macOS)**
```bash
brew install neo4j
neo4j start
```

### 3. Configure Graphiti MCP Server

Add to your MCP config file (location depends on Clawdbot setup):

**Example: `~/.config/claude/mcp_config.json`**
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

**Alternative Providers:**
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
    "NEO4J_URI": "bolt://localhost:7687"
  }
}
```

### 4. Initialize Memory Structure

Create required directories and files:

```bash
# Memory directory
mkdir -p ~/clawd/memory

# Failure tracking
touch ~/clawd/memory/failures.jsonl

# Active task tracking
cat > ~/clawd/memory/active-tasks.md <<EOF
# Active Tasks

## Running
<!-- Sub-agents currently active -->

## Completed Today
<!-- Sub-agents completed in last 24h -->
EOF

# Metrics directory
mkdir -p ~/clawd/memory/metrics
```

### 5. Update AGENTS.md

Add Swarm Mode section to your `AGENTS.md`:

```markdown
## 🦾 Swarm Mode - Orchestrator Behavior

### Role Hierarchy
**You are the ORCHESTRATOR** in complex tasks:
- Sole interface to the human (natural language in/out)
- Receive queries, decompose into tasks, delegate to specialists
- Assemble final answers from specialist responses
- **NEVER directly access:** files, web, memory tools, MCP, databases in ACTION mode

### When to Activate Swarm Mode
**Task Router determines mode:**
- **ANSWER mode:** Direct questions, no external references → respond directly
- **ACTION mode:** File paths, commands, URLs, multi-step tasks → delegate

See \`skills/swarm-memory/router.md\` for routing rules.

### Memory Access Boundary
**CRITICAL:** ONLY Memory Specialist can access:
- Graphiti MCP server (\`memory_search\`, \`memory_get\`, \`memory_add\` tools)
- \`memory/\` directory files
- \`MEMORY.md\` (main session only)

All other agents must route via Memory Specialist using CSP/1.

### Communication Protocol
- **Human ↔ Orchestrator:** Natural language
- **Orchestrator ↔ Specialists:** CSP/1 (see \`skills/swarm-memory/CSP1.md\`)

### Task Decomposition Pattern
When receiving a complex request (ACTION mode):
1. **Route** — Determine ANSWER vs ACTION mode
2. **Analyze** — Delegate to Analyzer sub-agent for task decomposition
3. **Plan** — Delegate to Planner sub-agent for execution optimization
4. **Debate** (if high-stakes) — Invoke Advocate/Critic dialectic
5. **Delegate** — Send CSP/1 tasks to specialists
6. **Synthesize** — Combine specialist responses
7. **Store** — Write learnings to memory (via Memory Specialist)
8. **Respond** — Natural language answer to human
```

### 6. Configure Task Router

The Task Router determines when to use swarm mode. Key routing logic:

**ANSWER Mode (Direct Response):**
- Simple questions: "What's the weather?"
- Factual queries: "What's Python's list comprehension syntax?"
- Conversational: "How's it going?"

**ACTION Mode (Delegate to Swarm):**
- File operations: "Find all .ts files that import auth"
- Web research: "Search for GraphQL best practices"
- Memory recall: "What did we discuss about architecture?"
- Multi-step: "Find bugs, locate code, create fix plan"
- High-stakes: "Delete old backups"

See [router.md](router.md) for complete routing specification.

### 7. Memory Specialist Configuration

The Memory Specialist needs:

1. **Specialist definition:** Load from `specialists/memory.md`
2. **MCP tool access:** `memory_search`, `memory_get`, `memory_add`
3. **CSP/1 formatting:** All responses in CSP/1 format
4. **Reference-only output:** Never return full content (UUIDs/refs only)

**Example CSP/1 Response:**
```
STATUS OK
SCOPE [auth,token,jwt]
DATA entity:550e8400-e29b-41d4-a716-446655440000
RELEVANCE 0.89
SNIPPET "auth.ts depends on token.ts for session handling"
```

---

## Testing Integration

### Test 1: MCP Connection
```
Human: "Test memory connection"

Expected Flow:
1. Orchestrator spawns Memory Specialist
2. Memory Specialist calls MCP tool (memory_search or ping)
3. Returns STATUS OK
4. Orchestrator responds: "Memory system connected"
```

### Test 2: Episode Storage
```
Human: "Remember that auth.ts handles JWT refresh"

Expected Flow:
1. Orchestrator → Memory Specialist (CSP/1):
   TASK REQ:store IN:MEM OUT:CONFIRM
   CONTENT "auth.ts handles JWT refresh"
   
2. Memory Specialist:
   - Calls memory_add via MCP
   - Graphiti creates episode
   - Extracts entities: auth.ts (File), JWT refresh (Concept)
   
3. Memory Specialist → Orchestrator (CSP/1):
   STATUS OK
   DATA episode:uuid
   ENTITIES_EXTRACTED 2
   
4. Orchestrator → Human:
   "Stored in memory: auth.ts handles JWT refresh"
```

### Test 3: Memory Recall
```
Human: "What do we know about auth.ts?"

Expected Flow:
1. Router: ACTION mode (memory recall)
2. Orchestrator → Memory Specialist (CSP/1):
   TASK REQ:recall auth.ts IN:MEM OUT:MEM_REFS
   
3. Memory Specialist:
   - Calls memory_search("auth.ts") via MCP
   - Graphiti returns entities + relations
   
4. Memory Specialist → Orchestrator (CSP/1):
   STATUS OK
   SCOPE [auth,jwt,session]
   DATA entity:uuid1,entity:uuid2
   RELEVANCE 0.89,0.76
   SNIPPET uuid1:"auth.ts handles JWT refresh"
   
5. Orchestrator synthesizes and responds:
   "We know auth.ts handles JWT refresh and is related to session management..."
```

### Test 4: Multi-Specialist Task
```
Human: "Find all auth files and remember their dependencies"

Expected Flow:
1. Router: ACTION mode (multi-step)
2. Analyzer: Break into [file search, memory store]
3. Planner: Optimize (parallel execution)
4. Orchestrator → File Specialist: Find auth files
5. File Specialist → Orchestrator: Returns file:line refs
6. Orchestrator → Memory Specialist: Store findings
7. Memory Specialist → Orchestrator: Confirm storage
8. Orchestrator → Human: Natural language summary
```

### Test 5: High-Stakes Operation
```
Human: "Delete all .bak files"

Expected Flow:
1. Router: ACTION + destructive + bulk → trigger debate
2. Orchestrator → Advocate: Propose approach
3. Advocate → Orchestrator: "Use rm *.bak"
4. Orchestrator → Critic: Challenge approach
5. Critic → Orchestrator: "Risk: no undo. Use trash + dry-run"
6. Orchestrator: Synthesize → MODIFY resolution
7. Execute safer approach (trash + dry-run + age filter)
8. Report results
```

---

## Common Patterns

### Pattern 1: Memory-Augmented File Search

**Use Case:** Find code related to a previous discussion

```
Human: "Find the auth code we discussed last week"

Orchestrator:
1. Memory Specialist: Recall "auth discussion last week"
2. Memory returns: auth.ts, token.ts, jwt-utils.ts
3. File Specialist: Search for these files
4. Synthesize: Combine memory context + file locations
5. Respond with full picture
```

### Pattern 2: Temporal Queries

**Use Case:** Track changes over time

```
Human: "What dependencies did auth.ts have on January 10?"

Memory Specialist (via MCP):
- Uses Graphiti point-in-time query
- reference_time=datetime(2026, 1, 10)
- Returns entities valid at that date
```

### Pattern 3: Contradiction Handling

**Use Case:** Update outdated information

```
Human: "auth.ts no longer depends on token.ts, now uses jwt-utils.ts"

Memory Specialist:
1. Add new episode with updated info
2. Graphiti auto-invalidates old relation (sets expired_at)
3. Creates new relation with valid_from=now
4. Both facts preserved with temporal validity
```

---

## Configuration Files

### Memory Config: `memory/graphiti-config.json`
```json
{
  "graph_uri": "bolt://localhost:7687",
  "graph_user": "neo4j",
  "graph_password": "<secure_password>",
  "llm_provider": "openai",
  "embedder": "openai",
  "embedding_model": "text-embedding-3-small",
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

### Cron Config: `~/.clawdbot/clawdbot.json`
```json
{
  "cron": {
    "jobs": [
      {
        "id": "memory-daily-sweep",
        "schedule": "0 3 * * *",
        "task": "Memory maintenance: archive old daily logs, check metrics",
        "enabled": true
      },
      {
        "id": "memory-weekly-consolidate",
        "schedule": "0 4 * * 0",
        "task": "Weekly: promote high-access entities to MEMORY.md",
        "enabled": true
      }
    ]
  }
}
```

---

## Troubleshooting

### MCP Connection Issues

**Symptom:** Memory Specialist returns "MCP connection failed"

**Checks:**
1. Is Neo4j running? `neo4j status`
2. Is MCP config correct? Check file path and env vars
3. Are API keys set? `echo $OPENAI_API_KEY`
4. Can you connect directly? Test with Python:
   ```python
   from graphiti_core import Graphiti
   graphiti = Graphiti("bolt://localhost:7687", "neo4j", "password")
   print("Connected!")
   ```

### CSP/1 Format Errors

**Symptom:** Orchestrator can't parse specialist response

**Checks:**
1. Review specialist logs for malformed CSP/1
2. Validate against CSP/1 spec (see [CSP1.md](CSP1.md))
3. Ensure specialist uses exact format (STATUS, SCOPE, DATA, etc.)

### Memory Growth Too Fast

**Symptom:** Neo4j database grows rapidly

**Solutions:**
1. Check episode ingestion rate (are you adding too many?)
2. Review entity extraction (is Graphiti over-extracting?)
3. Adjust concurrency: Lower `SEMAPHORE_LIMIT`
4. Enable aggressive pruning (see [maintenance/daily.md](maintenance/daily.md))

### Swarm Mode Not Activating

**Symptom:** Orchestrator responds directly instead of delegating

**Checks:**
1. Review task router logic (see [router.md](router.md))
2. Is request in ANSWER mode? (e.g., "What's 2+2?" → direct answer)
3. Check AGENTS.md has swarm mode section
4. Verify specialist definitions are loaded

---

## Performance Tuning

### Latency Optimization

**Target:** <200ms for memory recall (p95)

**Tuning:**
1. **Neo4j Memory:** Increase heap size (2-4GB recommended)
   ```properties
   # neo4j.conf
   dbms.memory.heap.max_size=4g
   dbms.memory.pagecache.size=2g
   ```

2. **Graphiti Concurrency:** Increase if rate limits allow
   ```bash
   export SEMAPHORE_LIMIT=50  # Default: 10
   ```

3. **Embedding Model:** Trade accuracy for speed
   ```python
   # Faster (512 dims)
   embedder = OpenAIEmbedder(model="text-embedding-3-small", dimensions=512)
   
   # Slower (3072 dims)
   embedder = OpenAIEmbedder(model="text-embedding-3-large", dimensions=3072)
   ```

### Token Efficiency

**Target:** 60-80% reduction via CSP/1

**Verification:**
```python
# Track tokens per interaction
{
  "timestamp": "2026-01-29T12:00:00Z",
  "mode": "CSP/1",
  "tokens_used": 523,
  "tokens_natural_language": 2341,
  "efficiency": 0.78  # 78% reduction
}
```

Log to `memory/metrics/YYYY-MM-DD.jsonl`.

---

## Maintenance

### Daily (Automated)
- Archive daily logs older than 7 days
- Check metrics for anomalies
- Neo4j backup
- No manual Graphiti maintenance (temporal decay is automatic)

### Weekly (Automated)
- Promote frequently-accessed entities to MEMORY.md
- Generate weekly summary episode
- Review failure logs
- Optimize Neo4j indexes (auto-analyze)

### Monthly (Automated)
- Full Neo4j backup
- Prune expired relations (>90 days)
- Generate analytics report
- Meta-optimizer adjustments

See [maintenance/](maintenance/) for detailed procedures.

---

## Next Steps

### Week 1
- Test all integration points
- Monitor metrics (latency, token usage)
- Tune concurrency and memory settings
- Document any issues

### Week 2
- Validate CSP/1 protocol compliance
- Test debate system with high-stakes ops
- Review first weekly consolidation
- Adjust router logic if needed

### Month 1
- Analyze monthly metrics
- Review meta-optimizer adjustments
- Document lessons learned
- Plan custom specialist additions

---

## Documentation

- **[README.md](README.md)** - Complete architecture overview
- **[CSP1.md](CSP1.md)** - Protocol specification
- **[router.md](router.md)** - Task routing logic
- **[specialists/memory.md](specialists/memory.md)** - Memory Specialist spec
- **[memory-tiers/graph-schema.md](memory-tiers/graph-schema.md)** - Graphiti schema
- **[memory-tiers/config.md](memory-tiers/config.md)** - Memory tier configuration
- **[subagents/debate-protocol.md](subagents/debate-protocol.md)** - Debate system
- **[maintenance/](maintenance/)** - Maintenance procedures

---

## Support

**GitHub:** https://github.com/talas9/clawdbot-swarm  
**Graphiti Docs:** https://help.getzep.com/graphiti  
**Graphiti Discord:** https://discord.com/invite/W8Kw6bsgXQ (#graphiti channel)

---

**🦞 Architecture complete. Build your swarm! 🦞**
