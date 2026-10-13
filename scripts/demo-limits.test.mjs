import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEther, parseUnits } from 'ethers';
import { checkoutAvailability, maxLivePayments, maxPublicPayments, merchantCap, paymentAmount } from '../lib/demo-limits.ts';

const state = { participantBalance: parseUnits('119', 6), merchantBalance: parseUnits('6', 6), nativeBalance: parseEther('1.44'), latestNonce: 3, pendingNonce: 3, firstLiveNonce: 2, merchantCap: merchantCap('5.0', 6) };

test('only accepts one to five whole test credits', () => {
  assert.equal(paymentAmount('1'), 1000000n);
  assert.equal(paymentAmount('5'), 5000000n);
  for (const value of ['0', '6', '1.5', '-1', '1e2', '', 1, null, {}, '01']) assert.equal(paymentAmount(value), null);
});

test('limits checkout count, participant reserve, merchant balance and native gas', () => {
  assert.equal(maxLivePayments, 24);
  assert.equal(maxPublicPayments, 22);
  assert.equal(merchantCap('5.0', 6), parseUnits('125', 6));
  assert.deepEqual(checkoutAvailability(state, paymentAmount('5')), { available: true, remaining: 21, reason: '' });
  assert.equal(checkoutAvailability({ ...state, latestNonce: 24, pendingNonce: 24 }).available, false);
  assert.equal(checkoutAvailability({ ...state, latestNonce: 24, pendingNonce: 24 }, paymentAmount('1'), maxLivePayments).available, true);
  assert.equal(checkoutAvailability({ ...state, latestNonce: 26, pendingNonce: 26 }, paymentAmount('1'), maxLivePayments).available, false);
  assert.equal(checkoutAvailability({ ...state, pendingNonce: 4 }).available, false);
  assert.equal(checkoutAvailability({ ...state, participantBalance: parseUnits('1', 6) }).available, false);
  assert.equal(checkoutAvailability({ ...state, merchantBalance: parseUnits('125', 6) }).available, false);
  assert.equal(checkoutAvailability({ ...state, nativeBalance: 0n }).available, false);
  assert.equal(checkoutAvailability({ ...state, latestNonce: 1, pendingNonce: 1 }).available, false);
});
