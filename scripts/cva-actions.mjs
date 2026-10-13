import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AbiCoder, Contract, FetchRequest, JsonRpcProvider, Wallet, formatEther, formatUnits, getAddress, parseEther, parseUnits } from 'ethers';
import { apiRequest, loadOrCreateWallets } from './cleanverse-probe.mjs';

export const ABI = [
  'function symbol() view returns (string)', 'function decimals() view returns (uint8)',
  'function MINTER_ROLE() view returns (bytes32)', 'function hasRole(bytes32,address) view returns (bool)',
  'function grantRole(bytes32,address)', 'function mint(address,uint256)',
  'function totalSupply() view returns (uint256)', 'function balanceOf(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
  'error ERC20InsufficientBalance(address,uint256,uint256)', 'error ERC20InvalidReceiver(address)',
];

export function paymentUnits(value, decimals = 6) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,6})?$/.test(value)) throw new Error('Use a positive decimal amount with at most six places');
  const amount = parseUnits(value, decimals);
  if (amount <= 0n || amount > parseUnits('5', decimals)) throw new Error('Test payment must be greater than zero and no more than 5 credits');
  return amount;
}

export function sameTokenBalances(before, after) {
  return ['supply', 'participant', 'merchant', 'outsider'].every(key => typeof before?.[key] === 'string' && /^\d+(?:\.\d+)?$/.test(before[key]) && before[key] === after?.[key]);
}

export function decodePolicyWords(data) {
  if (typeof data !== 'string' || !/^0x[\da-f]{200}$/i.test(data)) throw new Error('Expected a selector followed by exactly three ABI-encoded words');
  const [recipient, threshold, identityLevel] = AbiCoder.defaultAbiCoder().decode(['address', 'uint256', 'uint256'], `0x${data.slice(10)}`);
  return { selector: data.slice(0, 10), recipient, threshold: Number(threshold), identityLevel: Number(identityLevel) };
}

async function main() {
  const [command, value = '5'] = process.argv.slice(2);
  if (!['status', 'prepare', 'pay', 'reject'].includes(command)) throw new Error('Usage: node scripts/cva-actions.mjs status|prepare|pay [credits]|reject');
  const fixture = JSON.parse(fs.readFileSync(new URL('../docs/fixture-evidence.json', import.meta.url), 'utf8'));
  const vault = path.join(os.homedir(), '.city-money', 'wallets.enc');
  if (!fs.existsSync(vault)) throw new Error('Restore the existing encrypted wallet vault; do not create new wallets for this CVA');
  if (!process.env.CLEANVERSE_SANDBOX_API_KEY_NEW) throw new Error('Securely provision the sandbox encryption secret');
  const wallets = loadOrCreateWallets(process.env.CLEANVERSE_SANDBOX_API_KEY_NEW);
  if (getAddress(wallets.admin.address) !== getAddress(fixture.adminAddress)) throw new Error('Wrong admin vault for this issued CVA');
  for (const role of ['participant', 'merchant', 'outsider']) {
    if (getAddress(wallets[role].address) !== getAddress(fixture.roles[role].address)) throw new Error(`Wrong ${role} vault for these fixtures`);
  }
  const request = new FetchRequest(fixture.rpcUrl);
  request.timeout = 15000;
  request.setThrottleParams({ maxAttempts: 1 });
  const provider = new JsonRpcProvider(request, fixture.chainId, { staticNetwork: true, cacheTimeout: -1 });
  if (Number(await provider.send('eth_chainId', [])) !== 10143 || fixture.chainId !== 10143) throw new Error('Only Monad testnet chain 10143 is authorized');
  const token = new Contract(fixture.cva, ABI, provider);
  if (await token.symbol() !== fixture.symbol || Number(await token.decimals()) !== fixture.decimals) throw new Error('Unexpected token metadata');
  const file = new URL('../docs/transaction-evidence.json', import.meta.url);
  const evidence = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { chainId: fixture.chainId, contract: fixture.cva, transactions: {}, observations: {} };
  if (evidence.chainId !== fixture.chainId || getAddress(evidence.contract) !== getAddress(fixture.cva)) throw new Error('Evidence belongs to another token');
  function save() { fs.writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`); }
  async function snapshot(blockTag = 'latest') {
    const [supply, participant, merchant, outsider] = await Promise.all([
      token.totalSupply({ blockTag }), ...['participant', 'merchant', 'outsider'].map(role => token.balanceOf(fixture.roles[role].address, { blockTag })),
    ]);
    return { supply: formatUnits(supply, fixture.decimals), participant: formatUnits(participant, fixture.decimals), merchant: formatUnits(merchant, fixture.decimals), outsider: formatUnits(outsider, fixture.decimals) };
  }
  async function fees(gasLimit) {
    if (gasLimit > 400000n) throw new Error('Gas limit exceeds the bounded sandbox allowance');
    const fee = await provider.getFeeData();
    if (fee.maxFeePerGas == null || fee.maxPriorityFeePerGas == null) throw new Error('Cannot confirm testnet fee data');
    if (gasLimit * fee.maxFeePerGas > parseEther('0.1')) throw new Error('Maximum fee exceeds 0.1 test MON for this operation');
    return { gasLimit, maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas, chainId: fixture.chainId };
  }
  async function mined(name, send, expectedStatus, details = {}) {
    const existing = evidence.transactions[name];
    if (existing && Object.keys(details).some(key => existing[key] !== details[key])) throw new Error(`Existing ${name} inputs differ; inspect the recorded transaction instead of overwriting it`);
    let hash = existing?.hash;
    if (!hash) {
      const tx = await send(); hash = tx.hash;
      evidence.transactions[name] = { hash, ...details, submittedAt: new Date().toISOString(), status: null };
      save(); console.log(JSON.stringify({ operation: name, submitted: hash }));
    }
    const receipt = await provider.waitForTransaction(hash, 1, 90000);
    if (!receipt) throw new Error(`${name} remains pending; inspect the recorded hash, never rebroadcast blindly`);
    evidence.transactions[name] = { ...evidence.transactions[name], status: receipt.status, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString(), confirmedAt: new Date().toISOString() };
    save(); console.log(JSON.stringify({ operation: name, hash, status: receipt.status, block: receipt.blockNumber }));
    if (receipt.status !== expectedStatus) throw new Error(`${name} has unexpected receipt status ${receipt.status}`);
    return receipt;
  }
  async function identities() {
    const result = {};
    for (const role of ['participant', 'merchant', 'outsider']) {
      const response = await apiRequest('/query_apass', { body: { chain: 'monad', address: fixture.roles[role].address } });
      const cvi = response.data;
      if (response.http !== 200 || response.code !== '0000' || !cvi || cvi.status !== 1 || cvi.expirationTime <= Date.now() / 1000) throw new Error(`Cannot confirm an active, unexpired sandbox ${role} CVI`);
      result[role] = { subTier: cvi.subTier, status: cvi.status, expirationTime: cvi.expirationTime };
    }
    const response = await apiRequest('/atoken/rules', { body: { chain: 'monad', atoken_address: fixture.cva } });
    const rules = response.data?.rules;
    if (response.code !== '0000' || !Array.isArray(rules) || rules.length !== 1 || rules[0].min_sub_tier !== fixture.programMinimumSubTier || rules[0].allowed_group || rules[0].allowed_sub_group || rules[0].min_tier || rules[0].is_black_list || rules[0].countries?.length) throw new Error('Cannot confirm the intended sole sub-tier rule');
    if (result.participant.subTier <= fixture.programMinimumSubTier || result.merchant.subTier <= fixture.programMinimumSubTier || result.outsider.subTier >= fixture.programMinimumSubTier) throw new Error('Fixture levels no longer give unambiguous positive and negative cases');
    evidence.observations.identities = { checkedAt: new Date().toISOString(), source: 'Cleanverse sandbox Query CVI API', roles: result, rule: { min_sub_tier: rules[0].min_sub_tier } };
    save(); return result;
  }
  const admin = new Wallet(wallets.admin.privateKey, provider);
  const participant = new Wallet(wallets.participant.privateKey, provider);
  const adminToken = token.connect(admin);
  const participantToken = token.connect(participant);
  if (getAddress(admin.address) !== getAddress(fixture.adminAddress) || getAddress(participant.address) !== getAddress(fixture.roles.participant.address)) throw new Error('Signing keys do not match the approved test-wallet addresses');
  if (command === 'status') {
    console.log(JSON.stringify({ checkedAt: new Date().toISOString(), balances: await snapshot(), adminMON: formatEther(await provider.getBalance(admin.address)), participantMON: formatEther(await provider.getBalance(participant.address)), adminIsMinter: await token.hasRole(await token.MINTER_ROLE(), admin.address) }, null, 2)); return;
  }
  await identities();
  if (command === 'prepare') {
    const role = await token.MINTER_ROLE();
    if (!await token.hasRole(role, admin.address)) {
      const options = await fees(150000n);
      await mined('grantMintRole', () => adminToken.grantRole(role, admin.address, options), 1, { role, grantee: admin.address });
    }
    if (!await token.hasRole(role, admin.address)) throw new Error('Minter role was not granted');
    const supply = await token.totalSupply();
    if (supply === 0n) {
      const amount = parseUnits('20', fixture.decimals);
      await adminToken.mint.staticCall(participant.address, amount);
      const options = await fees(300000n);
      await mined('mint', () => adminToken.mint(participant.address, amount, options), 1, { amount: '20.0', to: participant.address });
    } else if (supply !== parseUnits('20', fixture.decimals)) throw new Error('Existing supply is not the bounded 20-credit test allocation');
    if (await provider.getBalance(participant.address) < parseEther('0.05')) {
      const options = await fees(21000n);
      await mined('participantGas', () => admin.sendTransaction({ to: participant.address, value: parseEther('0.25'), ...options }), 1, { amountMON: '0.25', to: participant.address });
    }
    evidence.observations.afterPrepare = await snapshot(); save();
    console.log(JSON.stringify({ prepared: evidence.observations.afterPrepare })); return;
  }
  if (command === 'pay') {
    const amount = paymentUnits(value, fixture.decimals);
    if (await token.balanceOf(participant.address) < amount) throw new Error('Insufficient actual participant credits');
    await participantToken.transfer.staticCall(fixture.roles.merchant.address, amount);
    const options = await fees(300000n);
    if (!evidence.transactions.payment) { evidence.observations.beforePayment = await snapshot(); save(); }
    const receipt = await mined('payment', () => participantToken.transfer(fixture.roles.merchant.address, amount, options), 1, { amount: formatUnits(amount, fixture.decimals), from: participant.address, to: fixture.roles.merchant.address });
    evidence.observations.afterPayment = await snapshot(receipt.blockNumber); save();
    console.log(JSON.stringify({ paid: evidence.observations.afterPayment })); return;
  }
  const amount = parseUnits('1', fixture.decimals);
  if (await token.balanceOf(participant.address) < amount) throw new Error('Funded policy proof requires at least 1 actual credit');
  await participantToken.transfer.staticCall(fixture.roles.merchant.address, amount);
  let revertData;
  try { await participantToken.transfer.staticCall(fixture.roles.outsider.address, amount); }
  catch (error) { revertData = error.data; }
  const words = decodePolicyWords(revertData);
  if (getAddress(words.recipient) !== getAddress(fixture.roles.outsider.address) || words.threshold !== fixture.programMinimumSubTier || words.identityLevel !== evidence.observations.identities.roles.outsider.subTier) throw new Error('Outsider revert does not match the recorded recipient and level rule');
  const before = evidence.observations.rejectionPreflight?.before ?? await snapshot();
  const options = await fees(300000n);
  if (!evidence.observations.rejectionPreflight) evidence.observations.rejectionPreflight = { amount: '1.0', from: participant.address, to: fixture.roles.outsider.address, revertData, eligibleMerchantSameAmount: true, before, checkedAt: new Date().toISOString() };
  save();
  const receipt = await mined('rejection', () => participant.sendTransaction({ to: fixture.cva, data: token.interface.encodeFunctionData('transfer', [fixture.roles.outsider.address, amount]), ...options }), 0, { amount: '1.0', from: participant.address, to: fixture.roles.outsider.address });
  const trace = await provider.send('debug_traceTransaction', [receipt.hash, { tracer: 'callTracer' }]);
  if (trace.error !== 'execution reverted' || trace.output?.toLowerCase() !== revertData.toLowerCase()) throw new Error('Failed transaction trace does not confirm the same contract revert as the preflight');
  function calls(node) { return [node, ...(node.calls ?? []).flatMap(calls)]; }
  const nodes = calls(trace);
  const outsiderCviWasRead = nodes.some(node => node.to?.toLowerCase() === fixture.cvi.toLowerCase() && node.input?.toLowerCase().includes(fixture.roles.outsider.address.slice(2).toLowerCase()) && node.type === 'STATICCALL');
  const policyVerifierReverted = nodes.some(node => node.to?.toLowerCase() !== fixture.cva.toLowerCase() && node.error === 'execution reverted' && node.output?.toLowerCase() === revertData.toLowerCase());
  if (!outsiderCviWasRead || !policyVerifierReverted) throw new Error('Failed trace did not show the CVI lookup and policy-verifier revert');
  const after = await snapshot(receipt.blockNumber);
  if (!sameTokenBalances(before, after)) throw new Error('Token balances changed after the rejected transfer');
  evidence.observations.rejection = { before, after, balancesUnchanged: true, gasLimit: options.gasLimit.toString(), gasCharged: receipt.gasUsed.toString(), explanation: 'Monad charges the declared gas limit, including for reverted calls (docs.monad.xyz/developer-essentials/gas-pricing). Equality here is not evidence of out-of-gas.', trace: { error: trace.error, revertDataMatchesPreflight: true, outsiderCviWasRead, policyVerifierReverted }, decodedWords: words, classification: 'The issued CVA called its policy verifier, which queried the outsider CVI and reverted with recipient, configured threshold and observed level; same sender and amount passed merchant preflight.' };
  save(); console.log(JSON.stringify({ rejected: evidence.transactions.rejection, balancesUnchanged: true, decodedWords: words, traceVerified: true }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main().catch(error => { console.error(error.shortMessage || error.message); process.exitCode = 1; });
}
