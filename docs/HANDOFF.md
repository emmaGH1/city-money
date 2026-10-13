# City Money — continuation checkpoint

Approved 2026-10-13 by Emma in https://app.devin.ai/sessions/5c64da2265ea4acb82bac690e99d67e2.

## Authorization

Unattended City Money build; initial no-code restriction lifted. Five-section landing, workspace and receipts. A+B: Cosmos-like spatial composition and Blank Street-like neighborhood warmth, with original artwork. Autonomous hero/workspace probe review and routine technical decisions permitted. Sandbox test identities, new test-only wallets, free faucet gas, one genuine Cleanverse CVA, minting and test transfers permitted. Regular feature-branch commits/pushes and handoffs; browser testing/recording and free public deployment permitted. External spend $0; testnet only. No merge or submission. Stop after two materially different failed issuance approaches; do not substitute a normal token or fabricated evidence.

## Scope and truth labels

One fictional opt-in civic-voucher program: receive test credits, pay an approved demo merchant, prove that an ineligible transfer is rejected by the actual Cleanverse token. No real money, government, residency verification, redemption or automatic token expiry claims. No public minting/identity-admin controls. Prepared accounts and server signing, if used, must be labelled.

## Current state

- Empty public repo cloned; feature branch `devin/1791912000-city-money`.
- Genuine City Money CVA issued on Monad testnet: `0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D`, symbol `CITYCM`, 6 decimals. Application `IA20261014011950500304` reached `ISSUED`; receipt success and admin ownership were confirmed over chain 10143 RPC. Issuance transaction: `0xea8ee6b36e7a4abfd17dd0b6e55a4f1e7e9ab6f21c65f2c7c0160485f8dc8d23`.
- First A+B design probe implemented: immersive original voucher/storefront landing hero, focused `/workspace`, and read-only `/api/state`. The API reads the genuine token's live supply/balances and test wallets' native gas. No public signing or minting endpoints. Landing is deliberately incomplete (hero + one explanation); five complete sections and receipts remain pending.
- New wallets are stored encrypted outside Git at `~/.city-money/wallets.enc`, derived from the replacement sandbox encryption secret. Never commit or print private keys.
- Vercel browser still redirects to login despite Emma's report of login completion. First CLI device authorization expired without approval; the saved `auth.json` has no token and CLI 63.1.2 reports `Logged out`. A fresh device link will be needed for a claimed project. CLI 63.1.2 has an official anonymous `deploy --temporary` option; if used, clearly label it temporary/unclaimed and verify its actual runtime, not a persistent account-hosted submission. Do not pass secrets in CLI args. Version 50.4.5 used for the initial login had a deprecated vulnerable tar dependency (not installed in the app).
- Three synthetic sandbox CVIs registered without real identity documents/bank data. Participant and merchant have issuer-assigned subTier 70; outsider has subTier 1. All have active CVIs and sandbox-assigned tier 20. Do not represent these as real KYC or residency.
- Requested subgroup `CM` was not allocated to this institution. That registration failed, then the supported subTier criterion succeeded. The unavailable subgroup rule was removed and the sole final CVA rule is `min_sub_tier: 69`. Program approval in this sandbox means a valid CVI satisfying this level threshold, not a unique institution/city allowlist. Another qualifying identity can satisfy it; production cohort isolation needs separately approved issuer permissions/policy design.
- Query Rules advertises encryption but its documented plaintext cURL works; encrypted read returns `10002 Missing required parameter: chain`. Launch, Generate CVI and Add/Remove Rule genuinely accept documented encryption. Do not conclude the encryption key is invalid; launch succeeded with it.
- Public fixture evidence is in `docs/fixture-evidence.json`; it contains only synthetic identities' public state and actual registration hashes. No mint or payment/rejection has been established yet.
- Admin holds DEFAULT_ADMIN_ROLE, not yet MINTER_ROLE. All four test wallets had 0 native MON at last check. Both free gas attempts failed: official Monad faucet Cloudflare verification failed; QuickNode demanded ETH mainnet balance despite its contradictory public FAQ. No further faucet retry, no real money. Emma was asked to send 1 test MON on chain 10143 to `0x9E6BeB50643F0598303B040fb6F1086621252421`.
- Zero-value `eth_call` preflight from participant to merchant returned true; the same call to outsider reverted with an as-yet undecoded custom error. These are simulations, not mined payments/rejections. Real minting/payment/rejection receipts remain required. Actual CVA total supply and participant balance remain 0.

## Setup and secrets

Node 24, `npm ci`, `npm run dev` (landing + workspace); `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Probe commands remain available. Do not run `probe wallets` on a fresh machine before restoring the existing wallet credential: it otherwise creates unrelated new wallets.
Provision `CLEANVERSE_SANDBOX_API_ID_NEW` and `CLEANVERSE_SANDBOX_API_KEY_NEW` securely; existing saved credentials are available in the originating Devin environment. Never put them in source or logs. The local encrypted wallet file is deliberately excluded from Git; continuation on another machine needs a securely restored test-wallet credential/vault before managing an already issued asset.

## Next action

Do not issue another token: the one authorized CVA is already genuinely issued. Visually self-review the original hero/workspace probe, then complete the remaining approved landing sections. When free gas arrives, grant MINTER_ROLE, mint only to the approved participant/merchant, prove permitted payment and actual lower-level-CVI rejection. Payment controls must stay unavailable until genuine funding/signing is configured. Plan adjusted to permit design work while gas is blocked; Emma was told explicitly. Feature freeze 00:30 UTC; deadline 03:59 UTC on October 14. Human performs final submission.

## Portable checkpoints

- First pushed checkpoint: `e61bb6cdfbcc14cb291f5532a19e287410b47d34` (secure probe, authorization, MIT license and icon). Current handoff updates describe the subsequent evidence; consult branch HEAD for the latest code commit.
- Issued CVA + synthetic-CVI evidence checkpoint: `98c3f38`.
- Probe tests: 3/3 pass; Node syntax check passes; npm audit reports zero vulnerabilities after selecting ethers 6.17.0 (the earlier 6.15.0 pinned ws version had advisories and was replaced before push).
- A+B probe: lint passes, type check passes, production build passes, 3 unit tests pass, npm audit zero vulnerabilities. Next 16.3.8 / React 19.3.0 / TypeScript 5.9.3. Read Next's installed app routing/CSS/route-handler guides before coding. `eslint-config-next` pulled an unpatched high-severity braces advisory; replaced it with supported ESLint 10.12.0 + TypeScript parser, not forced downgrades or suppressed audit findings.
- First testing-agent browser run was intentionally stopped to fix a truthful-loading bug. Desktop 1440x900 passed navigation, focus, responsive horizontal overflow and live RPC state, but initial loading mistakenly claimed no credits before the first read. Fix now shows neutral checking copy until a real response; it also narrows the hero art, enlarges important small labels. Mobile/error/reduced-motion remain untested until the final browser pass. The historic screenshots/recording of the pre-fix UI are **not** proof of the fix.
- Read-only receipts confirmed on Monad: issuance status1; all three CVI registrations status1; add-rule status1; remove-invalid-subgroup-rule status1. Registration hashes are in `docs/fixture-evidence.json`. Program rule is now solely `min_sub_tier: 69`. Zero-value outsider rejection remains an `eth_call` simulation, not a mined failure receipt.
