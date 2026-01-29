import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { canonicalize, generateTaskId } from '../commands/task-id.js';

test('task-id: canonicalization lowercases text', () => {
  const result = canonicalize('Fix Authentication Test');
  assert.equal(result, 'fix authentication test');
});

test('task-id: canonicalization removes punctuation', () => {
  const result = canonicalize('Fix: authentication, test!');
  assert.equal(result, 'fix authentication test');
});

test('task-id: canonicalization normalizes whitespace', () => {
  const result = canonicalize('Fix    authentication     test');
  assert.equal(result, 'fix authentication test');
});

test('task-id: canonicalization stems verbs', () => {
  assert.equal(canonicalize('Fixing auth test'), 'fix auth test');
  assert.equal(canonicalize('Fixed auth test'), 'fix auth test');
  assert.equal(canonicalize('Creating new feature'), 'create new feature');
  assert.equal(canonicalize('Updated config'), 'update config');
  assert.equal(canonicalize('Deleting old files'), 'delete old files');
  assert.equal(canonicalize('Testing the feature'), 'test the feature');
});

test('task-id: identical descriptions produce identical hashes', () => {
  const hash1 = generateTaskId('Fix authentication test');
  const hash2 = generateTaskId('Fix authentication test');
  assert.equal(hash1, hash2);
});

test('task-id: semantically identical descriptions produce identical hashes', () => {
  const hash1 = generateTaskId('Fix authentication test');
  const hash2 = generateTaskId('Fixing authentication test');
  const hash3 = generateTaskId('Fixed authentication test');
  assert.equal(hash1, hash2);
  assert.equal(hash2, hash3);
});

test('task-id: different descriptions produce different hashes', () => {
  const hash1 = generateTaskId('Fix authentication test');
  const hash2 = generateTaskId('Fix authorization test');
  assert.notEqual(hash1, hash2);
});

test('task-id: default hash is 16 characters', () => {
  const hash = generateTaskId('Fix test');
  assert.equal(hash.length, 16);
});

test('task-id: full hash is 64 characters (SHA-256)', () => {
  const hash = generateTaskId('Fix test', true);
  assert.equal(hash.length, 64);
});

test('task-id: hash is deterministic', () => {
  const description = 'Fix authentication test';
  const hash1 = generateTaskId(description);
  const hash2 = generateTaskId(description);
  const hash3 = generateTaskId(description);
  assert.equal(hash1, hash2);
  assert.equal(hash2, hash3);
});
