import { createHash } from 'crypto';
import chalk from 'chalk';

/**
 * Canonicalize task description according to debate-protocol.md:
 * 1. Lowercase all text
 * 2. Remove punctuation except hyphens/underscores
 * 3. Normalize whitespace to single spaces
 * 4. Stem common verbs (fix/fixing/fixed → fix)
 */
function canonicalize(text: string): string {
  // Lowercase
  let canonical = text.toLowerCase();

  // Remove punctuation except hyphens/underscores
  canonical = canonical.replace(/[^\w\s-]/g, '');

  // Normalize whitespace
  canonical = canonical.replace(/\s+/g, ' ').trim();

  // Stem common verbs (simple stemming)
  const stemMap: Record<string, string> = {
    'fixing': 'fix',
    'fixed': 'fix',
    'fixes': 'fix',
    'creating': 'create',
    'created': 'create',
    'creates': 'create',
    'updating': 'update',
    'updated': 'update',
    'updates': 'update',
    'deleting': 'delete',
    'deleted': 'delete',
    'deletes': 'delete',
    'testing': 'test',
    'tested': 'test',
    'tests': 'test',
  };

  for (const [variant, stem] of Object.entries(stemMap)) {
    const regex = new RegExp(`\\b${variant}\\b`, 'g');
    canonical = canonical.replace(regex, stem);
  }

  return canonical;
}

/**
 * Generate task ID using SHA-256 hash strategy
 */
export function generate(description: string, options: { full?: boolean }): void {
  const canonical = canonicalize(description);
  const hash = createHash('sha256').update(canonical).digest('hex');
  const taskId = options.full ? hash : hash.substring(0, 16);

  console.log(chalk.cyan('Original:'), description);
  console.log(chalk.cyan('Canonical:'), canonical);
  console.log(chalk.green('Task ID:'), taskId);

  if (!options.full) {
    console.log(chalk.dim('(Use --full to see complete hash)'));
  }
}
