# Memory Access Boundary Audit

**Rule:** ONLY Memory Specialist can access memory files and memory MCP.

**Date:** January 29, 2026

---

## Audit Results

### ✅ COMPLIANT: Specialist Files

#### File Specialist (`specialists/file.md`)
```
Capabilities:
- Read file chunks (max 500 lines per request)
- Write files
- Search with grep/ripgrep
- List directories
- File metadata inspection
```
**Status:** ✅ No memory access. Only filesystem operations.

#### Web Specialist (`specialists/web.md`)
```
Capabilities:
- Web search (Brave Search API)
- URL fetch and extraction
- API calls (when configured)
- HTTP requests
```
**Status:** ✅ No memory access. Only web operations.

#### Tool Specialist (`specialists/tool.md`)
```
Capabilities:
- Execute shell commands
- Browser automation
- Canvas control
- Cron job management
- Node operations
- MCP server tools
```
**Status:** ✅ No memory access. Only tool operations.

### ✅ COMPLIANT: Orchestrator (AGENTS.md)

All examples show proper delegation:
```
Orchestrator → Memory Specialist:
TASK REQ:recall auth bugs IN:MEM OUT:MEM_REFS
```

**Status:** ✅ Never accesses memory directly. Always delegates via CSP/1.

### ✅ COMPLIANT: Sub-Agents

#### Analyzer (`subagents/analyzer.md`)
- Decomposes tasks
- Routes to specialists
- **Does not access memory**

#### Planner (`subagents/planner.md`)
- Optimizes execution
- Plans parallel tasks
- **Does not access memory**

#### Advocate (`subagents/advocate.md`)
- Defends plans
- Proposes fixes
- **Does not access memory**

#### Critic (`subagents/critic.md`)
- Challenges plans
- Identifies risks
- **Does not access memory**

**Status:** ✅ All sub-agents delegate to specialists, never access memory directly.

### ✅ COMPLIANT: CSP/1 Protocol

Protocol specification enforces specialist routing:
```
TASK REQ:<action> IN:<scope> OUT:<expected_type>
```

Where `scope` determines specialist:
- `MEM` → Memory Specialist only
- `SRC` → File Specialist
- `WEB` → Web Specialist
- `SHELL` → Tool Specialist

**Status:** ✅ Protocol enforces boundaries.

---

## Violations Found: NONE ✅

**All components properly delegate to Memory Specialist for memory operations.**

---

## Additional Enforcement Mechanisms

### 1. Documentation Updates

**Add to all non-Memory specialist files:**
```markdown
## CRITICAL: Memory Access Prohibition

This specialist MUST NOT access:
- memory/ directory files
- MEMORY.md
- Memory MCP tools
- Graphiti database

ALL memory operations MUST be delegated to Memory Specialist via CSP/1 protocol.
```

### 2. Router Updates

**Update `router.md` to enforce:**
```markdown
## Memory Access Rules

ONLY Memory Specialist can:
- Read/write memory files
- Access memory MCP
- Query Graphiti database
- Store/recall information

If task requires memory access:
1. Route to ACTION mode
2. Analyzer delegates to Memory Specialist
3. No other specialist may substitute
```

### 3. Parser Validation

**Add to `parser/csp1-parser.ts`:**
```typescript
function validateMemoryAccess(specialist: string, scope: string): boolean {
  if (scope === 'MEM' && specialist !== 'memory') {
    throw new Error('VIOLATION: Only Memory Specialist can access MEM scope');
  }
  return true;
}
```

### 4. Testing

**Add to `TESTING.md`:**
```markdown
### Memory Access Boundary Tests

**Test 1: File Specialist Cannot Access Memory**
- Request: "Search for auth in memory/"
- Expected: Router delegates to Memory Specialist, NOT File Specialist
- Validation: File Specialist never sees this request

**Test 2: Orchestrator Cannot Read MEMORY.md**
- Request: "What's in MEMORY.md?"
- Expected: Delegates to Memory Specialist
- Validation: Orchestrator never calls Read tool on MEMORY.md

**Test 3: Tool Specialist Cannot Write Memory**
- Request: "Store this to memory"
- Expected: Delegates to Memory Specialist
- Validation: Tool Specialist never executes write to memory/

**Test 4: CSP/1 Validation**
- Invalid: TASK REQ:search IN:MEM (from File Specialist)
- Expected: Parser rejects with VIOLATION error
```

---

## Recommendations

### Immediate Actions

1. ✅ **Add explicit prohibition to all non-Memory specialist files**
   - Update `specialists/file.md`
   - Update `specialists/web.md`
   - Update `specialists/tool.md`

2. ✅ **Add memory access rules to router**
   - Update `router.md` with enforcement section

3. ✅ **Add parser validation**
   - Update `parser/csp1-parser.ts` with validateMemoryAccess()

4. ✅ **Add boundary tests**
   - Update `TESTING.md` with 4 memory access tests

### Long-Term Actions

1. **Runtime Enforcement**
   - Clawdbot gateway could enforce at MCP level
   - Block non-Memory agents from memory_search, memory_get tools
   - Return error if violation attempted

2. **Audit Logging**
   - Log all memory access attempts
   - Alert on violations
   - Generate weekly audit reports

3. **Documentation**
   - Add "Memory Access Architecture" diagram
   - Show flow: Human → Orchestrator → Memory Specialist → Memory/Graphiti
   - Explicit red "X" over other paths

---

## Conclusion

**✅ Current implementation is compliant.**

No violations found. All components properly delegate to Memory Specialist.

**Next steps:**
1. Add explicit prohibitions to documentation
2. Implement parser validation
3. Add boundary tests
4. Document architecture clearly

**Estimated time:** 30 minutes

---

**Audit Status: COMPLETE ✅**
**Violations: 0**
**Recommendations: 4 immediate, 3 long-term**
