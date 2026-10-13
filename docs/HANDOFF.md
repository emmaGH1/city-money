# City Money — continuation checkpoint

Approved 2026-10-13 by Emma in https://app.devin.ai/sessions/5c64da2265ea4acb82bac690e99d67e2.

## Authorization

Unattended City Money build; initial no-code restriction lifted. Five-section landing, workspace and receipts. A+B: Cosmos-like spatial composition and Blank Street-like neighborhood warmth, with original artwork. Autonomous hero/workspace probe review and routine technical decisions permitted. Sandbox test identities, new test-only wallets, free faucet gas, one genuine Cleanverse CVA, minting and test transfers permitted. Regular feature-branch commits/pushes and handoffs; browser testing/recording and free public deployment permitted. External spend $0; testnet only. No merge or submission. Stop after two materially different failed issuance approaches; do not substitute a normal token or fabricated evidence.

## Scope and truth labels

One fictional opt-in civic-voucher program: receive test credits, pay an approved demo merchant, prove that an ineligible transfer is rejected by the actual Cleanverse token. No real money, government, residency verification, redemption or automatic token expiry claims. No public minting/identity-admin controls. Prepared accounts and server signing, if used, must be labelled.

## Current state

- Empty public repo cloned; feature branch `devin/1791912000-city-money`.
- Genuine City Money CVA issued on Monad testnet: `0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D`, symbol `CITYCM`, 6 decimals. Application `IA20261014011950500304` reached `ISSUED`; receipt success and admin ownership were confirmed over chain 10143 RPC. Issuance transaction: `0xea8ee6b36e7a4abfd17dd0b6e55a4f1e7e9ab6f21c65f2c7c0160485f8dc8d23`.
- Sponsor API helper and encrypted local test-wallet vault implemented; no application UI exists yet.
- New wallets are stored encrypted outside Git at `~/.city-money/wallets.enc`, derived from the replacement sandbox encryption secret. Never commit or print private keys.
- Vercel browser still redirects to login despite Emma's report of login completion. Hosting session needs confirmation; do not declare deployment ready.
- Three synthetic sandbox CVIs registered without real identity documents/bank data. Participant and merchant have issuer-assigned subTier 70; outsider has subTier 1. All have active CVIs and sandbox-assigned tier 20. Do not represent these as real KYC or residency.
- Requested subgroup `CM` was not allocated to this institution. That registration failed, then the supported subTier criterion succeeded. The unavailable subgroup rule was removed and the sole final CVA rule is `min_sub_tier: 69`. Program approval in this sandbox means a valid CVI satisfying this level threshold, not a unique institution/city allowlist. Another qualifying identity can satisfy it; production cohort isolation needs separately approved issuer permissions/policy design.
- Query Rules advertises encryption but its documented plaintext cURL works; encrypted read returns `10002 Missing required parameter: chain`. Launch, Generate CVI and Add/Remove Rule genuinely accept documented encryption. Do not conclude the encryption key is invalid; launch succeeded with it.
- Public fixture evidence is in `docs/fixture-evidence.json`; it contains only synthetic identities' public state and actual registration hashes. No mint or payment/rejection has been established yet.
- Admin holds DEFAULT_ADMIN_ROLE, not yet MINTER_ROLE. All four test wallets have 0 native MON. The official Monad faucet's verification failed; try the documented free QuickNode faucet once. Do not bypass verification, spend real funds or claim success without balances/receipts.

## Setup and secrets

Node 24, `npm ci`, `npm run test:probe`, `npm run probe -- wallets`.
Provision `CLEANVERSE_SANDBOX_API_ID_NEW` and `CLEANVERSE_SANDBOX_API_KEY_NEW` securely; existing saved credentials are available in the originating Devin environment. Never put them in source or logs. The local encrypted wallet file is deliberately excluded from Git; continuation on another machine needs a securely restored test-wallet credential/vault before managing an already issued asset.

## Next action

Do not issue another token: the one authorized CVA is already genuinely issued. Obtain free native test gas for admin, grant MINTER_ROLE, mint only to the approved participant/merchant, prove permitted payment and actual lower-level-CVI rejection. Complete prototype gate before broad UI. First feasibility window is approximately 45 minutes from 17:15 UTC. Feature freeze 00:30 UTC; deadline 03:59 UTC on October 14. Human performs final submission.

## Portable checkpoints

- First pushed checkpoint: `e61bb6cdfbcc14cb291f5532a19e287410b47d34` (secure probe, authorization, MIT license and icon). Current handoff updates describe the subsequent evidence; consult branch HEAD for the latest code commit.
- Probe tests: 3/3 pass; Node syntax check passes; npm audit reports zero vulnerabilities after selecting ethers 6.17.0 (the earlier 6.15.0 pinned ws version had advisories and was replaced before push).
