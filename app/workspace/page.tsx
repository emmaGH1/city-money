'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

type Checkout = { available: boolean; remaining: number; reason: string };
type PaymentReceipt = { status: 'confirmed' | 'pending' | 'reverted' | 'unknown' | 'unconfirmed'; hash: string; explorer: string; message: string; amount?: string; block?: number };

function paymentReceipt(value: unknown): PaymentReceipt | null {
  if (!value || typeof value !== 'object') return null;
  const result = value as Record<string, unknown>;
  if (typeof result.hash !== 'string' || !/^0x[\da-f]{64}$/i.test(result.hash) || result.explorer !== `https://testnet.monadscan.com/tx/${result.hash}` || typeof result.message !== 'string' || !['confirmed', 'pending', 'reverted', 'unknown', 'unconfirmed'].includes(String(result.status))) return null;
  if (result.status === 'confirmed' && (typeof result.amount !== 'string' || !/^\d+(?:\.\d+)?$/.test(result.amount) || typeof result.block !== 'number')) return null;
  return result as PaymentReceipt;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Workspace() {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [checkingCheckout, setCheckingCheckout] = useState(true);
  const [amount, setAmount] = useState('1');
  const [review, setReview] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [submissionUnknown, setSubmissionUnknown] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [checkingBoundary, setCheckingBoundary] = useState(false);
  const [boundaryResult, setBoundaryResult] = useState('');
  const confirmRef = useRef<HTMLButtonElement>(null);
  const reviewRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    setCheckingCheckout(true);
    setCheckout(null);
    const timeout = AbortSignal.timeout(15000);
    const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const readCheckout = (async () => {
      try {
        const response = await fetch('/api/checkout', { cache: 'no-store', signal: requestSignal });
        const result = await response.json();
        if (typeof result.available !== 'boolean' || typeof result.remaining !== 'number' || typeof result.reason !== 'string') throw new Error('Checkout status unavailable');
        if (!signal?.aborted) setCheckout(result as Checkout);
      } catch {
        if (!signal?.aborted) setCheckout({ available: false, remaining: 0, reason: 'Checkout status is unavailable. No payment can be assumed.' });
      } finally {
        if (!signal?.aborted) setCheckingCheckout(false);
      }
    })();
    try {
      const response = await fetch('/api/state', { cache: 'no-store', signal: requestSignal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Chain check failed');
      setState(result as State);
    } catch (cause) {
      if (signal?.aborted) return;
      setState(null);
      setError(cause instanceof Error ? cause.message : 'Chain check failed');
    } finally {
      if (!signal?.aborted) setLoading(false);
      await readCheckout;
    }
  }, []);

  const recheckReceipt = useCallback(async (hash: string, signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/checkout?receipt=${encodeURIComponent(hash)}`, { cache: 'no-store', signal: signal ?? AbortSignal.timeout(15000) });
      const result = paymentReceipt(await response.json());
      if (result && !signal?.aborted) setReceipt(result);
    } catch {
      if (!signal?.aborted) setPayError('The last receipt cannot be rechecked right now. Inspect its explorer link before trying again.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    try {
      const hash = sessionStorage.getItem('city-money.last-payment');
      if (hash && /^0x[\da-f]{64}$/i.test(hash)) void recheckReceipt(hash, controller.signal);
    } catch { /* Storage is optional; the receipt remains inspectable on-chain. */ }
    return () => controller.abort();
  }, [refresh, recheckReceipt]);

  useEffect(() => { if (review) confirmRef.current?.focus(); }, [review]);

  const sendPayment = async () => {
    setPaying(true);
    setPayError('');
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }), signal: AbortSignal.timeout(60000) });
      const result = await response.json();
      const actualReceipt = paymentReceipt(result);
      if (actualReceipt) {
        setReceipt(actualReceipt);
        try { sessionStorage.setItem('city-money.last-payment', actualReceipt.hash); } catch { /* Optional local history. */ }
      } else if (!response.ok) {
        setPayError(typeof result.error === 'string' ? result.error : 'No payment was confirmed. Refresh before trying again.');
      } else {
        setSubmissionUnknown(true);
        setPayError('The response did not establish a payment outcome. Inspect the participant wallet before trying again.');
      }
      setReview(false);
      await refresh();
    } catch {
      setSubmissionUnknown(true);
      setPayError('Payment request interrupted; its outcome is unknown. Do not submit again blindly. Inspect the participant wallet and refresh the live balance.');
      setReview(false);
    } finally {
      setPaying(false);
    }
  };

  const testBoundary = async () => {
    setCheckingBoundary(true);
    setBoundaryResult('Checking the actual CVA in a read-only call…');
    try {
      const response = await fetch('/api/boundary', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (result.result === 'rejected') setBoundaryResult(`Fresh read-only call rejected: rule ${result.ruleValue}, outsider level ${result.identityLevel}. This click did not broadcast a transaction; the earlier mined rejection is linked alongside it.`);
      else setBoundaryResult(typeof result.message === 'string' ? result.message : 'The current policy could not be confirmed. No rejection is assumed.');
    } catch {
      setBoundaryResult('The current policy check is unavailable. The historical mined receipt remains inspectable; no new outcome is assumed.');
    } finally { setCheckingBoundary(false); }
  };

  const funded = state && !loading && Number(state.balances.participant) > 0;
  const unresolvedReceipt = receipt && !['confirmed', 'reverted'].includes(receipt.status);
  const canPay = Boolean(funded && checkout?.available && !checkingCheckout && /^[1-5]$/.test(amount) && !paying && !submissionUnknown && !unresolvedReceipt);
  return (
    <main className="workspace">
      <header className="site-header workspace-header">
        <Link href="/" className="wordmark"><span className="logo-mark" aria-hidden="true">⌂</span> CITY MONEY<span className="wordmark-period">.</span></Link>
        <span className="workspace-header-label">NEIGHBORHOOD SANDBOX <span aria-hidden="true">·</span> MONAD TESTNET</span>
        <a className="receipt-nav" href="#receipts">See proof ↓</a>
        <Link className="back-link" href="/"><span className="back-link-full">← Back to the story</span><span className="back-link-short">← Story</span></Link>
      </header>
      <div className="workspace-wrap">
        <div className="workspace-intro"><p className="eyebrow">01 / THE NEIGHBORHOOD</p><h1>Your little corner<br /><em>of the city.</em></h1><p>One fictional program. One shared, prepared test wallet. One Corner Table merchant. Checkout signs only limited test credits on Monad testnet—not your wallet or real money.</p></div>
        <div className="workspace-columns">
          <section className="merchant-panel" aria-labelledby="merchant-heading">
            <div className="merchant-panel-top"><span>CORNER NO. 01 / 01</span><span className="merchant-mark">SELECTED MERCHANT <span aria-hidden="true">✓</span></span></div>
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
            <p className="voucher-warning" role="status">{loading ? 'Checking on-chain credits. No balance has been confirmed for this read yet.' : error || (paying ? 'Submitting a real testnet payment. Nothing is marked paid until a receipt and exact balance changes are confirmed.' : checkingCheckout ? 'Credits read from the actual CVA. Checking the shared checkout budget…' : checkout?.available ? `Real credits confirmed. ${checkout.remaining} of two additional live checkouts remain for this shared test wallet.` : checkout?.reason || 'Live checkout cannot be confirmed; inspect the recorded receipts.')}</p>
            {review ? <div className="checkout-confirm" role="group" aria-labelledby="confirm-heading"><h3 id="confirm-heading">A small payment.<br />A real transaction.</h3><dl><div><dt>AMOUNT</dt><dd>{amount} CITYCM</dd></div><div><dt>TO</dt><dd>Corner Table only</dd></div><div><dt>SIGNER</dt><dd>Prepared sandbox wallet</dd></div></dl><p>Monad testnet · maximum fee budget 0.06 test MON. The issuer key is not deployed.</p><button ref={confirmRef} className="button-pay" type="button" onClick={() => void sendPayment()} disabled={!canPay}>{paying ? 'Awaiting real confirmation…' : 'Confirm test payment'}<span aria-hidden="true">↗</span></button><button className="checkout-cancel" type="button" disabled={paying} onClick={() => { setReview(false); requestAnimationFrame(() => reviewRef.current?.focus()); }}>Back to amount</button></div> : <div className="checkout-entry"><label htmlFor="checkout-amount">TEST CREDITS <span>1–5, whole amounts</span></label><div className="checkout-amount"><input id="checkout-amount" type="number" inputMode="numeric" min="1" max="5" step="1" value={amount} disabled={paying || !checkout?.available} onChange={event => setAmount(event.target.value)} /><span>CITYCM</span></div><button ref={reviewRef} className="button-pay" type="button" disabled={!canPay} onClick={() => { setReview(true); setPayError(''); }}>{checkingCheckout || loading ? 'Checking checkout…' : checkout?.available ? 'Review payment' : 'Checkout unavailable'}<span aria-hidden="true">↗</span></button></div>}
            {payError && <p className="checkout-error" role="alert">{payError}</p>}
            {receipt && <div className={`checkout-receipt ${receipt.status === 'confirmed' ? 'confirmed' : ''}`} role="status"><span>{receipt.status === 'confirmed' ? 'PAYMENT CONFIRMED' : receipt.status.toUpperCase()}</span><strong>{receipt.status === 'confirmed' ? `${receipt.amount} CITYCM reached Corner Table.` : receipt.message}</strong>{receipt.block && <small>Monad testnet · block {receipt.block.toLocaleString()}</small>}<a href={receipt.explorer} target="_blank" rel="noopener noreferrer">Inspect this transaction ↗</a>{unresolvedReceipt && <button type="button" className="refresh-button" onClick={() => void recheckReceipt(receipt.hash)}>Recheck receipt</button>}</div>}
            <button className="refresh-button" type="button" onClick={() => void refresh()} disabled={loading || checkingCheckout || paying}>↻ Refresh balance &amp; checkout</button>
            <p className="checkout-disclosure">Shared test-wallet signing. Two extra payments total; max 5 CITYCM each, fixed merchant only. No public mint, issuer or identity-admin controls.</p>
          </section>
        </div>
        <section className="boundary-panel" aria-labelledby="boundary-heading"><span className="boundary-index">02 / THE BOUNDARY</span><div><h2 id="boundary-heading">The rules travel with the credits.</h2><p>A funded 1-credit transfer to the level-1 outsider was mined and failed at the actual Cleanverse policy verifier. Its trace read the outsider CVI and returned the outsider address, rule value 69 and observed level 1. At that historical block, participant / merchant / outsider balances stayed 15 / 5 / 0.</p>{boundaryResult && <p className="boundary-result" role="status">{boundaryResult}</p>}</div><div className="boundary-actions"><button className="boundary-try" type="button" disabled={!funded || checkingBoundary || paying} onClick={() => void testBoundary()}>{checkingBoundary ? 'Reading the contract…' : 'Try outsider (read-only)'}</button><a href={`https://testnet.monadscan.com/tx/${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer">Inspect mined failure ↗</a></div></section>
        <section id="receipts" className="receipt-section" aria-labelledby="receipt-heading"><div className="receipt-intro"><p className="eyebrow">03 / THE PAPER TRAIL</p><h2 id="receipt-heading">The proof is in<br /><em>the receipt.</em></h2><p>A successful merchant payment and a mined rejection, not just a disabled button. Monad charges the declared gas limit—even for a policy revert—so the transaction trace, not gas-limit equality, identifies the failure.</p></div><div className="receipt-list">
          <a href={`https://testnet.monadscan.com/tx/${evidence.issuanceTx}`} target="_blank" rel="noopener noreferrer"><span>01 / ISSUANCE</span><strong>City Money CVA issued</strong><small>Confirmed · CITYCM · 6 decimals</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${evidence.roles.merchant.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>02 / ELIGIBLE FIXTURE</span><strong>Merchant CVI registered</strong><small>Confirmed · test identity level 70 at registration</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${evidence.roles.outsider.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>03 / BOUNDARY FIXTURE</span><strong>Outsider CVI registered</strong><small>Confirmed · test identity level 1 at registration</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${transactions.transactions.mint.hash}`} target="_blank" rel="noopener noreferrer"><span>04 / TEST ALLOCATION</span><strong>20 CITYCM minted</strong><small>Confirmed · participant wallet · receipt status 1</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${transactions.transactions.payment.hash}`} target="_blank" rel="noopener noreferrer"><span>05 / PAYMENT</span><strong>5 credits to Corner Table</strong><small>Confirmed · prepared merchant · receipt status 1</small><span aria-hidden="true">↗</span></a>
          <a className="receipt-declined" href={`https://testnet.monadscan.com/tx/${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer"><span>06 / POLICY REJECTION</span><strong>1 credit to outsider failed</strong><small>Reverted · rule 69 vs identity level 1 · balances unchanged · status 0</small><span aria-hidden="true">↗</span></a>
        </div></section>
        <p className="workspace-fine-print">Sandbox identities were created without identity documents. Registration labels are not live CVI reads or proof of residence; the actual CVA rechecks its policy on transfer. This wallet and its two-payment budget are shared, so other visitors can change live balances. The outsider button performs a read-only call, not another mined transaction. {state && `Last balance read ${new Date(state.verifiedAt).toLocaleString()}.`}</p>
      </div>
    </main>
  );
}
