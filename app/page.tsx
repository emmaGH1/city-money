import Link from 'next/link';
import { CityScene } from '../components/CityScene';
import evidence from '../docs/fixture-evidence.json';

const explorer = 'https://testnet.monadscan.com/tx/';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark"><span className="logo-mark" aria-hidden="true">⌂</span> CITY MONEY<span className="wordmark-period">.</span></Link>
        <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#proof">Proof</a><Link href="/workspace">Open the sandbox <span aria-hidden="true">↗</span></Link></nav>
      </header>
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
          <p className="eyebrow hero-eyebrow">A neighborhood-sized experiment <span aria-hidden="true">✳</span> Monad testnet</p>
          <h1 id="hero-title">A little goes<br /><em>around here.</em></h1>
          <p className="hero-description">What if a local benefit stayed local? Explore a fictional test-credit program where a prepared participant can pay an eligible merchant—but our lower-level test identity can’t receive the credits.</p>
          <Link href="/workspace" className="button-primary">Step into the sandbox <span aria-hidden="true">↗</span></Link>
          <p className="hero-disclaimer">A fictional test program. No city, real money, or real-world identity check.</p>
        </div>
        <div className="hero-city"><CityScene /></div>
        <div className="hero-ground" aria-hidden="true"><span /> <span /> <span /></div>
        <span className="hero-edition" aria-hidden="true">THE NEIGHBORHOOD ISSUE · NO. 01</span>
      </section>
      <div className="street-ribbon" aria-label="How the sandbox works"><span>ONE TEST VOUCHER</span><span aria-hidden="true">✳</span><span>ONE CORNER SHOP</span><span aria-hidden="true">✳</span><span>ONE REAL BOUNDARY</span></div>
      <section id="how-it-works" className="journey-section" aria-labelledby="journey-title">
        <div className="journey-intro"><p className="eyebrow">01 / THE SMALL IDEA</p><h2 id="journey-title">Not a new kind<br />of money.<br /><em>A new kind<br />of boundary.</em></h2><p>The token is real. This neighborhood program is imagined. Follow one voucher through three very different moments.</p></div>
        <div className="journey-route" aria-label="The receive, pay, reject journey">
          <div className="journey-step"><span className="step-number">01</span><div><span className="step-label">RECEIVE</span><h3>A benefit lands.</h3><p>A prepared sandbox participant is registered at level 70. The token exists, but their balance is still zero; allocation awaits test gas.</p></div><span className="step-symbol" aria-hidden="true">↘</span></div>
          <div className="journey-step"><span className="step-number">02</span><div><span className="step-label">SPEND</span><h3>A table gets paid.</h3><p>Our Corner Table merchant is registered at level 70 too. The permitted preflight succeeds; a funded payment is not yet proven.</p></div><span className="step-symbol" aria-hidden="true">↗</span></div>
          <div className="journey-step"><span className="step-number">03</span><div><span className="step-label">THE BOUNDARY</span><h3>The wrong door stays closed.</h3><p>The prepared outsider is registered at level 1. Its zero-value transfer preflight reverts at the CVA; a mined rejection remains to be demonstrated.</p></div><span className="step-symbol" aria-hidden="true">×</span></div>
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
        <div className="proof-header"><p className="eyebrow">03 / UNDER THE POSTER</p><h2 id="proof-title">Don&apos;t take our<br /><em>word for it.</em></h2><p>The issue and identity setup really happened on Monad testnet. Open the receipts. Payment and failed-transfer receipts are still pending.</p></div>
        <div className="proof-ledger" aria-label="Verified on-chain setup">
          <a href={`${explorer}${evidence.issuanceTx}`} target="_blank" rel="noopener noreferrer"><span>01</span><span><strong>CITYCM was issued.</strong><small>Cleanverse CVA · Monad testnet · confirmed transaction</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${evidence.roles.participant.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>02</span><span><strong>A participant was registered.</strong><small>Synthetic sandbox CVI · confirmed transaction</small></span><span aria-hidden="true">↗</span></a>
          <a href={`${explorer}${evidence.ruleAddedTx}`} target="_blank" rel="noopener noreferrer"><span>03</span><span><strong>The level rule was added.</strong><small>Configured min_sub_tier: 69 · confirmed transaction</small></span><span aria-hidden="true">↗</span></a>
          <div className="proof-awaiting"><span>04</span><span><strong>Allocation → payment → rejected transfer</strong><small>Awaiting free test gas and mined transactions. No simulated receipt is shown.</small></span><span aria-hidden="true">…</span></div>
        </div>
        <div className="proof-bottom"><span>CVA · <code>{evidence.cva}</code></span><a href={`https://testnet.monadscan.com/address/${evidence.cva}`} target="_blank" rel="noopener noreferrer">Inspect token contract ↗</a></div>
      </section>
      <section id="limits" className="limits-section" aria-labelledby="limits-title">
        <div className="limits-stamp" aria-hidden="true">TEST<br />ONLY<br />↗</div>
        <div className="limits-copy"><p className="eyebrow">04 / A QUICK NOTE BEFORE YOU GO</p><h2 id="limits-title">A city-sized idea.<br /><em>Not a city program.</em></h2><p>No government partner. No real residency checks or identity documents. No fiat, cash redemption, or production compliance claim. Just an honest, testnet-sized experiment in keeping a benefit inside an eligible group.</p></div>
        <div className="limits-invitation"><span>THIS WAY TO THE DEMO</span><p>The voucher, the merchant, the balance—and eventually the real payment proof—live here.</p><Link href="/workspace" className="button-primary">Enter the sandbox <span aria-hidden="true">↗</span></Link><small>Prepared test accounts · Monad testnet · No wallet needed to inspect</small></div>
      </section>
      <footer className="site-footer"><span>CITY MONEY / FICTIONAL SANDBOX</span><div><a href="https://github.com/emmaGH1/city-money" target="_blank" rel="noopener noreferrer">SOURCE &amp; LICENSE ↗</a><a href={`https://testnet.monadscan.com/address/${evidence.cva}`} target="_blank" rel="noopener noreferrer">ISSUED CVA ↗</a></div></footer>
    </main>
  );
}
