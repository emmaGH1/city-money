import { Interface, Transaction, getAddress, parseEther, parseUnits } from 'ethers';

export const paymentInterface = new Interface([
  'function transfer(address,uint256) returns (bool)',
  'event Transfer(address indexed from,address indexed to,uint256 value)',
]);

export type PaymentPolicy = { chainId: number; token: string; participant: string; merchant: string; firstNonce: number; limit: number };

export function signedPayment(raw: unknown, policy: PaymentPolicy) {
  if (typeof raw !== 'string' || !/^0x[\da-f]+$/i.test(raw) || raw.length > 2000) throw new Error('A bounded signed payment is required.');
  const tx = Transaction.from(raw);
  const call = paymentInterface.parseTransaction({ data: tx.data });
  const amount = call?.args[1] as bigint | undefined;
  if (!tx.isSigned() || !tx.from || getAddress(tx.from) !== getAddress(policy.participant) || !tx.to || getAddress(tx.to) !== getAddress(policy.token) || tx.chainId !== BigInt(policy.chainId) || tx.type !== 2 || tx.value !== 0n || call?.name !== 'transfer' || getAddress(call.args[0]) !== getAddress(policy.merchant) || amount === undefined || amount < parseUnits('1', 6) || amount > parseUnits('5', 6) || amount % parseUnits('1', 6) !== 0n) throw new Error('The signed transaction does not match the approved payment.');
  if (tx.nonce < policy.firstNonce || tx.nonce >= policy.firstNonce + policy.limit) throw new Error('This payment is outside the approved demo allowance.');
  if (tx.gasLimit <= 0n || tx.gasLimit > 300000n || tx.maxFeePerGas == null || tx.maxPriorityFeePerGas == null || tx.maxPriorityFeePerGas > tx.maxFeePerGas || tx.gasLimit * tx.maxFeePerGas > parseEther('0.06')) throw new Error('This payment exceeds the approved fee ceiling.');
  return { tx, amount, hash: tx.hash! };
}

export function transferMatches(log: { address: string; topics: readonly string[]; data: string }, policy: Pick<PaymentPolicy, 'token' | 'participant' | 'merchant'>, amount: bigint) {
  if (getAddress(log.address) !== getAddress(policy.token)) return false;
  try {
    const event = paymentInterface.parseLog({ topics: [...log.topics], data: log.data });
    return event?.name === 'Transfer' && getAddress(event.args[0]) === getAddress(policy.participant) && getAddress(event.args[1]) === getAddress(policy.merchant) && event.args[2] === amount;
  } catch { return false; }
}
