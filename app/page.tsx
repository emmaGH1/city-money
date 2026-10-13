import Link from 'next/link';
import { CityScene } from '../components/CityScene';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark"><span className="logo-mark" aria-hidden="true">⌂</span> CITY MONEY<span className="wordmark-period">.</span></Link>
        <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><Link href="/workspace">Open the sandbox <span aria-hidden="true">↗</span></Link></nav>
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
      <section id="how-it-works" className="preview-section">
        <div><p className="eyebrow">THE SMALL IDEA</p><h2>Not a new kind of money.<br /><em>A new kind of boundary.</em></h2></div>
        <p>The CVA is genuinely issued by Cleanverse on Monad testnet. The sandbox identities are synthetic, not real residents. The workspace checks live chain balances before making any claim about a payment.</p>
      </section>
      <footer className="site-footer"><span>CITY MONEY / FICTIONAL SANDBOX</span><a href="https://testnet.monadscan.com/address/0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D" target="_blank" rel="noopener noreferrer">VIEW THE ISSUED CVA ↗</a></footer>
    </main>
  );
}
