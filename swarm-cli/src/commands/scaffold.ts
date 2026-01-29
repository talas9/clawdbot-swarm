import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';

const templates = {
  agent: (name: string) => `# ${name} Agent

## Role

[Define agent's role and responsibility]

## Input Format

\`\`\`
[Input specification]
\`\`\`

## Output Format (CSP/1)

\`\`\`
VERDICT <verdict>
CONFIDENCE <0.0-1.0>
RATIONALE <explanation>
\`\`\`

## Decision Logic

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Examples

### Example 1: [Scenario]
**Input:** \`[input]\`
**Output:**
\`\`\`
VERDICT [verdict]
CONFIDENCE 0.85
RATIONALE [explanation]
\`\`\`
`,

  skill: (name: string) => `# ${name} Skill

## Purpose

[What this skill does]

## When to Use

- [Scenario 1]
- [Scenario 2]

## Implementation

### Setup

\`\`\`bash
# Installation or setup steps
\`\`\`

### Usage

\`\`\`bash
# Command examples
\`\`\`

## Output

[Expected output format]

## Error Handling

- [Error case 1]: [How to handle]
- [Error case 2]: [How to handle]
`,

  behavior: (name: string) => `# ${name} Memory Behavior

## Purpose

[What this behavior does]

## Trigger Conditions

- [Condition 1]
- [Condition 2]

## Implementation

### 1. Detection

\`\`\`typescript
// Pseudocode for detecting when to apply this behavior
\`\`\`

### 2. Execution

\`\`\`typescript
// Pseudocode for executing the behavior
\`\`\`

### 3. Storage

**Memory structure:**
\`\`\`json
{
  "type": "${name}",
  "timestamp": "ISO-8601",
  "data": {}
}
\`\`\`

## Examples

### Example 1: [Scenario]
[Detailed walkthrough]
`,

  memory: (name: string) => `# ${name}

## Summary

[Brief description of what happened]

## Context

- **Date:** [YYYY-MM-DD]
- **Task:** [Task description]
- **Agent:** [Agent that created this]

## Details

[Detailed information]

## Outcome

[What was the result]

## Tags

#${name.toLowerCase().replace(/\s+/g, '-')}
`,
};

export function create(type: string, name: string, options: { output?: string }): void {
  if (!templates[type as keyof typeof templates]) {
    console.error(chalk.red(`Unknown type: ${type}`));
    console.log(chalk.cyan('Available types:'), Object.keys(templates).join(', '));
    process.exit(1);
  }

  const template = templates[type as keyof typeof templates](name);
  const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
  const outputPath = options.output 
    ? join(options.output, filename)
    : filename;

  // Ensure directory exists
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Write file
  writeFileSync(outputPath, template, 'utf-8');
  console.log(chalk.green('✓'), 'Created', chalk.cyan(outputPath));
}
