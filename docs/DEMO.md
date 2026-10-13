# City Money — judge walkthrough

**Current public site:** https://city-money.vercel.app · free Vercel Hobby · Monad testnet 10143. The site is an **evidence viewer**, not an interactive checkout. No public minting, signing or CVI-administration controls exist in this revision. Emma has not approved a hackathon submission or a merge.

## 75-second narration and screen route

| Time | Screen and narration | Actual evidence |
| --- | --- | --- |
| 0–12s | Landing hero: “What if a local benefit stayed local? City Money is a **fictional** test-credit program, not a city budget or real money.” | Original art; sandbox disclaimer visible. |
| 12–26s | Scroll through receive → spend → boundary. “A genuine Cleanverse CVA checks a wallet’s test identity in the token transfer. Our prepared participant received 20 credits, then paid 5 to Corner Table.” | [Mint status 1](https://testnet.monadscan.com/tx/0xd8f0bc7a9916ffb62d6ae4cb8bc05a90dae24c83421b7f5651f553aed93d644e) · [merchant payment status 1](https://testnet.monadscan.com/tx/0xe7a0b0f665acfa70d04b4e58f0abb85b2cf14faf102b3074afe4a36709b68f9e). |
| 26–42s | Enter workspace and refresh the live balance. “The participant now has 15; the merchant 5; the outsider 0. These are live token reads, not seeded UI values.” | `/api/state` reads the real CVA supply and all three balances. Identity levels shown alongside them are **registration snapshots**, not live identity reads. |
| 42–65s | Click **See proof**, then the rejected transfer. “The participant tried to send 1 credit to the level-1 test outsider. The mined transaction failed at the Cleanverse policy verifier. The trace includes the outsider address, configured rule value 69 and observed level 1; no token balance changed.” | [Reverted receipt status 0](https://testnet.monadscan.com/tx/0xd0e56e57f39f58fd114f894e3bbbb74afa00853d424bc852760480fdd7f66c77) · [trace and before/after balances](transaction-evidence.json). |
| 65–75s | Return to the site: “The contract, not a hidden button, drew the boundary. The identities and program are sandbox fixtures—this is not real KYC or residency verification.” | `docs/fixture-evidence.json` and [issued CVA](https://testnet.monadscan.com/address/0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D). |

**Do not say:** viewers can execute checkout on this site. The listed payment was genuinely executed from the prepared test wallet by the operator, and the public UI lets viewers inspect its receipt; the disabled checkout is intentional until a safe, explicitly approved signing design is deployed. Do not imply government sponsorship, fiat backing, cash redemption, automatic token expiry, production compliance, or verified real-world residence. Level 69's exact inclusivity is not established by our positive 70 / negative 1 test case; Cleanverse docs conflict on that boundary. No arbitrary $/time savings or speed claims.

## Hand-off for the ≤3-minute submission video

The authorized browser walkthrough is in the originating Devin session; it is not a public video URL. If Emma chooses this evidence-only version, record and trim a final ≤3-minute walkthrough following the route above, publish that video through an approved free venue, and verify the public video opens without login before submission. If interactive checkout is approved, update this script and re-record the new **actual** flow. Emma retains final submission control before the October 14, 03:59 UTC deadline.
