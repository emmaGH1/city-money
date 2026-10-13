'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CityScene } from '../../components/CityScene';
import evidence from '../../docs/fixture-evidence.json';
import transactions from '../../docs/transaction-evidence.json';

type State = {
  block: number;
  contract: string;
  symbol: string;
  verifiedAt: string;
  supply: string;
  balances: { participant: string; merchant: string; outsider: string };
  gas: { participant: string; admin: string };
  wallets: { participant: string; merchant: string; outsider: string };
  eligibility: { participant: number; merchant: number; outsider: number; minimum: number; source: string };
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

  const funded = state && !loading && Number(state.balances.participant) > 0;
  return (
    <main className="workspace">
      <header className="site-header workspace-header">
        <Link href="/" className="wordmark"><span className="logo-mark" aria-hidden="true">⌂</span> CITY MONEY<span className="wordmark-period">.</span></Link>
        <span className="workspace-header-label">NEIGHBORHOOD SANDBOX <span aria-hidden="true">·</span> MONAD TESTNET</span>
        <a className="receipt-nav" href="#receipts">See proof ↓</a>
        <Link className="back-link" href="/"><span className="back-link-full">← Back to the story</span><span className="back-link-short">← Story</span></Link>
      </header>
      <div className="workspace-wrap">
        <div className="workspace-intro"><p className="eyebrow">01 / THE NEIGHBORHOOD</p><h1>Your little corner<br /><em>of the city.</em></h1><p>One fictional program. One prepared participant. One test merchant whose recorded identity meets the configured level. Nothing here represents real money or real identity verification.</p></div>
        <div className="workspace-columns">
          <section className="merchant-panel" aria-labelledby="merchant-heading">
            <div className="merchant-panel-top"><span>CORNER NO. 01 / 01</span><span className="merchant-mark">LOCAL SPOT <span aria-hidden="true">↗</span></span></div>
            <div className="merchant-illustration"><span className="merchant-orbit" aria-hidden="true">✳</span><CityScene compact /><span className="merchant-caption">A GOOD PLACE<br />TO STOP BY.</span></div>
            <div className="merchant-panel-bottom"><div><p className="eyebrow">A FICTIONAL DEMO MERCHANT</p><h2 id="merchant-heading">Corner Table</h2><p>Prepared wallet · registration fixture level {evidence.roles.merchant.cvi.subTier}</p></div><span className="merchant-number">01</span></div>
          </section>
          <section className="voucher-panel" aria-labelledby="voucher-heading">
            <div className="voucher-panel-top"><span>YOUR TEST VOUCHER</span><span>CM / 01</span></div>
            <p className="voucher-label">Available from the real CVA</p>
            <h2 id="voucher-heading" className="voucher-value">{loading ? '···' : state ? state.balances.participant : '—'}<span> CITYCM</span></h2>
            <p className="voucher-footnote">{loading ? 'Reading Monad testnet…' : error ? 'Balance unavailable — do not assume funds exist.' : `On-chain at block ${state?.block.toLocaleString()}`}</p>
            <div className="voucher-divider" />
            <div className="voucher-detail"><span>PARTICIPANT</span><a href={`https://testnet.monadscan.com/address/${evidence.roles.participant.address}`} target="_blank" rel="noopener noreferrer" aria-label="View prepared participant address on MonadScan" title={evidence.roles.participant.address}>{shortAddress(evidence.roles.participant.address)} ↗</a></div>
            <div className="voucher-detail"><span>MERCHANT</span><a href={`https://testnet.monadscan.com/address/${evidence.roles.merchant.address}`} target="_blank" rel="noopener noreferrer" aria-label="View prepared merchant address on MonadScan" title={evidence.roles.merchant.address}>{shortAddress(evidence.roles.merchant.address)} ↗</a></div>
            <div className="voucher-detail"><span>IDENTITY LEVEL</span><span>Registration fixture · {evidence.roles.participant.cvi.subTier}</span></div>
            <p className="voucher-warning" role="status">{loading ? 'Checking on-chain credits. No balance has been confirmed for this read yet.' : error || (funded ? 'Credits confirmed on-chain. The first 5-credit merchant payment is in the receipts below; live checkout is not enabled in this version.' : 'This participant wallet has no available credits. This is a live balance—not a simulated allocation.')}</p>
            <button className="button-pay" type="button" disabled>Live checkout not yet available <span aria-hidden="true">↗</span></button>
            <button className="refresh-button" type="button" onClick={() => void refresh()} disabled={loading}>↻ Refresh chain balance</button>
          </section>
        </div>
        <section className="boundary-panel" aria-labelledby="boundary-heading"><span className="boundary-index">02 / THE BOUNDARY</span><div><h2 id="boundary-heading">The rules travel with the credits.</h2><p>A funded 1-credit transfer to the level-1 outsider was mined and failed at the actual Cleanverse policy verifier. Its trace read the outsider CVI and returned the outsider address, rule value 69 and observed level 1. At that block, participant / merchant / outsider balances stayed 15 / 5 / 0.</p></div><a href={`https://testnet.monadscan.com/tx/${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer">Inspect failed tx ↗</a></section>
        <section id="receipts" className="receipt-section" aria-labelledby="receipt-heading"><div className="receipt-intro"><p className="eyebrow">03 / THE PAPER TRAIL</p><h2 id="receipt-heading">The proof is in<br /><em>the receipt.</em></h2><p>A successful merchant payment and a mined rejection, not just a disabled button. Monad charges the declared gas limit—even for a policy revert—so the transaction trace, not gas-limit equality, identifies the failure.</p></div><div className="receipt-list">
          <a href={`https://testnet.monadscan.com/tx/${evidence.issuanceTx}`} target="_blank" rel="noopener noreferrer"><span>01 / ISSUANCE</span><strong>City Money CVA issued</strong><small>Confirmed · CITYCM · 6 decimals</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${evidence.roles.merchant.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>02 / ELIGIBLE FIXTURE</span><strong>Merchant CVI registered</strong><small>Confirmed · test identity level 70 at registration</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${evidence.roles.outsider.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>03 / BOUNDARY FIXTURE</span><strong>Outsider CVI registered</strong><small>Confirmed · test identity level 1 at registration</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${transactions.transactions.mint.hash}`} target="_blank" rel="noopener noreferrer"><span>04 / TEST ALLOCATION</span><strong>20 CITYCM minted</strong><small>Confirmed · participant wallet · receipt status 1</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${transactions.transactions.payment.hash}`} target="_blank" rel="noopener noreferrer"><span>05 / PAYMENT</span><strong>5 credits to Corner Table</strong><small>Confirmed · prepared merchant · receipt status 1</small><span aria-hidden="true">↗</span></a>
          <a className="receipt-declined" href={`https://testnet.monadscan.com/tx/${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer"><span>06 / POLICY REJECTION</span><strong>1 credit to outsider failed</strong><small>Reverted · rule 69 vs identity level 1 · balances unchanged · status 0</small><span aria-hidden="true">↗</span></a>
        </div></section>
        <p className="workspace-fine-print">Sandbox identities were created without identity documents. Registration levels are issuer-assigned test attributes, not live CVI reads or proof of residence. Balances are read from the token contract on refresh. {state && `Last balance read ${new Date(state.verifiedAt).toLocaleString()}.`}</p>
      </div>
    </main>
  );
}
