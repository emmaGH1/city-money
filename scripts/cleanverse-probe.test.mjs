import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { encryptBody, loadOrCreateWallets } from './cleanverse-probe.mjs';

test('documented encryption round-trips UTF-8 JSON with zero IV', () => {
  const key = crypto.randomBytes(32);
  const input = { chain: 'monad', token_name: 'Test café credits' };
  const { data } = encryptBody(input, key.toString('base64'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16));
  assert.deepEqual(JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString()), input);
});

test('rejects incorrectly sized encryption keys', () => {
  assert.throws(() => encryptBody({}, Buffer.alloc(16).toString('base64')), /32 bytes/);
});

test('persists four test wallets encrypted at rest with no plaintext keys', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'city-money-vault-test-'));
  const key = crypto.randomBytes(32).toString('base64');
  try {
    const wallets = loadOrCreateWallets(key, directory);
    assert.deepEqual(loadOrCreateWallets(key, directory), wallets);
    assert.equal(new Set(Object.values(wallets).map(w => w.address)).size, 4);
    const file = fs.readFileSync(path.join(directory, 'wallets.enc'), 'utf8');
    for (const wallet of Object.values(wallets)) assert.equal(file.includes(wallet.privateKey), false);
    assert.throws(() => loadOrCreateWallets(crypto.randomBytes(32).toString('base64'), directory));
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
