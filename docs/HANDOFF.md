# City Money — continuation checkpoint

Approved 2026-10-13 by Emma in https://app.devin.ai/sessions/5c64da2265ea4acb82bac690e99d67e2.

## Authorization

Unattended City Money build; initial no-code restriction lifted. Five-section landing, workspace and receipts. A+B: Cosmos-like spatial composition and Blank Street-like neighborhood warmth, with original artwork. Autonomous hero/workspace probe review and routine technical decisions permitted. Sandbox test identities, new test-only wallets, free faucet gas, one genuine Cleanverse CVA, minting and test transfers permitted. Regular feature-branch commits/pushes and handoffs; browser testing/recording and free public deployment permitted. External spend $0; testnet only. No merge or submission. Stop after two materially different failed issuance approaches; do not substitute a normal token or fabricated evidence.

## Scope and truth labels

One fictional opt-in civic-voucher program: receive test credits, pay an approved demo merchant, prove that an ineligible transfer is rejected by the actual Cleanverse token. No real money, government, residency verification, redemption or automatic token expiry claims. No public minting/identity-admin controls. Prepared accounts and server signing, if used, must be labelled.

## Current state

- Empty public repo cloned; feature branch `devin/1791912000-city-money`.
- Read-only Cleanverse `list_my_atokens` succeeded and returned previously issued Monad assets. This does not prove a new City Money issuance.
- Sponsor API helper and encrypted local test-wallet vault implemented; no application UI exists yet.
- New wallets are stored encrypted outside Git at `~/.city-money/wallets.enc`, derived from the replacement sandbox encryption secret. Never commit or print private keys.
- Vercel browser still redirects to login despite Emma's report of login completion. Hosting session needs confirmation; do not declare deployment ready.
- No City Money issuance, CVI generation, minting or transfer is established at this checkpoint.

## Setup and secrets

Node 24, `npm ci`, `npm run test:probe`, `npm run probe -- wallets`.
Provision `CLEANVERSE_SANDBOX_API_ID_NEW` and `CLEANVERSE_SANDBOX_API_KEY_NEW` securely; existing saved credentials are available in the originating Devin environment. Never put them in source or logs. The local encrypted wallet file is deliberately excluded from Git; continuation on another machine needs a securely restored test-wallet credential/vault before managing an already issued asset.

## Next action

Run exactly one documented encrypted `/atoken/launch` request. Treat submission as pending, not success; only terminal `ISSUED` counts. If the API path fails, inspect the documented Member-platform flow as the materially different second approach. Do not duplicate applications blindly. First feasibility window is approximately 45 minutes from 17:15 UTC. Feature freeze 00:30 UTC; deadline 03:59 UTC on October 14. Human performs final submission.
