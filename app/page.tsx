import Link from 'next/link';
import { CityScene } from '../components/CityScene';
import evidence from '../docs/fixture-evidence.json';
import transactions from '../docs/transaction-evidence.json';
import { SiteHeader } from '../components/SiteHeader';
import { Mechanism } from '../components/Mechanism';
import { SandboxFAQ } from '../components/SandboxFAQ';
import { Button } from '../components/ui/button';

const explorer = 'https://testnet.monadscan.com/tx/';

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero-stamp" aria-hidden="true">GOOD<br />HERE<br />↘</span>
        <div className="hero-voucher" aria-hidden="true">
          <div className="voucher-eyebrow"><span>CM / 01</span><span>TEST VOUCHER</span></div>
          <div className="voucher-town">GOOD FOR<br />THE BLOCK.</div>
          <div className="voucher-illustration"><span className="voucher-sun" /> <span className="voucher-roof" /></div>
          <div className="voucher-rule" />
          <div className="voucher-bottom"><span>FICTIONAL PROGRAM</span><span>MONAD TESTNET</span></div>
        </div>
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">COMMUNITY BENEFITS <span aria-hidden="true">✳</span> CLEANVERSE ON MONAD</p>
          <h1 id="hero-title">A little goes<br /><em>around here.</em></h1>
          <p className="hero-description">Community credits that can be spent—not sent anywhere. <strong>Cleanverse</strong> enforces who can receive them. <strong>Monad</strong> records each payment.</p>
          <Button asChild className="button-primary"><Link href="/workspace">Use your program voucher <span aria-hidden="true">↗</span></Link></Button>
          <p className="hero-disclaimer">A fictional neighborhood. Real contract-backed transfers.</p>
        </div>
        <div className="hero-city"><CityScene /></div>
        <div className="hero-ground" aria-hidden="true"><span /> <span /> <span /></div>
        <span className="hero-edition" aria-hidden="true">THE NEIGHBORHOOD ISSUE · NO. 01</span>
      </section>
      <Mechanism />
      <section id="how-it-works" className="journey-section" aria-labelledby="journey-title">
        <div className="journey-intro"><p className="eyebrow">01 / THE SMALL IDEA</p><h2 id="journey-title">Not a new kind<br />of money.<br /><em>A new kind<br />of boundary.</em></h2><p>The token is real. This neighborhood program is imagined. Follow one voucher through three very different moments.</p></div>
        <div className="journey-route" aria-label="The receive, pay, reject journey">
          <div className="journey-step"><span className="step-number">01</span><div><span className="step-label">RECEIVE</span><h3>A benefit lands.</h3><p>The prepared test participant received 20 CITYCM credits from the genuine issued CVA. The mint has its own Monad receipt.</p></div><span className="step-symbol" aria-hidden="true">↘</span></div>
          <div className="journey-step"><span className="step-number">02</span><div><span className="step-label">SPEND</span><h3>A table gets paid.</h3><p>They paid 5 credits to Corner Table. Its level-70 merchant identity passed the token policy, and the transfer settled on-chain.</p></div><span className="step-symbol" aria-hidden="true">↗</span></div>
          <div className="journey-step"><span className="step-number">03</span><div><span className="step-label">THE BOUNDARY</span><h3>The wrong door stays closed.</h3><p>The same participant tried to send 1 credit to a level-1 test outsider. The Cleanverse policy reverted the mined transaction. No credits moved.</p></div><span className="step-symbol" aria-hidden="true">×</span></div>
          <Link href="/workspace" className="journey-link">Follow the voucher in the sandbox <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section id="neighborhood" className="neighborhood-section" aria-labelledby="neighborhood-title">
        <div className="neighborhood-heading"><p className="eyebrow">02 / THE CAST</p><h2 id="neighborhood-title">One corner.<br /><em>Three wallets.</em></h2><p>This is a small sandbox with test identities, not a real city registry. Anyone with a valid identity satisfying the issuer&apos;s level criterion could qualify; these wallets illustrate the boundary.</p></div>
        <div className="neighborhood-scene"><span className="neighborhood-sun" aria-hidden="true" /><CityScene compact /><span className="neighborhood-label">CORNER TABLE<br /><small>FICTIONAL DEMO MERCHANT</small></span></div>
        <div className="neighborhood-roster" aria-label="Synthetic sandbox identities">
          <div><span className="roster-id">01</span><span><strong>Participant</strong><small>Prepared test identity · level 70</small></span><span className="roster-result">LEVEL MET</span></div>
          <div><span className="roster-id">02</span><span><strong>Corner Table</strong><small>Prepared merchant wallet · level 70</small></span><span className="roster-result">LEVEL MET</span></div>
          <div><span className="roster-id">03</span><span><strong>Outsider</strong><small>Prepared test identity · level 1</small></span><span className="roster-result roster-blocked">BELOW LEVEL</span></div>
          <p>These values were assigned at registration for this test; they are not live CVI reads or real KYC, residency or merchant verification.</p>
        </div>
      </section>
      <section id="proof" className="proof-section" aria-labelledby="proof-title">
        <div className="proof-header"><p className="eyebrow">03 / UNDER THE POSTER</p><h2 id="proof-title">Don&apos;t take our<br /><em>word for it.</em></h2><p>Issue, allocation, payment and rejection all happened on Monad testnet. Open the receipts—not a simulated transaction screen.</p></div>
        <div className="proof-ledger" aria-label="Verified on-chain setup">
          <a href={`${explorer}${evidence.issuanceTx}`} target="_blank" rel="noopener noreferrer"><span>01</span><span><strong>CITYCM was issued.</strong><small>Cleanverse CVA · Monad testnet · confirmed transaction</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${evidence.roles.participant.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>02</span><span><strong>A participant was registered.</strong><small>Synthetic sandbox CVI · confirmed transaction</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${evidence.ruleAddedTx}`} target="_blank" rel="noopener noreferrer"><span>03</span><span><strong>The level rule was added.</strong><small>Configured min_sub_tier: 69 · confirmed transaction</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${transactions.transactions.mint.hash}`} target="_blank" rel="noopener noreferrer"><span>04</span><span><strong>The original 20-credit allocation.</strong><small>Historical mint · prepared participant · receipt status 1</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${transactions.transactions.payment.hash}`} target="_blank" rel="noopener noreferrer"><span>05</span><span><strong>5 credits reached Corner Table.</strong><small>Eligible merchant · receipt status 1</small></span><span aria-hidden="true">↗</span></a>
          <a className="proof-declined" href={`${explorer}${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer"><span>06</span><span><strong>1 credit could not leave.</strong><small>Outsider level 1 · configured rule 69 · receipt status 0</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${transactions.transactions.judgeAllowanceMint.hash}`} target="_blank" rel="noopener noreferrer"><span>07</span><span><strong>A capped judge allowance was funded.</strong><small>Separate 105-credit test mint · original allocation preserved as history</small></span><span aria-hidden="true">↗</span></a>
        </div>
        <div className="proof-bottom"><span>CVA · <code>{evidence.cva}</code></span><a href={`https://testnet.monadscan.com/address/${evidence.cva}`} target="_blank" rel="noopener noreferrer">Inspect token contract ↗</a></div>
      </section>
      <section id="limits" className="limits-section" aria-labelledby="limits-title">
        <div className="limits-stamp" aria-hidden="true">COME<br />ON IN<br />↗</div>
        <div className="limits-copy"><p className="eyebrow">04 / YOUR TURN</p><h2 id="limits-title">Small enough<br /><em>to try.</em></h2><p>Pay Corner Table. Follow the receipt. Check where the credits cannot go.</p><SandboxFAQ /></div>
        <div className="limits-invitation"><span>THIS WAY TO THE PROGRAM</span><p>A funded voucher.<br />A real payment.<br />An inspectable rule.</p><Button asChild className="button-primary"><Link href="/workspace">Enter the workspace <span aria-hidden="true">↗</span></Link></Button><small>Shared prepared wallet · bounded allowance · no wallet setup</small></div>
      </section>
      <footer className="site-footer"><span>CITY MONEY / FICTIONAL SANDBOX</span><div><a href="https://github.com/emmaGH1/city-money" target="_blank" rel="noopener noreferrer">SOURCE &amp; LICENSE ↗</a><a href={`https://testnet.monadscan.com/address/${evidence.cva}`} target="_blank" rel="noopener noreferrer">ISSUED CVA ↗</a></div></footer>
    </main>
  );
}
