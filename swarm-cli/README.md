# Swarm CLI - Implementation Utilities

**The permanent home for all scripts and tools that don't require AI reasoning.**

CLI tool for automating mechanical tasks in clawdbot-swarm implementation. Reduces AI workload by handling static generation, scaffolding, and validation.

## Philosophy

This CLI is designed to be the **permanent repository for all automation** that can be scripted:

- **Deterministic operations:** UUID generation, hashing, file operations
- **Template-based creation:** Scaffolding agents, skills, behaviors
- **Batch operations:** Memory compression, metrics aggregation, bulk validation
- **Static analysis:** Code checks, configuration validation, dependency audits

**Rule of thumb:** If a task doesn't need reasoning or creativity, it belongs here as a script, not as AI work.

As the swarm implementation evolves, new commands will be added to handle repetitive tasks, data transformations, and system maintenance that AI shouldn't waste tokens on.

## Installation

```bash
cd swarm-cli
npm install
npm run build
```

## Usage

### Task ID Generation

Generate task IDs using the SHA-256 hash strategy from `debate-protocol.md`:

```bash
npm run swarm task-id "Fix authentication test"
# Output:
# Original: Fix authentication test
# Canonical: fix authentication test
# Task ID: a3f2c1d4e5f6a7b8
```

Use `--full` to see the complete hash:

```bash
npm run swarm task-id "Fix authentication test" --full
```

### UUID Generation

Generate random UUIDs:

```bash
# Single UUID
npm run swarm uuid

# Multiple UUIDs
npm run swarm uuid --count 5

# Deterministic UUID from seed
npm run swarm uuid --deterministic "my-seed"
```

### Scaffolding

Create files from templates:

```bash
# Create agent specification
npm run swarm scaffold agent "Validator"

# Create skill documentation
npm run swarm scaffold skill "Git History"

# Create memory behavior
npm run swarm scaffold behavior "Priming"

# Create memory entry
npm run swarm scaffold memory "Project Decision"

# Specify output directory
npm run swarm scaffold agent "Tester" --output ./skills/swarm-memory/subagents/
```

**Available types:**
- `agent` - Agent specification with CSP/1 format
- `skill` - Skill documentation template
- `behavior` - Memory behavior specification
- `memory` - Memory entry template

### Memory Initialization

Create the memory directory structure:

```bash
npm run swarm init-memory

# Specify path
npm run swarm init-memory --path ~/clawd
```

Creates:
- `MEMORY.md` - Long-term memory
- `memory/active-tasks.md` - Task tracking
- `memory/episodic.jsonl` - Episodic memory log
- `memory/importance-tiers.jsonl` - Importance scoring
- `memory/failures.jsonl` - Failure tracking
- `memory/debate-metrics.jsonl` - Debate performance

### Validation

Check implementation completeness:

```bash
# Validate all phases
npm run swarm validate

# Validate specific phase
npm run swarm validate --phase 2.5

# Verbose output (show all checks)
npm run swarm validate --verbose
```

## Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `task-id <desc>` | Generate task ID hash | `swarm task-id "fix bug"` |
| `uuid` | Generate UUID | `swarm uuid --count 3` |
| `scaffold <type> <name>` | Create from template | `swarm scaffold agent "Validator"` |
| `init-memory` | Create memory structure | `swarm init-memory` |
| `validate` | Check implementation | `swarm validate --phase 2` |

## Why This Tool?

**Problem:** AI agents spend tokens on mechanical tasks like:
- Generating UUIDs
- Hashing task descriptions
- Creating boilerplate files
- Checking file existence

**Solution:** Automate the mechanical, let AI focus on:
- Complex decision-making
- Content generation that requires reasoning
- Integration logic
- Problem-solving

**Benefits:**
- ⚡ Faster implementation
- 💰 Lower token costs
- 🎯 More reliable (deterministic outputs)
- 🔧 Reusable across phases

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Run directly (during development)
npm run swarm <command>
```

## Adding New Commands

1. Create `src/commands/your-command.ts`
2. Export a function that implements the logic
3. Add command to `src/index.ts`
4. Update this README

## Future Enhancements

**This CLI will grow with the swarm.** As new automation opportunities are identified, they'll be added as commands.

### Planned Additions

**Memory & Data:**
- `swarm compress-memory` - Run memory compression/consolidation
- `swarm metrics` - Analyze debate-metrics.jsonl, generate reports
- `swarm graph-query <query>` - Query memory graph (episodic links)
- `swarm export-memory --format json|csv` - Export memory for analysis

**Development & Testing:**
- `swarm test-flow <scenario>` - Test debate/routing flows
- `swarm add-behavior <name>` - Add memory behavior with boilerplate
- `swarm sync-agent <name>` - Sync agent spec to running instance
- `swarm benchmark <phase>` - Performance testing for phases

**Batch Operations:**
- `swarm reindex-memory` - Rebuild importance tiers
- `swarm prune-old --days 30` - Clean up old episodic entries
- `swarm migrate-schema <old> <new>` - Schema migrations
- `swarm batch-task <file>` - Execute tasks from JSON/YAML

**Analysis & Debugging:**
- `swarm debug-routing <task>` - Show routing decision breakdown
- `swarm trace-decision <task-id>` - Show full decision tree
- `swarm conflict-check` - Detect memory contradictions
- `swarm token-report` - Analyze token usage patterns

### Contributing Scripts

**When to add a new command:**
1. Task is repetitive across phases
2. Task is deterministic (no reasoning needed)
3. Task involves batch/bulk operations
4. Task is data transformation or validation

**When NOT to add:**
5. Task requires creative thinking
6. Task needs context-dependent decisions
7. Task is one-off without reuse potential

**The goal:** Keep AI focused on high-value reasoning, offload everything else to scripts.
