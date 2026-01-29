# Critical Updates to Swarm Memory Implementation

**Date:** January 29, 2026  
**Status:** 🚧 IN PROGRESS

---

## Update 1: Memory Access Constraint Enforcement

### Rule
**ONLY the Memory Specialist agent can access memory files and memory MCP.**

No other agent (orchestrator, file specialist, web specialist, tool specialist, sub-agents) may directly touch:
- `memory/` directory files
- `MEMORY.md`
- Memory MCP tools
- Neo4j/Graphiti database

### Violations to Fix
Auditing current implementation for violations...

**✅ AGENTS.md:** Already enforces delegation to Memory Specialist  
**✅ Specialists:** File/Web/Tool specialists don't access memory  
**⚠️  To verify:** Router doesn't bypass Memory Specialist  
**⚠️  To verify:** Orchestrator never reads memory directly

### Enforcement Mechanisms
1. **Documentation:** Explicit in all specialist specs
2. **Protocol:** CSP/1 requires all memory ops via Memory Specialist
3. **Validation:** Parser rejects direct memory access in non-Memory responses
4. **Testing:** Integration tests verify boundaries

---

## Update 2: Graphiti Framework Integration

### What is Graphiti?
- **Temporal knowledge graph framework** for AI memory
- Built by Zep (https://github.com/getzep/graphiti)
- Replaces generic Neo4j with high-level abstractions
- **Bi-temporal:** Tracks event time + ingestion time
- **Hybrid retrieval:** Semantic + keyword (BM25) + graph traversal
- **Incremental updates:** Real-time, not batch
- **Episode-based:** Ingest episodes, Graphiti extracts entities/relations

### Key Features
- Automatic entity extraction via LLM
- Relationship inference and linking
- Temporal edge invalidation (contradictions)
- Custom entity types (Pydantic models)
- Built-in hybrid search
- MCP server available!

### Architecture Changes

**Before (Generic Neo4j):**
```python
# Manual entity creation
await neo4j_client.addEntity(name, type, tags)
await neo4j_client.addLink(e1, e2, weight, context)
```

**After (Graphiti):**
```python
from graphiti_core import EpisodeType

# Episode-based ingestion (Graphiti extracts entities)
await graphiti.add_episode(
    name=f"auth-discussion_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    episode_body="We discussed JWT refresh token race conditions...",
    source_description="Chat with user",
    source=EpisodeType.message,
    reference_time=datetime.now()
)

# Graphiti automatically:
# - Extracts entities (JWT, refresh token, race condition)
# - Infers relationships
# - Updates temporal graph
# - Handles contradictions
```

### Benefits
1. **Simplifies Memory Specialist** - No manual entity extraction
2. **Temporal awareness** - Built-in time tracking
3. **Better search** - Hybrid retrieval out of the box
4. **MCP integration** - Can use Graphiti's MCP server directly
5. **Contradiction handling** - Automatic temporal invalidation

### Migration Plan
1. Replace `neo4j-client.ts` with `graphiti-client.ts` (Python)
2. Update Memory Specialist to use episode-based API
3. Replace manual Cypher queries with Graphiti search
4. Update graph schema to Graphiti's data model
5. Simplify setup script (Graphiti handles schema)

---

## Update 3: PR Workflow Addition

### Final Steps After Implementation

**Before marking complete:**

1. **Create Pull Request**
   ```bash
   cd ~/clawd/Projects/clawdbot-swarm
   git checkout -b feat/swarm-memory-implementation
   git add .
   git commit -m "Complete swarm memory implementation with Graphiti"
   git push origin feat/swarm-memory-implementation
   # Create PR on GitHub
   ```

2. **Request Copilot Review**
   - Use GitHub Copilot with **Opus 4.5 model**
   - Review all code, documentation, architecture
   - Focus areas:
     - Memory access boundaries
     - Graphiti integration
     - CSP/1 protocol adherence
     - Testing coverage
     - Documentation completeness

3. **Address Feedback**
   - Implement all Copilot suggestions
   - Fix identified issues
   - Update tests if needed
   - Re-request review if significant changes

4. **Final Approval**
   - All tests passing ✅
   - All Copilot feedback addressed ✅
   - Documentation complete ✅
   - Performance targets met ✅

5. **Merge & Deploy**
   - Merge PR to main
   - Tag release (v1.0.0)
   - Deploy to production

---

## Implementation Status

### Phase 0-6: Original Implementation
- ✅ CSP/1 protocol
- ✅ Task router
- ✅ Specialists (generic Neo4j)
- ✅ Sub-agents (Advocate, Critic, Analyzer, Planner)
- ✅ Parser
- ✅ Maintenance specs
- ✅ Documentation

### Critical Updates
- 🚧 **Update 1:** Memory access audit (in progress)
- 🚧 **Update 2:** Graphiti migration (in progress)
- ⏳ **Update 3:** PR workflow (pending)

### Next Steps
1. ✅ Audit memory access violations
2. 🚧 Create Graphiti client (Python)
3. 🚧 Update Memory Specialist for Graphiti API
4. 🚧 Update graph schema for Graphiti
5. 🚧 Update setup script for Graphiti installation
6. 🚧 Update tests for Graphiti
7. ⏳ Create PR
8. ⏳ Request Copilot review
9. ⏳ Address feedback
10. ⏳ Final approval

---

## Timeline

**Critical Updates:** 2-3 hours
- Memory access audit: 30 min
- Graphiti migration: 90-120 min
- PR workflow: 30-60 min (review time)

**Total Implementation:** 6.5-7.5 hours (original 4.5h + critical updates 2-3h)

---

## Files to Update

### New Files (Graphiti)
- `memory-tiers/graphiti-client.py` (replaces neo4j-client.ts)
- `memory-tiers/graphiti-setup.sh` (replaces neo4j-setup.sh)
- `memory-tiers/graphiti-schema.md` (replaces graph-schema.md)

### Updated Files (Memory Access)
- `specialists/memory.md` (Graphiti API)
- `specialists/file.md` (no memory access)
- `specialists/web.md` (no memory access)
- `specialists/tool.md` (no memory access)
- `AGENTS.md` (explicit memory boundaries)
- `CSP1.md` (memory access rules)

### Updated Files (Testing)
- `TESTING.md` (Graphiti-specific tests)
- `check-installation.sh` (check Graphiti, not Neo4j)

### New Files (PR Workflow)
- `.github/workflows/copilot-review.yml` (GitHub Actions)
- `CONTRIBUTING.md` (PR guidelines)

---

## Questions for Clarification

1. **Graphiti MCP Server:** Should we use Graphiti's existing MCP server, or build custom integration?
2. **Language:** Graphiti is Python-only. Should we:
   - Keep TypeScript parser (interop via API)
   - Port entire implementation to Python
   - Hybrid approach (Python for Graphiti, TypeScript for parser)
3. **Custom Entity Types:** Do we need custom Pydantic models for entities, or use Graphiti defaults?
4. **Migration:** Should we provide JSONL → Graphiti migration script?

---

## Decision Log

**Decision 1: Use Graphiti's MCP Server**
- Reason: Already implemented, tested, maintained
- Benefit: Immediate integration with Claude, Cursor, etc.
- Trade-off: Less customization

**Decision 2: Hybrid Language Approach**
- Python: Graphiti client, Memory Specialist backend
- TypeScript: CSP/1 parser, CLI tools (already implemented)
- Interop: REST API or direct Python calls

**Decision 3: Start with Default Entity Types**
- Use Graphiti's built-in entity extraction
- Add custom types later if needed
- Simplifies initial implementation

---

## Open Issues

- [ ] Verify no memory access violations in current implementation
- [ ] Choose Graphiti deployment (local Neo4j vs cloud)
- [ ] Decide on MCP server usage (built-in vs custom)
- [ ] Determine language strategy (Python/TypeScript split)
- [ ] Create Graphiti client implementation
- [ ] Update all documentation for Graphiti
- [ ] Add Graphiti-specific tests
- [ ] Set up PR review workflow

---

**Status:** 🚧 Critical updates in progress. Original implementation paused pending Graphiti migration.
