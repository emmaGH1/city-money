# City Money

A fictional civic-voucher sandbox on Monad testnet, using a **genuine issued Cleanverse CVA**. The five-section landing and focused workspace read live balances. The underlying receive → spend → reject sequence has now been **executed with real Monad testnet receipts**; the UI still needs to display those new receipts and enable a safely bounded interactive checkout. Until that update is deployed, its older labels may still say payment is pending.

CVA: [`0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D`](https://testnet.monadscan.com/address/0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D). [Issuance](https://testnet.monadscan.com/tx/0xea8ee6b36e7a4abfd17dd0b6e55a4f1e7e9ab6f21c65f2c7c0160485f8dc8d23) · [20-credit mint](https://testnet.monadscan.com/tx/0xd8f0bc7a9916ffb62d6ae4cb8bc05a90dae24c83421b7f5651f553aed93d644e) · [5-credit merchant payment](https://testnet.monadscan.com/tx/0xe7a0b0f665acfa70d04b4e58f0abb85b2cf14faf102b3074afe4a36709b68f9e) · [mined outsider rejection](https://testnet.monadscan.com/tx/0xd0e56e57f39f58fd114f894e3bbbb74afa00853d424bc852760480fdd7f66c77). Status of the last receipt is **0**; its transaction trace, real CVI lookup, rule values and unchanged balances are recorded in [the transaction evidence](docs/transaction-evidence.json). On Monad, gas is charged by the declared *limit*, so a reverted receipt showing the full gas limit is not by itself an out-of-gas diagnosis.

Actual proven journey: participant received 20 test credits → paid 5 to the prepared merchant → sending 1 to the lower-level test identity reverted in the Cleanverse policy verifier. Balances after the rejected transfer remained 15 / 5 / 0; supply stayed 20. No real government, money, residency verification or automatic token-expiry claims.

## Local development

Requires Node.js 24 and securely provisioned `CLEANVERSE_SANDBOX_API_ID_NEW` / `CLEANVERSE_SANDBOX_API_KEY_NEW`.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
npm audit --audit-level=moderate
npm run probe -- wallets
node scripts/cva-actions.mjs status
```

The probe stores test wallets encrypted outside this repository. The bounded `cva-actions.mjs` harness performs on-chain actions from those same wallets after querying active Cleanverse CVIs and rule state. It records public transaction evidence, never wallet keys. API calls use the Cleanverse UAT environment only. No public signing or issuer-administration routes exist at this checkpoint. The web API reads token balances from Monad; identity levels shown in the UI are **registration-fixture snapshots**, not a live CVI query or residency proof. Never commit credentials or print private keys. Read [the handoff](docs/HANDOFF.md) before continuing. On a fresh machine, restore the existing encrypted wallet vault securely before running `probe wallets`; otherwise it creates unrelated test wallets.

AI assistance: developed with Devin, with scope and design direction approved by Emma. The prototype is not production-ready or regulatory advice.

License: MIT.
