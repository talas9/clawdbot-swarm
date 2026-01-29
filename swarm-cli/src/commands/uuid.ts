import { createHash, randomBytes } from 'crypto';
import chalk from 'chalk';

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  const bytes = randomBytes(16);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  return [
    bytes.subarray(0, 4).toString('hex'),
    bytes.subarray(4, 6).toString('hex'),
    bytes.subarray(6, 8).toString('hex'),
    bytes.subarray(8, 10).toString('hex'),
    bytes.subarray(10, 16).toString('hex'),
  ].join('-');
}

/**
 * Generate deterministic UUID from seed
 */
function generateDeterministicUUID(seed: string): string {
  const hash = createHash('sha256').update(seed).digest();
  const bytes = hash.subarray(0, 16);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  return [
    bytes.subarray(0, 4).toString('hex'),
    bytes.subarray(4, 6).toString('hex'),
    bytes.subarray(6, 8).toString('hex'),
    bytes.subarray(8, 10).toString('hex'),
    bytes.subarray(10, 16).toString('hex'),
  ].join('-');
}

export function generate(options: { count?: string; deterministic?: string }): void {
  const count = parseInt(options.count || '1', 10);
  
  if (options.deterministic) {
    const uuid = generateDeterministicUUID(options.deterministic);
    console.log(chalk.cyan('Seed:'), options.deterministic);
    console.log(chalk.green('UUID:'), uuid);
  } else {
    for (let i = 0; i < count; i++) {
      const uuid = generateUUID();
      console.log(chalk.green(uuid));
    }
  }
}
