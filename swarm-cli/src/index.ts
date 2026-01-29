#!/usr/bin/env node

import { Command } from 'commander';
import * as taskId from './commands/task-id.js';
import * as scaffold from './commands/scaffold.js';
import * as validate from './commands/validate.js';
import * as memory from './commands/memory.js';
import * as uuid from './commands/uuid.js';

const program = new Command();

program
  .name('swarm')
  .description('CLI utilities for clawdbot-swarm implementation')
  .version('0.1.0');

// Task ID generation (hash strategy from debate-protocol.md)
program
  .command('task-id <description>')
  .description('Generate task ID using SHA-256 hash strategy')
  .option('-f, --full', 'Show full hash (default: first 16 chars)')
  .action((description: string, options: { full?: boolean }) => {
    taskId.generate(description, options);
  });

// UUID generation
program
  .command('uuid')
  .description('Generate UUID v4')
  .option('-n, --count <number>', 'Number of UUIDs to generate', '1')
  .option('-d, --deterministic <seed>', 'Generate deterministic UUID from seed')
  .action((options: { count?: string; deterministic?: string }) => {
    uuid.generate(options);
  });

// Scaffold files from templates
program
  .command('scaffold <type> <name>')
  .description('Create file from template (agent|skill|behavior|memory)')
  .option('-o, --output <path>', 'Output directory')
  .action((type: string, name: string, options: { output?: string }) => {
    scaffold.create(type, name, options);
  });

// Initialize memory structure
program
  .command('init-memory')
  .description('Create memory directory structure')
  .option('-p, --path <path>', 'Base path', '.')
  .action((options: { path?: string }) => {
    memory.init(options);
  });

// Validate implementation
program
  .command('validate')
  .description('Check implementation completeness')
  .option('-p, --phase <phase>', 'Validate specific phase')
  .option('-v, --verbose', 'Show detailed output')
  .action((options: { phase?: string; verbose?: boolean }) => {
    validate.check(options);
  });

program.parse();
