import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface ValidationRule {
  name: string;
  path: string;
  type: 'file' | 'dir';
  required: boolean;
}

const phases: Record<string, ValidationRule[]> = {
  '0': [
    { name: 'Task Router', path: 'skills/swarm-memory/router.md', type: 'file', required: true },
    { name: 'CSP/1 Protocol', path: 'CSP1.md', type: 'file', required: true },
  ],
  '1': [
    { name: 'Researcher Agent', path: 'skills/swarm-memory/subagents/researcher.md', type: 'file', required: true },
    { name: 'Implementer Agent', path: 'skills/swarm-memory/subagents/implementer.md', type: 'file', required: true },
    { name: 'Reviewer Agent', path: 'skills/swarm-memory/subagents/reviewer.md', type: 'file', required: true },
  ],
  '2': [
    { name: 'Memory Schema', path: 'memory-schema.md', type: 'file', required: true },
    { name: 'Importance Scoring', path: 'importance-scoring.md', type: 'file', required: true },
    { name: 'Memory Behaviors', path: 'memory-behaviors-summary.md', type: 'file', required: true },
    { name: 'MEMORY.md', path: 'MEMORY.md', type: 'file', required: true },
  ],
  '2.5': [
    { name: 'Advocate Agent', path: 'advocate.md', type: 'file', required: true },
    { name: 'Critic Agent', path: 'critic.md', type: 'file', required: true },
    { name: 'Debate Protocol', path: 'debate-protocol.md', type: 'file', required: true },
    { name: 'Failure Tracking', path: 'failures.jsonl', type: 'file', required: true },
    { name: 'CSP/1 Extensions', path: 'CSP1-debate-extensions.md', type: 'file', required: true },
  ],
  '3': [
    { name: 'Orchestrator', path: 'skills/swarm-memory/orchestrator.md', type: 'file', required: true },
  ],
  '4': [
    { name: 'Parser', path: 'skills/swarm-memory/parser.md', type: 'file', required: true },
  ],
  '5': [
    { name: 'Maintenance Routines', path: 'skills/swarm-memory/maintenance.md', type: 'file', required: true },
  ],
  '6': [
    { name: 'Test Scenarios', path: 'skills/swarm-memory/tests/', type: 'dir', required: true },
  ],
};

function checkPath(rule: ValidationRule, basePath: string): { passed: boolean; message: string } {
  const fullPath = join(basePath, rule.path);
  const exists = existsSync(fullPath);
  
  if (!exists) {
    return {
      passed: false,
      message: `${chalk.red('✗')} ${rule.name} - ${chalk.dim(rule.path)} ${chalk.red('(missing)')}`,
    };
  }
  
  const stats = statSync(fullPath);
  const isCorrectType = rule.type === 'dir' ? stats.isDirectory() : stats.isFile();
  
  if (!isCorrectType) {
    return {
      passed: false,
      message: `${chalk.red('✗')} ${rule.name} - ${chalk.dim(rule.path)} ${chalk.red(`(wrong type: expected ${rule.type})`)}`,
    };
  }
  
  return {
    passed: true,
    message: `${chalk.green('✓')} ${rule.name} - ${chalk.dim(rule.path)}`,
  };
}

export function check(options: { phase?: string; verbose?: boolean }): void {
  const basePath = process.cwd();
  const phasesToCheck = options.phase ? [options.phase] : Object.keys(phases);
  
  console.log(chalk.cyan('Validating implementation at:'), basePath);
  console.log();
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const phase of phasesToCheck) {
    const rules = phases[phase];
    
    if (!rules) {
      console.error(chalk.red(`Unknown phase: ${phase}`));
      continue;
    }
    
    console.log(chalk.bold(`Phase ${phase}:`));
    
    let phasePassed = 0;
    let phaseFailed = 0;
    
    for (const rule of rules) {
      const result = checkPath(rule, basePath);
      
      if (options.verbose || !result.passed) {
        console.log(result.message);
      }
      
      if (result.passed) {
        phasePassed++;
        totalPassed++;
      } else {
        phaseFailed++;
        totalFailed++;
      }
    }
    
    const phaseStatus = phaseFailed === 0 
      ? chalk.green('COMPLETE') 
      : chalk.yellow(`${phasePassed}/${rules.length} complete`);
    
    console.log(chalk.dim(`  ${phaseStatus}`));
    console.log();
  }
  
  console.log(chalk.bold('Summary:'));
  console.log(chalk.green('✓'), `${totalPassed} passed`);
  if (totalFailed > 0) {
    console.log(chalk.red('✗'), `${totalFailed} failed`);
  }
  
  process.exit(totalFailed > 0 ? 1 : 0);
}
