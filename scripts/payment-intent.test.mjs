import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet, parseUnits, parseEther } from 'ethers';
import { paymentInterface, signedPayment, transferMatches } from '../lib/payment-intent.ts';

const wallet = Wallet.createRandom();
const policy = { chainId: 10143, participant: wallet.address, token: Wallet.createRandom().address, merchant: Wallet.createRandom().address, firstNonce: 2, limit: 22 };
const base = { type: 2, chainId: 10143, nonce: 3, to: policy.token, value: 0n, gasLimit: 280000n, maxFeePerGas: 100000000000n, maxPriorityFeePerGas: 1000000000n, data: paymentInterface.encodeFunctionData('transfer', [policy.merchant, parseUnits('1', 6)]) };

test('a persisted signed payment has one stable hash and nonce across retries', async () => {
  const raw = await wallet.signTransaction(base);
  const restored = JSON.parse(JSON.stringify({ transaction: raw }));
  assert.equal(signedPayment(raw, policy).hash, signedPayment(restored.transaction, policy).hash);
  assert.equal(signedPayment(raw, policy).tx.nonce, 3);
});

test('signed payment rejects wrong recipient, chain, amount, signer, value, nonce and fees', async () => {
  for (const change of [
    { chainId: 1 }, { to: policy.merchant }, { value: 1n }, { nonce: 24 }, { nonce: 1 },
    { gasLimit: 300001n }, { maxFeePerGas: parseEther('1') },
    { data: paymentInterface.encodeFunctionData('transfer', [policy.participant, parseUnits('1', 6)]) },
    { data: paymentInterface.encodeFunctionData('transfer', [policy.merchant, parseUnits('1.5', 6)]) },
    { data: paymentInterface.encodeFunctionData('transfer', [policy.merchant, parseUnits('6', 6)]) },
  ]) {
    const raw = await wallet.signTransaction({ ...base, ...change });
    assert.throws(() => signedPayment(raw, policy));
  }
  assert.throws(() => signedPayment('invalid', policy));
  const wrongSigner = await Wallet.createRandom().signTransaction(base);
  assert.throws(() => signedPayment(wrongSigner, policy));
});

test('receipt proof matches only the actual token and exact Transfer event', () => {
  const event = paymentInterface.encodeEventLog(paymentInterface.getEvent('Transfer'), [policy.participant, policy.merchant, 1000000n]);
  assert.equal(transferMatches({ address: policy.token, ...event }, policy, 1000000n), true);
  assert.equal(transferMatches({ address: policy.merchant, ...event }, policy, 1000000n), false);
  assert.equal(transferMatches({ address: policy.token, ...event }, policy, 2000000n), false);
});
