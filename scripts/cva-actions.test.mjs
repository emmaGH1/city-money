import test from 'node:test';
import assert from 'node:assert/strict';
import { decodePolicyWords, paymentUnits, sameTokenBalances } from './cva-actions.mjs';

test('bounds a test payment to positive credits with six decimal places', () => {
  assert.equal(paymentUnits('5'), 5000000n);
  assert.equal(paymentUnits('0.000001'), 1n);
  for (const value of ['0', '-1', '5.000001', '6', '1e3', '0.0000001', '', '1;rm -rf /']) assert.throws(() => paymentUnits(value));
});

test('rejection evidence requires all token balances and supply to stay unchanged', () => {
  const before = { supply: '20.0', participant: '15.0', merchant: '5.0', outsider: '0.0' };
  assert.equal(sameTokenBalances(before, { ...before }), true);
  assert.equal(sameTokenBalances({}, {}), false);
  assert.equal(sameTokenBalances(null, before), false);
  for (const key of Object.keys(before)) assert.equal(sameTokenBalances(before, { ...before, [key]: '1.0' }), false);
});

test('reads the three observed words without inventing a custom-error signature', () => {
  const data = '0x81df4480' + '00000000000000000000000010883008a0810467f1130f4f27c1a19e3ebfa240' + (69).toString(16).padStart(64, '0') + (1).toString(16).padStart(64, '0');
  assert.deepEqual(decodePolicyWords(data), { selector: '0x81df4480', recipient: '0x10883008a0810467F1130F4F27c1A19e3EbFA240', threshold: 69, identityLevel: 1 });
  assert.throws(() => decodePolicyWords('0x81df4480'));
});
