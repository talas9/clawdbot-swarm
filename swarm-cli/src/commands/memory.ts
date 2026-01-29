import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const memoryStructure = {
  'MEMORY.md': `# MEMORY.md - Long-Term Memory

## Important Events

[Key events that shaped the agent's behavior]

## Lessons Learned

[Insights from past experiences]

## Preferences

[User preferences and patterns]

## Decisions

[Important decisions made and their rationale]
`,
  'memory/active-tasks.md': `# Active Tasks

## Currently Running

*No active tasks*

## Completed Today (auto-remove after 24h)

*None*

## Cleanup Rules

- Read this file FIRST on every session/compaction
- Running tasks stay until complete/failed
- Completed: remove after 24h
- Failed: keep 48h for debugging
- Archive to daily log if needed
`,
  'memory/episodic.jsonl': ``,
  'memory/importance-tiers.jsonl': ``,
  'memory/failures.jsonl': ``,
  'memory/debate-metrics.jsonl': ``,
};

export function init(options: { path?: string }): void {
  const basePath = options.path || '.';
  
  console.log(chalk.cyan('Initializing memory structure at:'), basePath);
  
  let created = 0;
  let skipped = 0;
  
  for (const [relativePath, content] of Object.entries(memoryStructure)) {
    const fullPath = join(basePath, relativePath);
    const dir = fullPath.includes('/') ? fullPath.split('/').slice(0, -1).join('/') : '';
    
    // Ensure directory exists
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Write file if it doesn't exist
    if (existsSync(fullPath)) {
      console.log(chalk.yellow('⊘'), 'Skipped', chalk.dim(relativePath), '(already exists)');
      skipped++;
    } else {
      writeFileSync(fullPath, content, 'utf-8');
      console.log(chalk.green('✓'), 'Created', chalk.cyan(relativePath));
      created++;
    }
  }
  
  console.log();
  console.log(chalk.green('✓'), `Created ${created} files, skipped ${skipped}`);
}
