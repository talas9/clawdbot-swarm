# Swarm CLI - Implementation Utilities

CLI tool for automating mechanical tasks in clawdbot-swarm implementation. Reduces AI workload by handling static generation, scaffolding, and validation.

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

Potential additions as implementation progresses:
- `swarm add-behavior <name>` - Add memory behavior with boilerplate
- `swarm test-flow <scenario>` - Test debate/routing flows
- `swarm metrics` - Analyze debate-metrics.jsonl
- `swarm compress-memory` - Run memory compression routine
- `swarm sync-agent <name>` - Sync agent spec to running instance
