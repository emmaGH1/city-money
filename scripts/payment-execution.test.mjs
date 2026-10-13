import test from 'node:test';
import assert from 'node:assert/strict';
import { broadcastSavedPayment } from '../lib/payment-execution.ts';

const saved = { hash: '0xreceipt', nonce: 3, transaction: 'exact-signed-bytes', participant: 'prepared-wallet' };
function chain(options = {}) {
  const state = { executions: 0, broadcasts: [], latest: 3, pending: 3, known: false, ...options };
  const provider = {
    async getTransaction() { if (state.rpcFailure) throw Error('RPC unavailable'); return state.known ? { hash: saved.hash } : null; },
    async getTransactionCount(_wallet, block) { return state[block]; },
    async broadcastTransaction(raw) {
      state.broadcasts.push(raw);
      if (!state.known) { state.known = true; state.executions++; state.latest++; state.pending++; }
      if (state.lostResponse) throw Error('Lost broadcast response');
      return { hash: saved.hash };
    },
    async waitForTransaction() { if (state.receiptFailure) throw Error('Receipt timeout'); return { status: 1 }; },
  };
  return { state, provider };
}
const allowed = async () => null;

test('lost response recovers the same payment without a fresh broadcast or signing', async () => {
  const { state, provider } = chain({ lostResponse: true });
  assert.equal((await broadcastSavedPayment(provider, saved, allowed)).result, 'unknown');
  assert.equal((await broadcastSavedPayment(provider, JSON.parse(JSON.stringify(saved)), allowed)).result, 'inspect');
  assert.equal(state.executions, 1);
  assert.deepEqual(state.broadcasts, [saved.transaction]);
});
test('simultaneous same-intent requests reuse identical bytes and one chain nonce', async () => {
  const { state, provider } = chain();
  await Promise.all(Array.from({ length: 10 }, () => broadcastSavedPayment(provider, saved, allowed)));
  assert.equal(state.executions, 1);
  assert.ok(state.broadcasts.every(raw => raw === saved.transaction));
});
test('exhaustion and authorization failure never broadcast', async () => {
  const { state, provider } = chain();
  assert.equal((await broadcastSavedPayment(provider, saved, async () => 'Allowance exhausted')).result, 'blocked');
  assert.equal(state.executions, 0);
});
test('pending, consumed and future nonces do not create fresh transactions', async () => {
  for (const [options, result] of [[{ pending: 4 }, 'unknown'], [{ latest: 4, pending: 4 }, 'inspect']]) {
    const { state, provider } = chain(options);
    assert.equal((await broadcastSavedPayment(provider, saved, allowed)).result, result);
    assert.equal(state.executions, 0);
  }
  const { state, provider } = chain();
  assert.equal((await broadcastSavedPayment(provider, { ...saved, nonce: 4 }, allowed)).result, 'blocked');
  assert.equal(state.executions, 0);
});
test('RPC read failure does not broadcast; receipt timeout does not claim confirmation', async () => {
  const failed = chain({ rpcFailure: true });
  assert.equal((await broadcastSavedPayment(failed.provider, saved, allowed)).result, 'unknown');
  assert.equal(failed.state.executions, 0);
  const pending = chain({ receiptFailure: true });
  assert.equal((await broadcastSavedPayment(pending.provider, saved, allowed)).result, 'unknown');
  assert.equal(pending.state.executions, 1);
});
