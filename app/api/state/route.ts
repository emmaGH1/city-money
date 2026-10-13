import { Contract, FetchRequest, JsonRpcProvider, formatEther, formatUnits } from 'ethers';
import fixture from '../../../docs/fixture-evidence.json';

export const dynamic = 'force-dynamic';

const rpcRequest = new FetchRequest('https://testnet-rpc.monad.xyz');
rpcRequest.timeout = 10000;
rpcRequest.setThrottleParams({ maxAttempts: 1 });
const provider = new JsonRpcProvider(rpcRequest, fixture.chainId, { staticNetwork: true });
const token = new Contract(fixture.cva, [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
], provider);

export async function GET() {
  try {
    const [block, supply, symbol, participant, merchant, outsider, participantGas, adminGas] = await Promise.all([
      provider.getBlockNumber(),
      token.totalSupply(),
      token.symbol(),
      token.balanceOf(fixture.roles.participant.address),
      token.balanceOf(fixture.roles.merchant.address),
      token.balanceOf(fixture.roles.outsider.address),
      provider.getBalance(fixture.roles.participant.address),
      provider.getBalance('0x9E6BeB50643F0598303B040fb6F1086621252421'),
    ]);

    if (symbol !== fixture.symbol) throw new Error('Unexpected CVA');

    return Response.json({
      verifiedAt: new Date().toISOString(),
      block,
      contract: fixture.cva,
      symbol,
      supply: formatUnits(supply, fixture.decimals),
      balances: {
        participant: formatUnits(participant, fixture.decimals),
        merchant: formatUnits(merchant, fixture.decimals),
        outsider: formatUnits(outsider, fixture.decimals),
      },
      gas: { participant: formatEther(participantGas), admin: formatEther(adminGas) },
      wallets: Object.fromEntries(Object.entries(fixture.roles).map(([role, value]) => [role, value.address])),
      eligibility: {
        participant: fixture.roles.participant.cvi.subTier,
        merchant: fixture.roles.merchant.cvi.subTier,
        outsider: fixture.roles.outsider.cvi.subTier,
        minimum: fixture.programMinimumSubTier,
      },
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch {
    return Response.json({ error: 'Monad testnet balance check is unavailable. No payment state can be confirmed.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
