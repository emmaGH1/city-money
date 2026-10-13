# City Money

A fictional civic-voucher sandbox on Monad testnet, using a **genuine issued Cleanverse CVA**. The five-section landing and workspace read live balances and link real mint/payment/rejection receipts. The approved **bounded interactive checkout** uses only a prepared participant test-wallet key held as a server secret; an actual 1-credit browser payment has been confirmed on-chain.

**Live site:** https://city-money.vercel.app · **[2:47 founder-led product film](https://city-money-demo.vercel.app)** with synchronized subtitles and Emma's voice · [judge route and limitations](docs/DEMO.md). Checkout was browser-tested on desktop and 390px/320px widths, including confirmed payment, exact-byte recovery after an interrupted response, storage refusal without broadcast, focus, offline/recovery and reduced motion. No login or Vercel account is needed. The capped public allowance is shared: 18 slots remained immediately after filming, not 18 per visitor. Always read live availability.

[Download synchronized SRT subtitles](https://city-money-demo.vercel.app/city-money.srt). On phones, use the film page's fullscreen control and landscape orientation; the wide product walkthrough is small in a 320px inline player.

CVA: [`0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D`](https://testnet.monadscan.com/address/0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D). [Issuance](https://testnet.monadscan.com/tx/0xea8ee6b36e7a4abfd17dd0b6e55a4f1e7e9ab6f21c65f2c7c0160485f8dc8d23) · [20-credit mint](https://testnet.monadscan.com/tx/0xd8f0bc7a9916ffb62d6ae4cb8bc05a90dae24c83421b7f5651f553aed93d644e) · [5-credit merchant payment](https://testnet.monadscan.com/tx/0xe7a0b0f665acfa70d04b4e58f0abb85b2cf14faf102b3074afe4a36709b68f9e) · [mined outsider rejection](https://testnet.monadscan.com/tx/0xd0e56e57f39f58fd114f894e3bbbb74afa00853d424bc852760480fdd7f66c77). Status of the last receipt is **0**; its transaction trace, real CVI lookup, rule values and unchanged balances are recorded in [the transaction evidence](docs/transaction-evidence.json). On Monad, gas is charged by the declared *limit*, so a reverted receipt showing the full gas limit is not by itself an out-of-gas diagnosis.

Actual proven journey: participant received 20 test credits → paid 5 to the prepared merchant → sending 1 to the lower-level test identity reverted in the Cleanverse policy verifier. Balances after that rejected transfer remained 15 / 5 / 0; supply stayed 20. The subsequent [actual 1-credit browser checkout](https://testnet.monadscan.com/tx/0xf7867b4baf3d41363f98b916c0a67c803bb518018ec88e41b420e0dba5c2acad) succeeded in block 70763567: participant 15→14, merchant 5→6, outsider 0, supply 20. Historical block reads and the exact Transfer event independently confirmed that delta. The fresh outsider button separately returned policy rejection in **eth_call**, without broadcasting. No real government, money, residency verification or automatic token-expiry claims.

The newer judge allowance was privately funded with 105 additional test-only credits (total supply 125); this did not replay the original 20-credit allocation. During founder filming a fresh [one-credit checkout](https://testnet.monadscan.com/tx/0x15466231d1cb4c6953a7f447a9e63d7eabad88144682d1e3ba0b7e31c16c37db) succeeded in block 70799023, participant 117→116 and merchant 8→9, one exact Transfer event. Two earlier 1-credit QA payments separately proved normal confirmation and exact-byte interruption recovery. The live boundary comparison still checks level 1 against the configured 69 threshold without broadcasting; the historical mined failure remains independently inspectable.

## Local development

Requires Node.js 24. Read-only UI and balance routes need no private credentials. Checkout additionally needs the prepared participant key as `CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY` on the server; without it checkout is unavailable. Private operator/probe commands require securely provisioned `CLEANVERSE_SANDBOX_API_ID_NEW` / `CLEANVERSE_SANDBOX_API_KEY_NEW` and the existing encrypted wallet vault.

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

The probe stores test wallets encrypted outside this repository. The bounded `cva-actions.mjs` harness performs on-chain actions from those same wallets after querying active Cleanverse CVIs and rule state. It records public transaction evidence, never wallet keys. API calls use the Cleanverse UAT environment only. The public checkout uses `CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY` server-side, never an issuer/API key. Only the fixed Corner Table receiver and whole 1–5 CITYCM amounts are accepted. There are **24 total live nonce slots after the historical rejection**, including the earlier one-credit checkout. Public signing permits nonces 2–23; nonces24–25 require protected recording access. The participant is separately funded with105 additional test credits and native gas capped at1.44 test MON. The original20-credit allocation remains historical, not an allocation repeated on arrival. At least one credit is retained, merchant balance is capped at125, and each signed transaction is capped at0.06 test MON and300,000 gas. Preparation returns signed transaction bytes and their hash; the browser persists these before broadcasting. Interrupted submissions may recheck or resend **the exact same signed bytes**, never silently sign a fresh payment. Monad’s nonce enforces one execution across concurrent serverless instances; a competing transaction using the nonce is reported as superseded, not success. Successful immediate and recovered receipts must match the exact token Transfer event. No issuer key or Cleanverse credential is deployed. No public mint, reset or identity administration exists. The outsider button is **read-only** and cannot spend gas or broadcast; the genuine mined failure remains separately linked. Registration labels are snapshots; actual transfers run the CVA policy. Never commit credentials or print private keys. On a fresh machine, securely restore the existing vault before running `probe wallets`, or it creates unrelated wallets. Read [the handoff](docs/HANDOFF.md).

The initial deployment had deliberately untested exhaustion/concurrency/interruption cases. The revised source adds controlled-provider tests for these failure classes, signed-payload validation and exact event verification. Check docs/HANDOFF.md for the latest browser validation; mocked provider tests do not prove public RPC behavior or real cross-instance contention. No public reset; use real historical receipts and the read-only boundary if the shared cap is exhausted.

AI assistance: developed with Devin, with scope and design direction approved by Emma. The prototype is not production-ready or regulatory advice. No merge or hackathon submission has been made.

License: MIT.
