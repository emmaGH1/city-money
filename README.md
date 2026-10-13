# City Money

A fictional civic-voucher sandbox on Monad testnet, targeting genuine Cleanverse CVI/CVA enforcement. **Not built or issued yet.**

Planned journey: receive test credits → pay an approved demo merchant → demonstrate an actually rejected ineligible transfer. No real government, money, residency verification or automatic token-expiry claims.

## Development

Requires Node.js 24 and securely provisioned `CLEANVERSE_SANDBOX_API_ID_NEW` / `CLEANVERSE_SANDBOX_API_KEY_NEW`.

```sh
npm ci
npm run test:probe
npm run probe -- wallets
```

The probe stores test wallets encrypted outside this repository. API calls use the Cleanverse UAT environment only. Never commit credentials or print private keys. Read [the handoff](docs/HANDOFF.md) before continuing.

AI assistance: developed with Devin, with scope and design direction approved by Emma. The prototype is not production-ready or regulatory advice.

License: MIT.
