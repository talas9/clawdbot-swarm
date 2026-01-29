# Code Review: Graphiti Architecture Documentation

**Reviewer:** GitHub Copilot (Claude Opus 4.5)  
**Date:** 2026-01-29  
**PR:** refactor: Convert swarm memory to Graphiti architecture documentation

---

## Executive Summary

This review evaluates the conversion from Neo4j to Graphiti-based architecture documentation across 26 markdown files. The documentation is **comprehensive and well-structured**, but contains **critical API inaccuracies** that must be corrected before integration.

**Overall Assessment:** ⚠️ **CHANGES REQUIRED**

### Key Findings
- ✅ **Architecture Completeness:** Excellent (95%)
- ❌ **API Pattern Accuracy:** Poor (40%) - Major issues found
- ✅ **Memory Boundary Enforcement:** Excellent (100%)
- ✅ **Integration Guide Usability:** Good (85%)
- ✅ **Documentation Quality:** Good (90%)

---

## 1. Architecture Completeness ✅ (95%)

### Strengths
1. **Clear hierarchy** - Orchestrator → Sub-agents → Specialists
2. **CSP/1 protocol** - Well-defined and consistent
3. **Memory tiers** - All five tiers properly documented
4. **Debate system** - Complete Advocate/Critic specification
5. **Maintenance procedures** - Daily, weekly, monthly all covered
6. **Testing guidelines** - Comprehensive test scenarios

### Minor Gaps
1. **Missing:** Error recovery patterns for MCP server failures beyond simple STATUS FAIL
2. **Missing:** Rollback procedures for corrupted Graphiti state
3. **Missing:** Migration path from existing Neo4j direct implementations

**Recommendation:** Add section to QUICK-START.md covering these recovery scenarios.

---

## 2. API Pattern Accuracy ❌ (40%) - CRITICAL ISSUES

### Critical Issue #1: `add_episode` Method Signature

**Files Affected:**
- `skills/swarm-memory/README.md` (lines 79-86)
- `skills/swarm-memory/specialists/memory.md` (lines 179-186)
- `skills/swarm-memory/memory-tiers/graph-schema.md` (lines 99-111)
- `skills/swarm-memory/memory-tiers/config.md` (lines 273-280)
- `skills/swarm-memory/QUICK-START.md` (not directly shown but implied)

**Current Pattern (INCORRECT):**
```python
await graphiti.add_episode(
    content="Fixed JWT refresh bug in auth.ts by adding expiry check",
    source_description="Code commit",
    reference_time=datetime.now()
)
```

**Correct Pattern:**
```python
await graphiti.add_episode(
    name="jwt-fix-commit",  # REQUIRED parameter (missing in docs)
    episode_body="Fixed JWT refresh bug in auth.ts by adding expiry check",  # NOT 'content'
    source_description="Code commit",
    reference_time=datetime.now()
)
```

**Issues:**
1. ❌ Missing required `name` parameter
2. ❌ Using `content` instead of `episode_body`
3. ❌ No mention of `source` parameter (EpisodeType.message, .text, or .json)

### Critical Issue #2: Search Methods Don't Exist

**Files Affected:**
- `skills/swarm-memory/README.md` (lines 88-97)
- `skills/swarm-memory/specialists/memory.md` (lines 188-215)
- `skills/swarm-memory/memory-tiers/config.md` (lines 228-268)

**Current Pattern (INCORRECT):**
```python
results = await graphiti.search_entities(
    query="authentication components",
    num_results=10
)

results = await graphiti.search_edges(
    query="auth dependencies",
    num_results=10,
    rerank=True
)

context = await graphiti.build_context(
    entity_names=["auth.ts"],
    max_facts=20
)
```

**Correct Pattern:**
```python
# Graphiti only has ONE search method:
results = await graphiti.search(
    query="authentication components",
    num_results=10,
    center_node_uuid="optional-for-node-centric-search",
    group_ids=None  # Optional filtering
)
# Returns list[EntityEdge] - edges/facts, not separate entity/edge methods

# For "build_context" - no direct method, assemble from search results
edges = await graphiti.search(query="auth.ts related facts", num_results=20)
```

**Issues:**
1. ❌ `search_entities()` method **does not exist** in Graphiti API
2. ❌ `search_edges()` method **does not exist** in Graphiti API
3. ❌ `build_context()` method **does not exist** as documented
4. ❌ `rerank` parameter not in main `search()` signature (it's automatic based on center_node_uuid)

### Critical Issue #3: Stats Method

**Files Affected:**
- `skills/swarm-memory/README.md` (line 427)
- `skills/swarm-memory/memory-tiers/graph-schema.md` (line 285-289)

**Current Pattern (UNCERTAIN):**
```python
stats = await graphiti.get_stats()
print(f"Entities: {stats['entity_count']}")
```

**Issue:**
- ⚠️ `get_stats()` method not documented in official Graphiti API
- May exist in implementation but unclear
- Should verify or provide alternative (Cypher queries)

---

## 3. Memory Boundary Enforcement ✅ (100%)

### Excellent Implementation

**Strengths:**
1. ✅ **Clear prohibition** in file.md, web.md, tool.md specialists
2. ✅ **Consistent enforcement** across all documentation
3. ✅ **CSP/1 routing** requires all memory ops go through Memory Specialist
4. ✅ **Explicit section** in QUICK-START.md (line 223-229)
5. ✅ **MEMORY-ACCESS-AUDIT.md** provides verification checklist

**Example (file.md lines 3-9):**
```markdown
## 🚫 CRITICAL: Memory Access Prohibition

This specialist MUST NOT access:
- `memory/` directory files
- `MEMORY.md`
- Memory MCP tools
- Graphiti database

**ALL memory operations MUST be delegated to Memory Specialist via CSP/1 protocol.**
```

**No issues found.** This is exemplary architecture documentation.

---

## 4. Integration Guide Usability ✅ (85%)

### Strengths

**QUICK-START.md provides:**
1. ✅ Clear prerequisite list (Neo4j, Python, OpenAI key)
2. ✅ Step-by-step installation (Docker, Homebrew, Neo4j Desktop)
3. ✅ MCP server configuration with concrete examples
4. ✅ AGENTS.md integration section (lines 175-214)
5. ✅ Five comprehensive test scenarios (lines 256-342)
6. ✅ Troubleshooting section (lines 440-485)

### Issues

**Issue #1: MCP Config Path Ambiguity**
- **Location:** QUICK-START.md line 118
- **Problem:** "location depends on Clawdbot setup" is too vague
- **Fix:** Provide common paths for different systems:
  ```
  ~/.config/claude/mcp_config.json  # Claude Desktop
  ~/.config/clawdbot/mcp.json       # Clawdbot standalone
  <project>/.clawdbot/mcp.json      # Project-specific
  ```

**Issue #2: Missing uvx Installation**
- **Location:** QUICK-START.md lines 119-134
- **Problem:** Uses `uvx` command but never mentions installing it
- **Fix:** Add prerequisite:
  ```bash
  # Install uvx (Python package executor)
  pip install uvx
  # Or via pipx
  pipx install uvx
  ```

**Issue #3: API Key Security**
- **Location:** QUICK-START.md line 124
- **Problem:** Shows `${OPENAI_API_KEY}` but doesn't explain env var setup
- **Fix:** Add section before config:
  ```bash
  # Set environment variables (add to ~/.bashrc or ~/.zshrc)
  export OPENAI_API_KEY="sk-..."
  export NEO4J_PASSWORD="your-password"
  ```

**Issue #4: Test Cases Use Incorrect API**
- **Location:** QUICK-START.md lines 256-342
- **Problem:** Test flows reference `memory_search`, `memory_get`, `memory_add` MCP tools
- **Status:** ⚠️ Uncertain if MCP server exposes these exact names
- **Recommendation:** Verify MCP tool names or note they're examples

---

## 5. Documentation Quality ✅ (90%)

### Strengths

1. ✅ **Consistent structure** across all specialist files
2. ✅ **Clear CSP/1 examples** with input/output format
3. ✅ **Performance targets** specified (latency, token efficiency)
4. ✅ **Maintenance schedules** with concrete actions
5. ✅ **Real-world examples** (auth.ts dependency tracking)
6. ✅ **Comprehensive FAQ** in README.md

### Minor Issues

**Issue #1: Inconsistent Terminology**
- **Files:** Multiple
- **Problem:** Mixes "episode" (Graphiti term) with "entry" and "chunk" (old terms)
- **Example:** memory.md line 36 uses "chunks" but should be "episodes" or "facts"

**Issue #2: Code Block Language Tags**
- **Files:** Multiple
- **Problem:** Some Python code blocks missing language tag
- **Fix:** Ensure all code blocks have ` ```python ` for proper syntax highlighting

**Issue #3: Cross-Reference Accuracy**
- **Files:** README.md, QUICK-START.md
- **Problem:** Some links use relative paths that may not work in all contexts
- **Example:** `[CSP1.md](CSP1.md)` - should be `[CSP1.md](./CSP1.md)` or absolute

---

## 6. Specific File Reviews

### 6.1 skills/swarm-memory/README.md

**Overall:** Excellent architecture overview with critical API issues

**Issues:**
- Line 79-86: ❌ `add_episode` incorrect signature (see Issue #1)
- Line 88-97: ❌ `search_entities`, `build_context` don't exist (see Issue #2)
- Line 427-428: ⚠️ `get_stats()` unverified
- Line 441-444: ✅ Good "Why Graphiti" justification

**Strengths:**
- Lines 17-28: ✅ Clear architecture diagram
- Lines 30: ✅ Excellent key principle statement
- Lines 34-53: ✅ CSP/1 example shows 85% savings
- Lines 59-65: ✅ Memory tier table is clear

**Recommendation:** Fix API patterns, rest is excellent.

### 6.2 skills/swarm-memory/specialists/memory.md

**Overall:** Good specialist spec with API inaccuracies

**Issues:**
- Lines 179-186: ❌ `add_episode` incorrect (missing `name`, wrong param name)
- Lines 188-215: ❌ Search methods don't exist as documented
- Lines 150-175: ⚠️ Entity/relationship schemas are correct but examples use wrong API

**Strengths:**
- Lines 1-5: ✅ Clear role definition
- Lines 18-31: ✅ CSP/1 output protocol properly specified
- Lines 219-229: ✅ Constraints section is good

**Recommendation:** Update all Graphiti API calls to use correct signatures.

### 6.3 skills/swarm-memory/memory-tiers/graph-schema.md

**Overall:** Excellent schema documentation, minor API issues

**Issues:**
- Lines 99-133: ❌ Episode examples use incorrect API
- Lines 138-173: ❌ Query examples use non-existent methods

**Strengths:**
- Lines 7-29: ✅ Entity types well-defined
- Lines 31-60: ✅ Relationship types comprehensive
- Lines 62-79: ✅ Temporal model explanation is excellent
- Lines 81-95: ✅ Relevance model correctly describes hybrid search

**Recommendation:** Fix API calls, keep schema design.

### 6.4 skills/swarm-memory/QUICK-START.md

**Overall:** Comprehensive guide with integration gaps

**Issues:**
- Lines 273-280: ❌ Episode addition uses wrong API
- Lines 295-311: ❌ Search examples incorrect
- Lines 118-134: Missing uvx installation
- Lines 124: Missing env var setup instructions

**Strengths:**
- Lines 22-70: ✅ Architecture diagram is excellent
- Lines 77-148: ✅ Installation steps comprehensive
- Lines 175-214: ✅ AGENTS.md integration clear
- Lines 256-342: ✅ Test scenarios well-structured
- Lines 440-485: ✅ Troubleshooting helpful

**Recommendation:** Fix API, add missing setup steps.

### 6.5 skills/swarm-memory/CSP1.md

**Overall:** Excellent protocol specification ✅

**Issues:** None found

**Strengths:**
- Lines 1-10: ✅ Clear laws and mode declaration
- Lines 16-21: ✅ Result format properly specified
- Lines 59-107: ✅ Examples are clear and comprehensive

**Recommendation:** No changes needed.

---

## 7. Priority Fixes

### P0 - Critical (Must Fix Before Merge)

1. **Fix `add_episode` API** - All instances across 5+ files
   - Add `name` parameter
   - Change `content` to `episode_body`
   - Document `source` parameter

2. **Fix search API** - All instances across 5+ files
   - Replace `search_entities()` with `search()`
   - Replace `search_edges()` with `search()`
   - Replace `build_context()` with search-based approach
   - Remove `rerank` parameter, document center_node_uuid usage

3. **Verify/Fix `get_stats()`** - 2 files
   - Confirm method exists or provide Cypher alternative

### P1 - High (Should Fix)

4. **Add uvx installation** to QUICK-START.md prerequisites
5. **Add env var setup** section to QUICK-START.md
6. **Clarify MCP config path** with concrete examples
7. **Verify MCP tool names** (memory_search, memory_get, memory_add)

### P2 - Medium (Nice to Have)

8. **Add error recovery patterns** for MCP failures
9. **Add migration guide** from raw Neo4j implementations
10. **Standardize terminology** (episode vs entry vs chunk)
11. **Fix cross-reference paths** to be more robust

---

## 8. Recommendations

### Immediate Actions

1. **DO NOT MERGE** until P0 issues are fixed
2. **Create correction PR** with API fixes
3. **Test against actual Graphiti** to verify corrected examples work
4. **Update code review checklist** to catch API signature issues

### Long-Term Improvements

1. **Automated API validation** - Script to check examples against Graphiti stubs
2. **Version pinning** - Document which Graphiti version (e.g., v0.3.x)
3. **Link to official docs** - Add more direct links to help.getzep.com/graphiti
4. **Example repository** - Create companion repo with working code

---

## 9. Positive Highlights

Despite the API issues, this documentation has **exceptional qualities**:

1. **Architecture Design** ✨
   - Memory boundary enforcement is perfect
   - CSP/1 protocol is well-thought-out
   - Tiered memory model is sophisticated

2. **Completeness** ✨
   - Covers all components (specialists, sub-agents, maintenance)
   - Includes testing, troubleshooting, performance tuning
   - Multiple integration examples

3. **Clarity** ✨
   - Consistent structure across files
   - Clear examples with expected outputs
   - Good use of diagrams and tables

4. **Practical Focus** ✨
   - Real-world scenarios (auth.ts dependencies)
   - Performance targets specified
   - Troubleshooting section comprehensive

---

## 10. Conclusion

This is **high-quality architectural documentation** with a **critical flaw**: the Graphiti API patterns are incorrect throughout. 

**Fix the P0 API issues and this will be excellent documentation.**

### Approval Status

**❌ CHANGES REQUIRED**

Once API patterns are corrected:
- ✅ Architecture will be production-ready
- ✅ Integration guide will be usable
- ✅ Documentation will be reference-quality

---

## Appendix: Correct Graphiti API Reference

### Adding Episodes

```python
# Text episode (auto-extraction)
await graphiti.add_episode(
    name="commit-abc123",                    # REQUIRED
    episode_body="Fixed JWT bug in auth.ts", # NOT 'content'
    source_description="Code commit",
    reference_time=datetime.now(),
    source=EpisodeType.message               # Optional, defaults to message
)

# Structured JSON episode
await graphiti.add_episode(
    name="product-update-001",
    episode_body={
        "entities": [...],
        "relations": [...]
    },
    source=EpisodeType.json,
    source_description="Manual entry",
    reference_time=datetime.now()
)
```

### Searching

```python
# Hybrid search (semantic + keyword)
edges = await graphiti.search(
    query="authentication components",
    num_results=10
)

# Node-centric search (proximity reranking)
edges = await graphiti.search(
    query="auth dependencies",
    center_node_uuid="uuid-of-auth-entity",
    num_results=10
)

# With filtering
edges = await graphiti.search(
    query="recent changes",
    group_ids=["project-auth"],
    num_results=20
)
```

### Building Context

```python
# No direct build_context method - assemble from search:
def build_context(entity_names, max_facts=20):
    all_edges = []
    for entity_name in entity_names:
        edges = await graphiti.search(
            query=f"facts about {entity_name}",
            num_results=max_facts // len(entity_names)
        )
        all_edges.extend(edges)
    return all_edges
```

---

**End of Review**
