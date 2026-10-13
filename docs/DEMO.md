# City Money — judge walkthrough

**Live app:** https://city-money.vercel.app · **public recording:** https://city-money-demo.vercel.app · **direct MP4:** https://city-money-demo.vercel.app/city-money-live-demo.mp4.

The Next.js app supports an explicitly approved bounded checkout, not just receipt inspection. Only a prepared participant test-wallet key is held server-side; the issuer/admin key is not deployed. Free Vercel Hobby, Monad testnet 10143, no real money. Emma has not approved submission or a merge.

## Recorded actual journey

The public video is an **88-second, real-time, unnarrated screen capture**, not a simulated payment or accelerated latency claim. It shows the actual 1-credit checkout, its successful explorer receipt, the fresh read-only outsider test and the separate earlier mined failed receipt. An annotated shorter testing edit is available in the originating Devin session; it is not the real-time public version.

The actual checkout hash is [`0xf7867b4baf3d41363f98b916c0a67c803bb518018ec88e41b420e0dba5c2acad`](https://testnet.monadscan.com/tx/0xf7867b4baf3d41363f98b916c0a67c803bb518018ec88e41b420e0dba5c2acad), receipt status **1**, block **70763567**, nonce **2**. Historical reads at blocks 70763566 and 70763567 and the CVA Transfer event confirm participant **15→14**, merchant **5→6**, outsider **0**, supply **20**. Fee: **0.026895258 test MON**. Refresh/reload restored and rechecked the same receipt; it did not send another payment.

## 75–90-second story / optional narration

| Time | Screen and narration | Honest evidence |
| --- | --- | --- |
| 0–10s | Landing: “What if a local benefit stayed local? City Money is a fictional test-credit program, not a city budget or real money.” | Original A+B art; sandbox disclaimer. |
| 10–20s | Enter workspace: “A genuine Cleanverse CVA on Monad allocated 20 credits. A prepared participant already paid 5 to Corner Table.” | [Mint status 1](https://testnet.monadscan.com/tx/0xd8f0bc7a9916ffb62d6ae4cb8bc05a90dae24c83421b7f5651f553aed93d644e), [initial payment status 1](https://testnet.monadscan.com/tx/0xe7a0b0f665acfa70d04b4e58f0abb85b2cf14faf102b3074afe4a36709b68f9e). These are earlier real transactions, not new allocations during the video. |
| 20–45s | Amount **1 → Review → Confirm**: “Only this merchant, a small amount and the prepared participant can be used. The server waits for a real receipt before showing success.” | Recorded actual payment; no issuer key, public mint or user-wallet connection. |
| 45–60s | Receipt/explorer: “One credit moved: participant 15 to 14, merchant 5 to 6. Here is the actual successful Monad receipt.” | Status 1, exact recipient, amount and Transfer event. Those are the recorded before/after balances; later live reads may differ. |
| 60–80s | Boundary panel: “Now a fresh read-only call asks whether the lower-level outsider can receive. The contract rejects level 1 against rule 69, without broadcasting. This separate earlier transaction also actually failed on-chain.” | Fresh **eth_call**, plus [mined rejection status 0](https://testnet.monadscan.com/tx/0xd0e56e57f39f58fd114f894e3bbbb74afa00853d424bc852760480fdd7f66c77). The trace and unchanged historical balances are in [transaction evidence](transaction-evidence.json). |
| 80–90s | Close: “The token contract draws the boundary, not a hidden button. All identities and credits are sandbox fixtures.” | Identity labels in the UI are registration snapshots, not live CVI queries. |

## A judge trying it now

After verification **one shared live checkout remained**, not one payment per person. Check current availability first. If it remains, choose 1–5 whole credits, review the fixed merchant and confirm once. Do not promise 15→14 again: start with current live balances. If exhausted or unavailable, inspect the genuine recorded payment and use the read-only boundary. There is no public reset or remint, and no automatic retry after an uncertain outcome.

Do not record another payment just to improve the video. A replay of an existing receipt must be labelled a replay, never a newly executed transfer. The existing public capture preserves the real action for judges who arrive after the shared slot is used.

## Verification and limits

Deployed checkout passed desktop, 390×844 and 320×844 layout/confirmation checks, invalid 0/6 amount gating, pending disabled controls, receipt restoration, keyboard focus, neutral delayed loading, offline/recovery and reduced motion. One payment only was sent. Exhaustion, concurrent confirmations, interrupted POST recovery and forced server-side RPC failure were not browser-tested; preserving the final judge checkout took priority. Source limit tests and Origin/body guards were checked separately.

Never imply government sponsorship, fiat backing, cash redemption, automatic token expiry, production compliance, verified residence, or a unique city allowlist. The issued rule is an identity-level threshold; another qualifying identity may satisfy it. The docs disagree about exact level-69 inclusivity, which the positive 70 / negative 1 fixtures do not resolve. No fabricated time/money savings.

**Publication boundary:** the video is public evidence, not a submitted hackathon entry. Emma retains the final submission decision. The recorded deadline is October 14, **03:59 UTC**. Optional narration above remains a script, not audio already present in the recording.
