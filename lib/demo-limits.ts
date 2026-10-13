import { parseEther, parseUnits } from 'ethers';

export const maxLivePayments = 2;
export const maxPaymentCredits = 5;
export const minimumReserve = parseUnits('1', 6);
export const minimumGasReserve = parseEther('0.06');

export function merchantCap(initialBalance: string, decimals: number) {
  return parseUnits(initialBalance, decimals) + parseUnits(String(maxLivePayments * maxPaymentCredits), decimals);
}

export function paymentAmount(value: unknown, decimals = 6): bigint | null {
  if (typeof value !== 'string' || !/^[1-5]$/.test(value)) return null;
  return parseUnits(value, decimals);
}

export type CheckoutSnapshot = {
  participantBalance: bigint;
  merchantBalance: bigint;
  nativeBalance: bigint;
  latestNonce: number;
  pendingNonce: number;
  firstLiveNonce: number;
  merchantCap: bigint;
};

export function checkoutAvailability(state: CheckoutSnapshot, amount = paymentAmount('1')!) {
  const remaining = Math.max(0, maxLivePayments - Math.max(0, state.latestNonce - state.firstLiveNonce));
  if (state.latestNonce < state.firstLiveNonce || state.pendingNonce < state.latestNonce) return { available: false, remaining: 0, reason: 'Historical test-wallet nonce cannot be verified.' };
  if (state.pendingNonce !== state.latestNonce) return { available: false, remaining, reason: 'A test payment is awaiting confirmation. Refresh before trying again.' };
  if (remaining === 0) return { available: false, remaining: 0, reason: 'The two-payment demo budget has been used. Inspect the receipts below.' };
  if (state.participantBalance < amount + minimumReserve) return { available: false, remaining, reason: 'Insufficient credits to pay and retain one for the boundary test.' };
  if (state.merchantBalance + amount > state.merchantCap) return { available: false, remaining, reason: 'This payment would exceed the merchant demo cap.' };
  if (state.nativeBalance < minimumGasReserve) return { available: false, remaining, reason: 'The test wallet lacks a safe native-gas reserve.' };
  return { available: true, remaining, reason: '' };
}
