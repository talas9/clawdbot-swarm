import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createHash, randomBytes } from 'crypto';

function generateUUID(): string {
  const bytes = randomBytes(16);
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

function generateDeterministicUUID(seed: string): string {
  const hash = createHash('sha256').update(seed).digest();
  const bytes = hash.subarray(0, 16);
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('uuid: generates valid UUID v4 format', () => {
  const uuid = generateUUID();
  assert.match(uuid, UUID_REGEX);
});

test('uuid: version bits are correct (4xxx)', () => {
  const uuid = generateUUID();
  const versionNibble = uuid.split('-')[2][0];
  assert.equal(versionNibble, '4');
});

test('uuid: variant bits are correct (8, 9, a, or b)', () => {
  const uuid = generateUUID();
  const variantNibble = uuid.split('-')[3][0].toLowerCase();
  assert.match(variantNibble, /[89ab]/);
});

test('uuid: generates unique UUIDs', () => {
  const uuids = new Set();
  for (let i = 0; i < 100; i++) {
    uuids.add(generateUUID());
  }
  assert.equal(uuids.size, 100);
});

test('uuid: deterministic UUID from same seed is identical', () => {
  const uuid1 = generateDeterministicUUID('test-seed');
  const uuid2 = generateDeterministicUUID('test-seed');
  assert.equal(uuid1, uuid2);
});

test('uuid: deterministic UUID from different seeds are different', () => {
  const uuid1 = generateDeterministicUUID('seed1');
  const uuid2 = generateDeterministicUUID('seed2');
  assert.notEqual(uuid1, uuid2);
});

test('uuid: deterministic UUID follows UUID v4 format', () => {
  const uuid = generateDeterministicUUID('test-seed');
  assert.match(uuid, UUID_REGEX);
});

test('uuid: deterministic UUID has correct version bits', () => {
  const uuid = generateDeterministicUUID('test-seed');
  const versionNibble = uuid.split('-')[2][0];
  assert.equal(versionNibble, '4');
});

test('uuid: deterministic UUID has correct variant bits', () => {
  const uuid = generateDeterministicUUID('test-seed');
  const variantNibble = uuid.split('-')[3][0].toLowerCase();
  assert.match(variantNibble, /[89ab]/);
});
