import { Contract, FetchRequest, JsonRpcProvider, Wallet, formatUnits, getAddress, parseEther } from 'ethers';
import fixture from '../../../docs/fixture-evidence.json';
import proof from '../../../docs/transaction-evidence.json';
import { checkoutAvailability, maxPaymentCredits, merchantCap, paymentAmount, type CheckoutSnapshot } from '../../../lib/demo-limits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const request = new FetchRequest(fixture.rpcUrl);
request.timeout = 10000;
request.setThrottleParams({ maxAttempts: 1 });
const provider = new JsonRpcProvider(request, fixture.chainId, { staticNetwork: true, cacheTimeout: -1 });
const token = new Contract(fixture.cva, [
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
  'event Transfer(address indexed from,address indexed to,uint256 value)',
], provider);
const maxMerchantBalance = merchantCap(proof.observations.afterPayment.merchant, fixture.decimals);
let paymentInFlight = false;

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' } });
}

function signer() {
  const secret = process.env.CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY;
  if (!secret) return null;
  const wallet = new Wallet(secret, provider);
  if (getAddress(wallet.address) !== getAddress(fixture.roles.participant.address)) throw new Error('Prepared test-wallet configuration does not match the public fixture');
  return wallet;
}

async function checkoutSnapshot(): Promise<{ wallet: Wallet; balances: CheckoutSnapshot }> {
  const wallet = signer();
  if (!wallet) throw new Error('Prepared test checkout is not configured');
  const last = await provider.getTransaction(proof.transactions.rejection.hash);
  const receipt = await provider.getTransactionReceipt(proof.transactions.rejection.hash);
  if (!last || !receipt || receipt.status !== 0 || getAddress(last.from) !== getAddress(wallet.address) || getAddress(last.to!) !== getAddress(fixture.cva)) throw new Error('Cannot establish the last approved test-wallet nonce');
  const firstLiveNonce = last.nonce + 1;
  const [chain, symbol, participantBalance, merchantBalance, nativeBalance, latestNonce, pendingNonce] = await Promise.all([
    provider.send('eth_chainId', []), token.symbol(), token.balanceOf(wallet.address),
    token.balanceOf(fixture.roles.merchant.address), provider.getBalance(wallet.address),
    provider.getTransactionCount(wallet.address, 'latest'), provider.getTransactionCount(wallet.address, 'pending'),
  ]);
  if (Number(chain) !== fixture.chainId || symbol !== fixture.symbol) throw new Error('Wrong sandbox network or token');
  return { wallet, balances: { participantBalance, merchantBalance, nativeBalance, latestNonce, pendingNonce, firstLiveNonce, merchantCap: maxMerchantBalance } };
}

async function receiptResponse(hash: string) {
  if (!/^0x[\da-f]{64}$/i.test(hash)) return json({ error: 'Valid transaction hash required.' }, 400);
  const [transaction, receipt] = await Promise.all([provider.getTransaction(hash), provider.getTransactionReceipt(hash)]);
  if (!transaction) return json({ status: 'unknown', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'Transaction could not be located yet.' }, 202);
  const call = token.interface.parseTransaction({ data: transaction.data });
  if (getAddress(transaction.from) !== getAddress(fixture.roles.participant.address) || !transaction.to || getAddress(transaction.to) !== getAddress(fixture.cva) || transaction.chainId !== BigInt(fixture.chainId) || call?.name !== 'transfer' || getAddress(call.args[0]) !== getAddress(fixture.roles.merchant.address) || call.args[1] < paymentAmount('1')! || call.args[1] > paymentAmount('5')!) return json({ error: 'This is not a bounded prepared-wallet payment to Corner Table.' }, 400);
  if (!receipt) return json({ status: 'pending', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'The actual transaction is still awaiting confirmation.' }, 202);
  if (receipt.status !== 1) return json({ status: 'reverted', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, block: receipt.blockNumber, message: 'The actual token transfer reverted. No payment is claimed.' }, 422);
  const moved = receipt.logs.some(log => {
    if (getAddress(log.address) !== getAddress(fixture.cva)) return false;
    try {
      const event = token.interface.parseLog({ topics: [...log.topics], data: log.data });
      return event?.name === 'Transfer' && getAddress(event.args[0]) === getAddress(fixture.roles.participant.address) && getAddress(event.args[1]) === getAddress(fixture.roles.merchant.address) && event.args[2] === call.args[1];
    } catch { return false; }
  });
  if (!moved) return json({ status: 'unconfirmed', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'A successful receipt exists, but the matching transfer event could not be verified.' }, 202);
  return json({ status: 'confirmed', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, amount: formatUnits(call.args[1], fixture.decimals), block: receipt.blockNumber, message: 'Actual payment receipt and token Transfer event verified.' });
}

export async function GET(request: Request) {
  const receiptHash = new URL(request.url).searchParams.get('receipt');
  if (receiptHash) {
    try { return await receiptResponse(receiptHash); }
    catch { return json({ error: 'Receipt verification is currently unavailable. No payment outcome is assumed.' }, 503); }
  }
  if (!process.env.CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY) return json({ available: false, reason: 'Live checkout is not configured.', remaining: 0, minimum: 1, maximum: maxPaymentCredits });
  try {
    const { balances } = await checkoutSnapshot();
    return json({ ...checkoutAvailability(balances), minimum: 1, maximum: maxPaymentCredits, merchant: fixture.roles.merchant.address, signing: 'Prepared test wallet, server-side; no user wallet or issuer key.' });
  } catch {
    return json({ available: false, reason: 'Checkout status could not be confirmed; inspect the recorded receipts instead.', remaining: 0 }, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Use the City Money sandbox to authorize this test action.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON amount required.' }, 415);
  let amount: bigint | null;
  try {
    const body = await request.text();
    if (body.length > 80) return json({ error: 'Test payment input is too long.' }, 413);
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed !== 'object' || !parsed || Array.isArray(parsed) || Object.keys(parsed).length !== 1) return json({ error: 'Only a test-credit amount is accepted.' }, 400);
    amount = paymentAmount((parsed as { amount?: unknown }).amount, fixture.decimals);
  } catch {
    return json({ error: 'Invalid test payment input.' }, 400);
  }
  if (amount === null) return json({ error: 'Choose a whole amount from 1 to 5 test credits.' }, 400);
  if (paymentInFlight) return json({ error: 'A test checkout is already being submitted. Refresh before trying again.' }, 409);
  paymentInFlight = true;
  let hash: string | undefined;
  try {
    const { wallet, balances } = await checkoutSnapshot();
    const permission = checkoutAvailability(balances, amount);
    if (!permission.available) return json({ error: permission.reason, remaining: permission.remaining }, 409);
    const safeToken = token.connect(wallet) as Contract;
    const allowed = await safeToken.transfer.staticCall(fixture.roles.merchant.address, amount);
    if (allowed !== true) return json({ error: 'The actual CVA did not authorize this merchant transfer. Nothing was submitted.' }, 409);
    const estimate: bigint = await safeToken.transfer.estimateGas(fixture.roles.merchant.address, amount);
    const gasLimit = (estimate * 10750n + 9999n) / 10000n;
    const fee = await provider.getFeeData();
    if (gasLimit > 300000n || fee.maxFeePerGas == null || fee.maxPriorityFeePerGas == null || gasLimit * fee.maxFeePerGas > parseEther('0.06') || balances.nativeBalance < gasLimit * fee.maxFeePerGas) return json({ error: 'Safe testnet gas limits cannot be confirmed. No payment was sent.' }, 503);
    const tx = await wallet.sendTransaction({
      to: fixture.cva,
      data: token.interface.encodeFunctionData('transfer', [fixture.roles.merchant.address, amount]),
      nonce: balances.latestNonce,
      chainId: fixture.chainId,
      gasLimit,
      maxFeePerGas: fee.maxFeePerGas,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    });
    hash = tx.hash;
    const receipt = await provider.waitForTransaction(hash, 1, 35000);
    if (!receipt) return json({ status: 'pending', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'Transaction submitted but not yet confirmed. Inspect the explorer before trying again.' }, 202);
    if (receipt.status !== 1) return json({ status: 'reverted', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'The actual token transfer reverted. No payment is claimed.' }, 422);
    const [participantAfter, merchantAfter] = await Promise.all([
      token.balanceOf(wallet.address, { blockTag: receipt.blockNumber }),
      token.balanceOf(fixture.roles.merchant.address, { blockTag: receipt.blockNumber }),
    ]);
    if (participantAfter !== balances.participantBalance - amount || merchantAfter !== balances.merchantBalance + amount) return json({ status: 'unconfirmed', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'Receipt succeeded, but exact balance changes could not be reconciled. Inspect the explorer.' }, 202);
    return json({ status: 'confirmed', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, block: receipt.blockNumber, amount: formatUnits(amount, fixture.decimals), balances: { participant: formatUnits(participantAfter, fixture.decimals), merchant: formatUnits(merchantAfter, fixture.decimals) }, message: 'Actual Cleanverse CVA payment confirmed on Monad testnet.' });
  } catch {
    if (hash) return json({ status: 'unknown', hash, explorer: `https://testnet.monadscan.com/tx/${hash}`, message: 'The transaction was submitted, but confirmation is unavailable. Inspect the explorer before retrying.' }, 202);
    return json({ error: 'Payment could not be verified or submitted. Refresh both balance and checkout status before trying again.' }, 503);
  } finally {
    paymentInFlight = false;
  }
}
