# City Money

**A little goes around here.**

City Money is a neighborhood voucher experience built around one simple idea: **what if community credits could only reach eligible recipients?**

A participant receives credits, spends them with a neighborhood merchant, and sees the payment settle on-chain. When someone tries to send those same credits to an ineligible wallet, the asset's rules stop the transfer. **Cleanverse enforces eligibility inside the token. Monad makes the outcome verifiable.**

This is an interactive product prototype, not a concept deck. The site includes a working checkout, live testnet balances, a policy check and independent transaction evidence.

## Explore City Money

| | Link |
| --- | --- |
| **Live product** | [city-money.vercel.app](https://city-money.vercel.app) |
| **Try the checkout** | [Open the workspace](https://city-money.vercel.app/workspace) |
| **Watch the founder demo** | [City Money product film](https://city-money-demo.vercel.app) |
| **Judge walkthrough** | [Demo route and what is verified](docs/DEMO.md) |
| **On-chain token** | [CITYCM on MonadScan](https://testnet.monadscan.com/address/0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D) |

**Start with the product film**, then open the workspace to try the same journey yourself. No login or wallet connection is required.

## The experience

1. **Receive.** Enter the workspace and inspect the prepared participant's CITYCM balance, backed by a genuine issued Cleanverse verified asset (CVA).
2. **Spend.** Choose 1–5 CITYCM credits, review the fixed **Corner Table** merchant and confirm. If shared checkout capacity remains, the app broadcasts a real Monad testnet payment and shows its transaction and updated balances.
3. **See the boundary.** Check what happens when credits are directed toward an ineligible recipient. The live boundary button performs a read-only policy check. A separate historical on-chain transaction demonstrates the same rule rejecting a mined transfer.

The crucial detail: eligibility is **not just a disabled button or a website rule**. The issued asset applies its configured Cleanverse rule to transfers.

## What makes it work

- **Cleanverse CVI:** prepared test identities with assigned levels represent a participant, an eligible merchant and an outsider.
- **Cleanverse CVA:** an issued CITYCM asset checks the configured identity-level threshold before allowing transfers.
- **Monad testnet:** successful payments and rejected transactions have independently inspectable chain records.
- **City Money workspace:** a focused voucher checkout presents balances, merchant details, review, transaction status and recovery controls without making judges set up a wallet.

The product's transfer rule currently requires an identity level of at least **69**. The prepared participant and Corner Table each have level **70**; the test outsider has level **1**. These are test registrations, not real-world residency or identity verification.

## Proof, not placeholders

| Claim | Evidence |
| --- | --- |
| CITYCM was issued as a Cleanverse verified asset | [Issuance transaction](https://testnet.monadscan.com/tx/0xea8ee6b36e7a4abfd17dd0b6e55a4f1e7e9ab6f21c65f2c7c0160485f8dc8d23) |
| Credits reached the eligible merchant | [Confirmed 5-CITYCM payment](https://testnet.monadscan.com/tx/0xe7a0b0f665acfa70d04b4e58f0abb85b2cf14faf102b3074afe4a36709b68f9e) |
| An ineligible transfer was rejected by the asset | [Mined rejected transaction](https://testnet.monadscan.com/tx/0xd0e56e57f39f58fd114f894e3bbbb74afa00853d424bc852760480fdd7f66c77) |
| A user completed checkout through the live browser | [Filmed 1-CITYCM payment](https://testnet.monadscan.com/tx/0x15466231d1cb4c6953a7f447a9e63d7eabad88144682d1e3ba0b7e31c16c37db) |

The founder demo includes the real 1-credit checkout and its confirmation at normal speed. In that filmed transaction, the participant balance moved from **117 to 116** and the merchant balance from **8 to 9**. The separately linked rejected transaction has receipt status **0**; it is not a fabricated UI state or the result of clicking the live read-only boundary button.

For reproducible addresses, rules and receipt details, see [transaction evidence](docs/transaction-evidence.json).

## Built with

**Next.js 16, React 19, TypeScript, shadcn/ui and Radix UI** for the web experience; **Cleanverse CVI/CVA** for test-identity and token-transfer eligibility; **ethers.js** for transaction handling; **Monad testnet** for settlement and verifiable evidence; **Vercel** for deployment.

The checkout uses a prepared **test-only participant wallet**, signed on the server. It limits transfers to the fixed Corner Table merchant and 1–5 whole credits. Signed transaction bytes are saved before broadcasting so an interrupted response can be recovered without silently creating another payment. The issuer/admin key is not deployed to the public app.

## Run locally

Requires Node.js 24.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The site and read-only views can run without private credentials. To enable the bounded test checkout, configure `CITY_MONEY_TEST_PARTICIPANT_PRIVATE_KEY` as a **server-only** environment variable using an authorized test wallet. Do not commit secrets or reuse a real-funds wallet.

Validation commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

See [technical handoff](docs/HANDOFF.md) for operations, safety limits and additional setup.

## Scope and transparency

City Money demonstrates a **possible neighborhood-benefit model on testnet**. The neighborhood, merchant and program are fictional; the Cleanverse CVA and linked Monad transactions are real testnet artifacts. There is no government affiliation, fiat redemption, real residency/KYC verification or production compliance claim. The current eligibility rule checks a test identity level, **not geography or merchant licensing**.

Interactive checkout draws from a **shared, capped test allowance**, not an individual allocation for each visitor. Availability can change. If it is exhausted, the live read-only policy check, the founder film and all historical transaction links remain available. The project is a prototype, not a launched payments network.

**License:** MIT.
