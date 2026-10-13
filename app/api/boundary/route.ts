import { AbiCoder, Contract, FetchRequest, JsonRpcProvider, getAddress, parseUnits } from 'ethers';
import fixture from '../../../docs/fixture-evidence.json';
import proof from '../../../docs/transaction-evidence.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const request = new FetchRequest(fixture.rpcUrl);
request.timeout = 10000;
request.setThrottleParams({ maxAttempts: 1 });
const provider = new JsonRpcProvider(request, fixture.chainId, { staticNetwork: true });
const token = new Contract(fixture.cva, [
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
], provider);

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function GET() {
  try {
    if (Number(await provider.send('eth_chainId', [])) !== fixture.chainId || await token.symbol() !== fixture.symbol) throw new Error('Unexpected sandbox contract');
    const amount = parseUnits('1', fixture.decimals);
    const from = fixture.roles.participant.address;
    if (await token.balanceOf(from) < amount) return json({ result: 'unavailable', message: 'A funded participant balance is required to test the current policy.', minedWitness: proof.transactions.rejection.hash }, 409);
    const merchantAllowed = await token.transfer.staticCall(fixture.roles.merchant.address, amount, { from });
    if (merchantAllowed !== true) return json({ result: 'unconfirmed', message: 'The eligible merchant precondition could not be confirmed.', minedWitness: proof.transactions.rejection.hash }, 409);
    try {
      const outsiderAllowed = await token.transfer.staticCall(fixture.roles.outsider.address, amount, { from });
      return json({ result: outsiderAllowed ? 'allowed' : 'unconfirmed', message: outsiderAllowed ? 'The current contract did not reject this outsider in a read-only call; do not assume the historical boundary is still active.' : 'The read-only call returned false without a policy-revert reason.', minedWitness: proof.transactions.rejection.hash, method: 'eth_call — no transaction was broadcast' });
    } catch (error) {
      const data = error && typeof error === 'object' && 'data' in error ? (error as { data?: unknown }).data : null;
      if (typeof data !== 'string' || !/^0x[\da-f]{200}$/i.test(data)) return json({ result: 'unconfirmed', message: 'The contract reverted, but its policy reason could not be verified.', minedWitness: proof.transactions.rejection.hash, method: 'eth_call — no transaction was broadcast' }, 409);
      const [recipient, ruleValue, level] = AbiCoder.defaultAbiCoder().decode(['address', 'uint256', 'uint256'], `0x${data.slice(10)}`);
      const matches = data.slice(0, 10).toLowerCase() === proof.observations.rejection.decodedWords.selector && getAddress(recipient) === getAddress(fixture.roles.outsider.address) && ruleValue === BigInt(fixture.programMinimumSubTier) && level === BigInt(fixture.roles.outsider.cvi.subTier);
      if (!matches) return json({ result: 'unconfirmed', message: 'The current revert does not match the recorded level rule. No policy conclusion is claimed.', minedWitness: proof.transactions.rejection.hash, method: 'eth_call — no transaction was broadcast' }, 409);
      return json({ result: 'rejected', ruleValue: Number(ruleValue), identityLevel: Number(level), checkedAt: new Date().toISOString(), message: 'The actual Cleanverse CVA rejected this lower-level test recipient in a fresh read-only call.', minedWitness: proof.transactions.rejection.hash, method: 'eth_call — no transaction was broadcast' });
    }
  } catch {
    return json({ result: 'unavailable', message: 'A current contract policy check cannot be confirmed. Inspect the historical mined receipt instead.', minedWitness: proof.transactions.rejection.hash }, 503);
  }
}
