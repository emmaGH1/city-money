type PaymentProvider = {
  getTransaction(hash: string): Promise<unknown>;
  getTransactionCount(address: string, block: 'latest' | 'pending'): Promise<number>;
  broadcastTransaction(raw: string): Promise<{ hash: string }>;
  waitForTransaction(hash: string, confirmations: number, timeout: number): Promise<unknown>;
};
type SavedPayment = { hash: string; nonce: number; transaction: string; participant: string };

export async function broadcastSavedPayment(provider: PaymentProvider, payment: SavedPayment, authorize: () => Promise<string | null>): Promise<{ result: 'inspect' | 'unknown' | 'blocked'; message?: string }> {
  try {
    if (await provider.getTransaction(payment.hash)) return { result: 'inspect' };
    const latest = await provider.getTransactionCount(payment.participant, 'latest');
    if (latest > payment.nonce) return { result: 'inspect' };
    if (latest !== payment.nonce) return { result: 'blocked', message: 'This payment does not use the current shared-wallet nonce.' };
    if (await provider.getTransactionCount(payment.participant, 'pending') !== latest) return { result: 'unknown', message: 'This nonce has a pending transaction. Recheck the exact saved hash.' };
    const reason = await authorize();
    if (reason) return { result: 'blocked', message: reason };
    const transaction = await provider.broadcastTransaction(payment.transaction);
    if (transaction.hash !== payment.hash) return { result: 'unknown', message: 'The broadcast hash could not be reconciled with the signed payment.' };
    await provider.waitForTransaction(payment.hash, 1, 30000);
    return { result: 'inspect' };
  } catch { return { result: 'unknown', message: 'The saved payment outcome is not confirmed. Recheck or resend only these same signed bytes.' }; }
}
