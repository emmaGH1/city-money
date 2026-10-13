import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { Contract, FetchRequest, JsonRpcProvider, Wallet, formatUnits, getAddress, parseEther } from 'ethers';
import fixture from '../../../docs/fixture-evidence.json';
import proof from '../../../docs/transaction-evidence.json';
import { checkoutAvailability, maxLivePayments, maxPublicPayments, maxPaymentCredits, merchantCap, paymentAmount, type CheckoutSnapshot } from '../../../lib/demo-limits';
import { paymentInterface, signedPayment, transferMatches } from '../../../lib/payment-intent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const transport = new FetchRequest(fixture.rpcUrl);
transport.timeout = 10000;
transport.setThrottleParams({ maxAttempts: 1 });
const provider = new JsonRpcProvider(transport, fixture.chainId, { staticNetwork: true, cacheTimeout: -1 });
const token = new Contract(fixture.cva, ['function symbol() view returns (string)', 'function decimals() view returns (uint8)', 'function balanceOf(address) view returns (uint256)', 'function transfer(address,uint256) returns (bool)'], provider);
const policy = { chainId: fixture.chainId, token: fixture.cva, participant: fixture.roles.participant.address, merchant: fixture.roles.merchant.address };
const maxMerchantBalance = merchantCap(proof.observations.afterPayment.merchant, fixture.decimals);
function json(body: object, status = 200) { return Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' } }); }
function signer() {
  const secret = process.env.CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY;
  if (!secret) throw new Error('Checkout is not configured.');
  const wallet = new Wallet(secret, provider);
  if (getAddress(wallet.address) !== getAddress(policy.participant)) throw new Error('Unexpected prepared wallet.');
  return wallet;
}
function isRecordingAccess(value: unknown) {
  if (typeof value !== 'string' || !/^[\da-f]{64}$/.test(value)) return false;
  const expected = createHmac('sha256', signer().privateKey).update('city-money-recording-v1').digest();
  return timingSafeEqual(Buffer.from(value, 'hex'), expected);
}
async function paymentLimit() {
  const access = (await cookies()).get('cm-recording')?.value;
  return isRecordingAccess(access) ? maxLivePayments : maxPublicPayments;
}
async function firstLiveNonce() {
  const [last, receipt] = await Promise.all([provider.getTransaction(proof.transactions.rejection.hash), provider.getTransactionReceipt(proof.transactions.rejection.hash)]);
  if (!last || !receipt || receipt.status !== 0 || getAddress(last.from) !== getAddress(policy.participant) || !last.to || getAddress(last.to) !== getAddress(policy.token)) throw new Error('Starting nonce cannot be established.');
  return last.nonce + 1;
}
async function checkoutSnapshot(): Promise<{ wallet: Wallet; balances: CheckoutSnapshot }> {
  const wallet = signer();
  const [first, chain, symbol, decimals, participantBalance, merchantBalance, nativeBalance, latestNonce, pendingNonce] = await Promise.all([
    firstLiveNonce(), provider.send('eth_chainId', []), token.symbol(), token.decimals(), token.balanceOf(wallet.address), token.balanceOf(policy.merchant), provider.getBalance(wallet.address), provider.getTransactionCount(wallet.address, 'latest'), provider.getTransactionCount(wallet.address, 'pending'),
  ]);
  if (Number(chain) !== fixture.chainId || symbol !== fixture.symbol || Number(decimals) !== fixture.decimals) throw new Error('Unexpected network or asset.');
  return { wallet, balances: { participantBalance, merchantBalance, nativeBalance, latestNonce, pendingNonce, firstLiveNonce: first, merchantCap: maxMerchantBalance } };
}
async function receiptResponse(hash: string, nonce?: number) {
  if (!/^0x[\da-f]{64}$/i.test(hash)) return json({ error: 'Valid transaction hash required.' }, 400);
  const base = { hash, explorer: `https://testnet.monadscan.com/tx/${hash}` };
  const [transaction, receipt] = await Promise.all([provider.getTransaction(hash), provider.getTransactionReceipt(hash)]);
  if (!transaction) {
    if (nonce !== undefined && await provider.getTransactionCount(policy.participant, 'latest') > nonce) return json({ ...base, status: 'superseded', message: 'Another transaction used this shared-wallet nonce. This payment is not confirmed; no credits are claimed for it.' });
    return json({ ...base, status: 'unknown', message: 'This hash is not confirmed yet. Recheck, or resend only this exact signed payment—not a new payment.' }, 202);
  }
  const call = paymentInterface.parseTransaction({ data: transaction.data });
  if (getAddress(transaction.from) !== getAddress(policy.participant) || !transaction.to || getAddress(transaction.to) !== getAddress(policy.token) || transaction.chainId !== BigInt(fixture.chainId) || call?.name !== 'transfer' || getAddress(call.args[0]) !== getAddress(policy.merchant) || call.args[1] < paymentAmount('1')! || call.args[1] > paymentAmount('5')! || call.args[1] % paymentAmount('1')! !== 0n) return json({ error: 'This is not a bounded Corner Table payment.' }, 400);
  if (!receipt) return json({ ...base, status: 'pending', message: 'This exact payment is awaiting confirmation.' }, 202);
  if (receipt.status !== 1) return json({ ...base, status: 'reverted', block: receipt.blockNumber, message: 'The actual transfer reverted. No payment is claimed.' }, 422);
  if (!receipt.logs.some(log => transferMatches(log, policy, call.args[1]))) return json({ ...base, status: 'unconfirmed', message: 'Receipt succeeded but the exact token Transfer event could not be verified.' }, 202);
  return json({ ...base, status: 'confirmed', amount: formatUnits(call.args[1], fixture.decimals), block: receipt.blockNumber, message: 'Receipt and exact Cleanverse CVA Transfer event verified.' });
}
export async function GET(request: Request) {
  const url = new URL(request.url);
  const hash = url.searchParams.get('receipt');
  if (hash) {
    const value = url.searchParams.get('nonce');
    const nonce = value !== null && /^\d{1,6}$/.test(value) ? Number(value) : undefined;
    try { return await receiptResponse(hash, nonce); }
    catch { return json({ error: 'Receipt verification is unavailable. No outcome is assumed.' }, 503); }
  }
  if (!process.env.CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY) return json({ available: false, reason: 'Checkout is not configured.', remaining: 0 });
  try {
    const [{ balances }, limit] = await Promise.all([checkoutSnapshot(), paymentLimit()]);
    return json({ ...checkoutAvailability(balances, paymentAmount('1')!, limit), minimum: 1, maximum: maxPaymentCredits, merchant: policy.merchant, recording: limit === maxLivePayments, signing: 'Prepared participant wallet; server-side signing, fixed merchant only.' });
  } catch { return json({ available: false, reason: 'Checkout status cannot be confirmed. Existing receipts remain available.', remaining: 0 }, 503); }
}
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Use the City Money workspace for this action.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON input required.' }, 415);
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 2500) return json({ error: 'Payment input is too long.' }, 413);
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length !== 2) return json({ error: 'Only the documented payment fields are accepted.' }, 400);
    body = parsed as Record<string, unknown>;
  } catch { return json({ error: 'Invalid payment input.' }, 400); }
  if (body.action === 'recording' && Object.hasOwn(body, 'access')) {
    try {
      if (!isRecordingAccess(body.access)) return json({ error: 'Recording access could not be verified.' }, 403);
      (await cookies()).set('cm-recording', String(body.access), { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 10800 });
      return json({ recording: true });
    } catch { return json({ error: 'Recording access is unavailable.' }, 503); }
  }
  if (body.action !== 'prepare' && body.action !== 'broadcast') return json({ error: 'Choose a valid payment action.' }, 400);
  if (body.action === 'prepare') {
    const amount = paymentAmount(body.amount, fixture.decimals);
    if (amount === null || !Object.hasOwn(body, 'amount')) return json({ error: 'Choose a whole amount from 1 to 5 credits.' }, 400);
    try {
      const [{ wallet, balances }, limit] = await Promise.all([checkoutSnapshot(), paymentLimit()]);
      const available = checkoutAvailability(balances, amount, limit);
      if (!available.available) return json({ error: available.reason, remaining: available.remaining }, 409);
      const safeToken = token.connect(wallet) as Contract;
      if (await safeToken.transfer.staticCall(policy.merchant, amount) !== true) return json({ error: 'The CVA did not authorize this merchant.' }, 409);
      const estimate: bigint = await safeToken.transfer.estimateGas(policy.merchant, amount);
      const gasLimit = (estimate * 10750n + 9999n) / 10000n;
      const fee = await provider.getFeeData();
      if (gasLimit > 300000n || fee.maxFeePerGas == null || fee.maxPriorityFeePerGas == null || gasLimit * fee.maxFeePerGas > parseEther('0.06') || balances.nativeBalance < gasLimit * fee.maxFeePerGas) return json({ error: 'The approved fee ceiling cannot be established.' }, 503);
      const transaction = await wallet.signTransaction({ type: 2, to: policy.token, data: paymentInterface.encodeFunctionData('transfer', [policy.merchant, amount]), nonce: balances.latestNonce, chainId: fixture.chainId, gasLimit, maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas });
      const intent = signedPayment(transaction, { ...policy, firstNonce: balances.firstLiveNonce, limit });
      return json({ status: 'prepared', transaction, hash: intent.hash, nonce: intent.tx.nonce, amount: formatUnits(amount, fixture.decimals), explorer: `https://testnet.monadscan.com/tx/${intent.hash}`, message: 'Signed, not broadcast. Save this exact payment before submitting.' });
    } catch { return json({ error: 'A bounded payment could not be prepared. No broadcast was attempted.' }, 503); }
  }
  if (!Object.hasOwn(body, 'transaction')) return json({ error: 'The exact signed transaction is required.' }, 400);
  let intent;
  try { intent = signedPayment(body.transaction, { ...policy, firstNonce: await firstLiveNonce(), limit: await paymentLimit() }); }
  catch { return json({ error: 'This signed transaction is not an approved bounded payment.' }, 400); }
  const base = { hash: intent.hash, explorer: `https://testnet.monadscan.com/tx/${intent.hash}` };
  try {
    if (await provider.getTransaction(intent.hash)) return await receiptResponse(intent.hash, intent.tx.nonce);
    const { balances } = await checkoutSnapshot();
    if (balances.latestNonce > intent.tx.nonce) return await receiptResponse(intent.hash, intent.tx.nonce);
    if (balances.latestNonce !== intent.tx.nonce) return json({ error: 'This is not the current shared-wallet nonce.' }, 409);
    if (balances.pendingNonce !== balances.latestNonce) return json({ ...base, status: 'unknown', message: 'This nonce is occupied by a pending transaction. Recheck the saved hash; no new payment was signed.' }, 202);
    const permission = checkoutAvailability(balances, intent.amount, await paymentLimit());
    if (!permission.available) return json({ error: permission.reason }, 409);
    if (await token.transfer.staticCall(policy.merchant, intent.amount, { from: policy.participant }) !== true) return json({ error: 'The CVA no longer authorizes this merchant transfer.' }, 409);
    // Retries broadcast identical signed bytes; Monad executes their nonce only once.
    const transaction = await provider.broadcastTransaction(String(body.transaction));
    if (transaction.hash !== intent.hash) throw new Error('Unexpected broadcast hash.');
    await provider.waitForTransaction(intent.hash, 1, 30000);
    return await receiptResponse(intent.hash, intent.tx.nonce);
  } catch { return json({ ...base, status: 'unknown', message: 'Broadcast outcome is not confirmed. The exact payment is saved; recheck this hash before doing anything else.' }, 202); }
}
