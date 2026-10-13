# City Money

A fictional civic-voucher sandbox on Monad testnet, using a **genuine issued Cleanverse CVA**. An initial landing/workspace design probe reads live balances; **minting/payment journey and receipts remain unproven and unavailable**.

CVA: [`0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D`](https://testnet.monadscan.com/address/0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D). [Successful issuance transaction](https://testnet.monadscan.com/tx/0xea8ee6b36e7a4abfd17dd0b6e55a4f1e7e9ab6f21c65f2c7c0160485f8dc8d23). Three synthetic sandbox identities are registered; minting and transfer enforcement remain unproven.

Planned journey: receive test credits → pay an approved demo merchant → demonstrate an actually rejected ineligible transfer. No real government, money, residency verification or automatic token-expiry claims.

## Development

Requires Node.js 24 and securely provisioned `CLEANVERSE_SANDBOX_API_ID_NEW` / `CLEANVERSE_SANDBOX_API_KEY_NEW`.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm run test:probe
npm run probe -- wallets
```

The probe stores test wallets encrypted outside this repository. API calls use the Cleanverse UAT environment only. Never commit credentials or print private keys. Read [the handoff](docs/HANDOFF.md) before continuing.

AI assistance: developed with Devin, with scope and design direction approved by Emma. The prototype is not production-ready or regulatory advice.

License: MIT.
