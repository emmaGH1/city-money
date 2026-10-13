import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Wallet } from 'ethers';

export const API_BASE = 'https://uatapi.cleanverse.com/api/cooperate';
export function encryptBody(body, apiKey) {
  const key = Buffer.from(apiKey, 'base64');
  if (key.length !== 32) throw new Error('API encryption key must decode to 32 bytes');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16));
  return { data: Buffer.concat([cipher.update(JSON.stringify(body), 'utf8'), cipher.final()]).toString('base64') };
}

function walletKey(apiKey) {
  return Buffer.from(crypto.hkdfSync('sha256', Buffer.from(apiKey, 'base64'), 'city-money-local-vault', 'wallet-v1', 32));
}

export function loadOrCreateWallets(apiKey, directory = path.join(os.homedir(), '.city-money')) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, 'wallets.enc');
  const key = walletKey(apiKey);
  if (fs.existsSync(file)) {
    const { iv, tag, ciphertext } = JSON.parse(fs.readFileSync(file, 'utf8'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]).toString('utf8'));
  }
  const wallets = Object.fromEntries(['admin', 'participant', 'merchant', 'outsider'].map(role => {
    const wallet = Wallet.createRandom();
    return [role, { address: wallet.address, privateKey: wallet.privateKey }];
  }));
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(wallets), 'utf8'), cipher.final()]);
  fs.writeFileSync(file, JSON.stringify({ iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), ciphertext: ciphertext.toString('hex') }), { mode: 0o600, flag: 'wx' });
  return wallets;
}

export async function apiRequest(route, { method = 'POST', body, encrypted = false } = {}) {
  const id = process.env.CLEANVERSE_SANDBOX_API_ID_NEW;
  const key = process.env.CLEANVERSE_SANDBOX_API_KEY_NEW;
  if (!id || !key) throw new Error('Sandbox credentials are required');
  const response = await fetch(`${API_BASE}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'api-id': id, 'X-Request-ID': crypto.randomUUID() },
    ...(body === undefined ? {} : { body: JSON.stringify(encrypted ? encryptBody(body, key) : body) }),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  return { http: response.status, ...result };
}

async function main() {
  const [command, requestId] = process.argv.slice(2);
  if (!['wallets', 'launch', 'status'].includes(command)) throw new Error('Usage: npm run probe -- wallets|launch|status [requestId]');
  const wallets = loadOrCreateWallets(process.env.CLEANVERSE_SANDBOX_API_KEY_NEW);
  if (command === 'wallets') {
    console.log(JSON.stringify(Object.fromEntries(Object.entries(wallets).map(([role, wallet]) => [role, wallet.address])), null, 2));
    return;
  }
  if (command === 'status') {
    if (!requestId || !/^[A-Za-z0-9]+$/.test(requestId)) throw new Error('Valid requestId required');
    console.log(JSON.stringify(await apiRequest(`/atoken/query_apply_status/${requestId}`, { method: 'GET' }), null, 2));
    return;
  }
  const result = await apiRequest('/atoken/launch', { encrypted: true, body: {
    chain: 'monad', token_name: 'City Money Sandbox Credits', token_symbol: 'CITYCM', decimals: 6,
    admin_address: wallets.admin.address,
    rule: { allowed_sub_group: 'CM' },
    icon: 'https://raw.githubusercontent.com/emmaGH1/city-money/devin/1791912000-city-money/public/icon.svg',
  } });
  const state = { checkedAt: new Date().toISOString(), approach: 'documented encrypted launch API', result };
  fs.writeFileSync(path.join(os.homedir(), '.city-money', 'issuance.json'), JSON.stringify(state, null, 2));
  console.log(JSON.stringify(state, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
