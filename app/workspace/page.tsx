'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CityScene } from '../../components/CityScene';

type State = {
  block: number;
  contract: string;
  symbol: string;
  verifiedAt: string;
  supply: string;
  balances: { participant: string; merchant: string; outsider: string };
  gas: { participant: string; admin: string };
  wallets: { participant: string; merchant: string; outsider: string };
  eligibility: { participant: number; merchant: number; outsider: number; minimum: number };
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Workspace() {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const timeout = AbortSignal.timeout(15000);
      const response = await fetch('/api/state', { cache: 'no-store', signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Chain check failed');
      setState(result as State);
    } catch (cause) {
      if (signal?.aborted) return;
      setState(null);
      setError(cause instanceof Error ? cause.message : 'Chain check failed');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const funded = state && Number(state.balances.participant) > 0;
  return (
    <main className="workspace">
      <header className="site-header workspace-header">
        <Link href="/" className="wordmark"><span className="logo-mark" aria-hidden="true">⌂</span> CITY MONEY<span className="wordmark-period">.</span></Link>
        <span className="workspace-header-label">NEIGHBORHOOD SANDBOX <span aria-hidden="true">·</span> MONAD TESTNET</span>
        <Link className="back-link" href="/">← Back to the story</Link>
      </header>
      <div className="workspace-wrap">
        <div className="workspace-intro"><p className="eyebrow">01 / THE NEIGHBORHOOD</p><h1>Your little corner<br /><em>of the city.</em></h1><p>One fictional program. One prepared participant. One eligible corner shop. Nothing here represents real money or real identity verification.</p></div>
        <div className="workspace-columns">
          <section className="merchant-panel" aria-labelledby="merchant-heading">
            <div className="merchant-panel-top"><span>CORNER NO. 01 / 01</span><span className="merchant-mark">LOCAL SPOT <span aria-hidden="true">↗</span></span></div>
            <div className="merchant-illustration"><span className="merchant-orbit" aria-hidden="true">✳</span><CityScene compact /><span className="merchant-caption">A GOOD PLACE<br />TO STOP BY.</span></div>
            <div className="merchant-panel-bottom"><div><p className="eyebrow">A FICTIONAL DEMO MERCHANT</p><h2 id="merchant-heading">Corner Table</h2><p>Prepared sandbox wallet · eligible in the test program</p></div><span className="merchant-number">01</span></div>
          </section>
          <section className="voucher-panel" aria-labelledby="voucher-heading">
            <div className="voucher-panel-top"><span>YOUR TEST VOUCHER</span><span>CM / 01</span></div>
            <p className="voucher-label">Available from the real CVA</p>
            <h2 id="voucher-heading" className="voucher-value">{state ? state.balances.participant : loading ? '···' : '—'}<span> CITYCM</span></h2>
            <p className="voucher-footnote">{loading ? 'Reading Monad testnet…' : error ? 'Balance unavailable — do not assume funds exist.' : `On-chain at block ${state?.block.toLocaleString()}`}</p>
            <div className="voucher-divider" />
            <div className="voucher-detail"><span>PARTICIPANT</span><span>{state ? shortAddress(state.wallets.participant) : 'Checking wallet…'}</span></div>
            <div className="voucher-detail"><span>MERCHANT</span><span>{state ? shortAddress(state.wallets.merchant) : 'Checking wallet…'}</span></div>
            <div className="voucher-detail"><span>ELIGIBILITY</span><span>Sandbox fixture · level 70</span></div>
            <p className="voucher-warning">{loading ? 'Checking on-chain credits. No balance has been confirmed for this read yet.' : error || (funded ? 'Credits confirmed on-chain. Payment controls open only after a real transfer is configured.' : 'This participant wallet has no available credits. This is a live balance—not a simulated allocation.')}</p>
            <button className="button-pay" type="button" disabled>Payment not yet available <span aria-hidden="true">↗</span></button>
            <button className="refresh-button" type="button" onClick={() => void refresh()} disabled={loading}>↻ Refresh chain balance</button>
          </section>
        </div>
        <section className="boundary-panel" aria-labelledby="boundary-heading"><span className="boundary-index">02 / THE BOUNDARY</span><div><h2 id="boundary-heading">The rules travel with the credits.</h2><p>The registered outsider has a sandbox identity below this CVA’s minimum level. A zero-value preflight reverted at the actual Cleanverse token contract; a funded transfer and transaction receipt are not yet established.</p></div><a href={`https://testnet.monadscan.com/address/${state?.contract ?? '0x78e12fC329564D6E28d79ed81a009c0215d5Ec8D'}`} target="_blank" rel="noopener noreferrer">Inspect real CVA ↗</a></section>
        <p className="workspace-fine-print">Sandbox identities were created without identity documents. Level is an issuer-assigned test attribute, not proof of residence. Readings can change: reload to verify. {state && `Last read ${new Date(state.verifiedAt).toLocaleString()}.`}</p>
      </div>
    </main>
  );
}
