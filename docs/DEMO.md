# City Money — judge walkthrough

**Try the [live sandbox](https://city-money.vercel.app)** · **[Watch the founder demo](https://city-money-demo.vercel.app)** (2:47, Emma's authorized voice, open subtitles) · [Download SRT](https://city-money-demo.vercel.app/city-money.srt). The older unnarrated browser proof is available from the video page as an archive.

## The product in one journey

A prepared participant has a CITYCM balance from a genuinely issued Cleanverse CVA on Monad testnet. Choose **1–5 whole credits**, review the fixed **Corner Table** merchant, and confirm. The server signs only from that participant's test-only wallet, saves a bounded intent, and broadcasts that exact transaction. After it is verified, both participant and merchant balances update and a Monad explorer link opens the actual payment. In the boundary panel, a separate fresh **read-only** call checks a lower-level outsider. The separately linked historical **mined failed** transfer proves that the asset enforces the configured Cleanverse rule beyond the website.

**Current shared capacity at final film capture:** 18 public payments remained; live availability can change. The cap is global, not per visitor. The issuer key is not on Vercel; there is no public mint, reset or issuer action. If checkout is exhausted, inspect the real filmed transaction and use the read-only boundary check. The registration levels are fixtures, not real KYC or verified city residency.

## Founder demo (167.4 seconds; actual speed)

| Time | What the judge sees | What is real |
| --- | --- | --- |
| 0:00–0:31 | Live landing: the programme problem and City Money's answer. | Actual public URL, original spatial neighborhood site. |
| 0:31–0:54 | Short original explanatory motion: Cleanverse CVI → Cleanverse CVA → Monad. | Architecture illustration only, no simulated payment UI. |
| 0:54–1:18 | Live workspace: balance, merchant, choose 1 credit, inspect review and confirm. | Native visible cursor and clicks on public app; prior QA confirmation may be visible as older restored history. |
| 1:18–1:23 | Confirmation remains on-screen at **normal speed**. | Exactly one signed 1-credit payment; 4.85-second actual response and ~5.07-second balance update. No accelerated wait. |
| 1:23–1:45 | 116/9 balances and the same successful payment on MonadScan. | [Filmed tx `0x1546…c37db`](https://testnet.monadscan.com/tx/0x15466231d1cb4c6953a7f447a9e63d7eabad88144682d1e3ba0b7e31c16c37db), status 1, block 70799023, nonce 5, one exact 1-CITYCM Transfer. Before this payment: participant 117, merchant 8; after: 116 and 9. Outsider 0; supply 125. |
| 1:45–2:21 | Fresh ineligible-recipient check, then separate historical failed transfer. | Fresh check is **eth_call**, never a new mined transaction. [Earlier failed tx](https://testnet.monadscan.com/tx/0xd0e56e57f39f58fd114f894e3bbbb74afa00853d424bc852760480fdd7f66c77) is distinct, status 0 with Cleanverse verifier trace. |
| 2:21–2:47 | Founder close on the actual landing and URL. | No mocked screenshots, accelerated browser interactions or new test credits in the video editor. |

The founder narration uses Emma's authorized ElevenLabs voice clone, generated once per scene under the approved 6,000-included-credit ceiling (3,557 conservatively reserved), with time-aligned two-line subtitles and an SRT sidecar. The 24-second motion scene explains mechanism only. Source screen capture was a coherent 186-second **original-speed** live browser take with a visible native cursor, edited only to trim quiet handles and an already-confirmed hold. One previous restored QA confirmation exists beneath the new checkout; its old block 70795764 is not the filmed payment. Production clip and source-action timestamps are kept in the originating session's `/home/ubuntu/city-money-film/founder-capture-manifest.md` (not committed).

Final media: 1920×1080, 30fps, H.264/AAC, 167.424 seconds with 41 synchronized cues. The hosted MP4 and downloadable SRT match the inspected final assets byte-for-byte. MP4 SHA-256: `abef27376dc29d0f09fd8cd0ba135945a6a797b33a39c69e947a92fa2d2a861a`; SRT: `ac918d47e7f79510c85d812a7a20f41ddfecaed110ed2f09e900ecdd40caf1c2`. Desktop native playback and downloads were browser-tested. The 390/320px page has no overflow or clipped captions, but 320px inline video captions are small: use the fullscreen control and landscape orientation for phone viewing. Real mobile hardware and physical speaker output were not tested; browser-decoded audio was intelligible.

## Independent validation and boundaries

The focused FAQ recheck passed four disclosure answers at desktop/390px and wrapping at 320px, with 5.18:1 contrast and visible keyboard focus. Earlier desktop/mobile QA checked Sheet, dialog focus restoration, invalid amounts, offline recovery, read-only boundary, localStorage refusal without broadcast, and interrupted-response recovery using identical signed bytes. Two QA payments were spent (not included in the founder film); the filmed payment spent exactly one more. Tests cover bounds, nonce guards and exact token Transfer matching. Broader live concurrency/exhaustion and server-RPC-failure UI flows were not replayed at the expense of judges' limited allowance.

This is a fictional testnet voucher programme: no government affiliation, fiat redemption, real residency check or production compliance claim. The rule is a Cleanverse identity-level threshold (`min_sub_tier: 69`), proven here with registered level-70 participant/merchant and level-1 outsider; other qualifying identities may also pass. Monad settles and exposes transaction evidence. Full chain evidence and reproducible verification are in [transaction-evidence.json](transaction-evidence.json). On Monad, `gasUsed == gasLimit` does not alone prove an out-of-gas failure; the earlier outsider failure classification uses the policy trace and identity lookup.

**Submission boundary:** Public app, source and film are a preview for Emma's review. There has been no merge or hackathon submission without her approval. The recorded deadline is October 14 at 03:59 UTC.
