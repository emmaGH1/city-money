'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CityScene } from '../../components/CityScene';
import evidence from '../../docs/fixture-evidence.json';
import transactions from '../../docs/transaction-evidence.json';
import { signedPayment } from '../../lib/payment-intent';
import { maxLivePayments } from '../../lib/demo-limits';
import { SiteHeader } from '../../components/SiteHeader';
import { Mechanism } from '../../components/Mechanism';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

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
type PaymentReceipt = { status: 'confirmed' | 'pending' | 'reverted' | 'unknown' | 'unconfirmed' | 'superseded'; hash: string; explorer: string; message: string; amount?: string; block?: number };
type PaymentIntent = { transaction: string; hash: string; nonce: number; amount: string };
const intentStorage = 'city-money.payment-intent-v2';
function paymentIntent(value: unknown): PaymentIntent | null {
  if (!value || typeof value !== 'object') return null;
  const intent = value as PaymentIntent;
  try {
    const signed = signedPayment(intent.transaction, { chainId: evidence.chainId, token: evidence.cva, participant: evidence.roles.participant.address, merchant: evidence.roles.merchant.address, firstNonce: 2, limit: maxLivePayments });
    if (signed.hash !== intent.hash || signed.tx.nonce !== intent.nonce || String(signed.amount / 1000000n) !== String(Number(intent.amount))) return null;
    return intent;
  } catch { return null; }
}

function paymentReceipt(value: unknown): PaymentReceipt | null {
  if (!value || typeof value !== 'object') return null;
  const result = value as Record<string, unknown>;
  if (typeof result.hash !== 'string' || !/^0x[\da-f]{64}$/i.test(result.hash) || result.explorer !== `https://testnet.monadscan.com/tx/${result.hash}` || typeof result.message !== 'string' || !['confirmed', 'pending', 'reverted', 'unknown', 'unconfirmed', 'superseded'].includes(String(result.status))) return null;
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
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
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

  const recheckReceipt = useCallback(async (hash: string, signal?: AbortSignal, nonce?: number) => {
    try {
      const response = await fetch(`/api/checkout?receipt=${encodeURIComponent(hash)}${nonce === undefined ? '' : `&nonce=${nonce}`}`, { cache: 'no-store', signal: signal ?? AbortSignal.timeout(15000) });
      const result = paymentReceipt(await response.json());
      if (result && !signal?.aborted) { setReceipt(result); if (['confirmed', 'reverted', 'superseded'].includes(result.status)) setSubmissionUnknown(false); }
    } catch {
      if (!signal?.aborted) setPayError('The last receipt cannot be rechecked right now. Inspect its explorer link before trying again.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    try {
      const saved = localStorage.getItem(intentStorage);
      const recovered = saved ? paymentIntent(JSON.parse(saved)) : null;
      if (recovered) {
        setIntent(recovered);
        setSubmissionUnknown(true);
        void recheckReceipt(recovered.hash, controller.signal, recovered.nonce);
        return () => controller.abort();
      }
      const hash = sessionStorage.getItem('city-money.last-payment');
      if (hash && /^0x[\da-f]{64}$/i.test(hash)) void recheckReceipt(hash, controller.signal);
    } catch { /* Storage is optional; the receipt remains inspectable on-chain. */ }
    return () => controller.abort();
  }, [refresh, recheckReceipt]);

  useEffect(() => { if (review) confirmRef.current?.focus(); }, [review]);

  const sendPayment = async (retry?: PaymentIntent) => {
    setPaying(true);
    setPayError('');
    let attemptedBroadcast = false;
    try {
      let prepared = retry;
      if (!prepared) {
        const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'prepare', amount }), signal: AbortSignal.timeout(45000) });
        const result = await response.json();
        prepared = paymentIntent(result) ?? undefined;
        if (!prepared) throw new Error('No signed payment was established.');
        try { localStorage.setItem(intentStorage, JSON.stringify(prepared)); }
        catch { setPayError('Browser storage is unavailable. No payment was broadcast; enable storage before paying.'); setReview(false); return; }
        setIntent(prepared);
      }
      setSubmissionUnknown(true);
      attemptedBroadcast = true;
      setReceipt({ status: 'pending', hash: prepared.hash, explorer: `https://testnet.monadscan.com/tx/${prepared.hash}`, message: 'Submitting the saved payment and checking its real receipt.' });
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'broadcast', transaction: prepared.transaction }), signal: AbortSignal.timeout(60000) });
      const result = await response.json();
      const actualReceipt = paymentReceipt(result);
      if (actualReceipt) {
        setReceipt(actualReceipt);
        setSubmissionUnknown(!['confirmed', 'reverted', 'superseded'].includes(actualReceipt.status));
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
      setSubmissionUnknown(attemptedBroadcast);
      setPayError(attemptedBroadcast ? 'Payment request interrupted. Your exact payment is saved; recheck its hash or resend those same signed bytes. Do not create a new payment.' : 'A signed payment could not be prepared. No broadcast was attempted.');
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
  const unresolvedReceipt = receipt && !['confirmed', 'reverted', 'superseded'].includes(receipt.status);
  const canPay = Boolean(funded && checkout?.available && !checkingCheckout && /^[1-5]$/.test(amount) && !paying && !submissionUnknown && !unresolvedReceipt);
  return (
    <main className="workspace">
      <SiteHeader workspace />
      <div className="workspace-wrap">
        <div className="workspace-intro"><h1>Take it to <em>Corner Table.</em></h1><p>Use shared program credits at the neighborhood merchant. Every balance comes from the genuine Cleanverse asset, every payment settles on Monad.</p></div>
        <Mechanism compact />
        <ol className="workspace-steps" aria-label="Your payment journey"><li className={funded ? 'step-ready' : ''}><span>01</span><div><strong>Voucher funded</strong><small>Prepared allocation</small></div></li><li className={review || paying ? 'step-ready' : ''}><span>02</span><div><strong>Pay Corner Table</strong><small>Choose 1–5 credits</small></div></li><li className={receipt?.status === 'confirmed' ? 'step-ready' : ''}><span>03</span><div><strong>Inspect the receipt</strong><small>Actual Monad settlement</small></div></li></ol>
        <div className="workspace-columns">

          <section className="voucher-panel" aria-labelledby="voucher-heading">
            <div className="voucher-panel-top"><span>PROGRAM VOUCHER</span><span>CM / 01</span></div>
            <p className="voucher-label">Available from the real CVA</p>
            <h2 id="voucher-heading" className="voucher-value">{loading ? '···' : state ? state.balances.participant : '—'}<span> CITYCM</span></h2>
            <p className="voucher-footnote">{loading ? 'Reading Monad testnet…' : error ? 'Balance unavailable — do not assume funds exist.' : `On-chain at block ${state?.block.toLocaleString()}`}</p>
            <div className="voucher-divider" />
            <div className="voucher-detail"><span>PARTICIPANT</span><a href={`https://testnet.monadscan.com/address/${evidence.roles.participant.address}`} target="_blank" rel="noopener noreferrer" aria-label="View prepared participant address on MonadScan" title={evidence.roles.participant.address}>{shortAddress(evidence.roles.participant.address)} ↗</a></div>
            <div className="voucher-detail"><span>MERCHANT</span><a href={`https://testnet.monadscan.com/address/${evidence.roles.merchant.address}`} target="_blank" rel="noopener noreferrer" aria-label="View prepared merchant address on MonadScan" title={evidence.roles.merchant.address}>{shortAddress(evidence.roles.merchant.address)} ↗</a></div>
            <div className="voucher-detail"><span>IDENTITY LEVEL</span><span>Registration fixture · {evidence.roles.participant.cvi.subTier}</span></div>
            <p className="voucher-warning" role="status">{loading ? 'Checking on-chain credits. No balance has been confirmed for this read yet.' : error || (paying ? 'Submitting a real testnet payment. Nothing is marked paid until a successful receipt and exact Transfer event are verified.' : checkingCheckout ? 'Credits read from the actual CVA. Checking the shared checkout budget…' : checkout?.available ? `Real credits confirmed. ${checkout.remaining} shared demo checkouts remain.` : checkout?.reason || 'Live checkout cannot be confirmed; inspect the recorded receipts.')}</p>
            <Dialog open={review} onOpenChange={setReview}><div className="checkout-entry"><Label htmlFor="checkout-amount">PAYMENT AMOUNT <span>1–5 whole credits</span></Label><div className="checkout-amount"><Input id="checkout-amount" type="number" inputMode="numeric" min="1" max="5" step="1" value={amount} disabled={paying || !checkout?.available || Boolean(unresolvedReceipt)} onChange={event => setAmount(event.target.value)} /><span>CITYCM</span></div><div className="amount-presets">{['1', '3', '5'].map(value => <Button key={value} variant="outline" type="button" className={amount === value ? 'amount-selected' : ''} disabled={paying || !checkout?.available || Boolean(unresolvedReceipt)} onClick={() => setAmount(value)}>{value} {value === '1' ? 'credit' : 'credits'}</Button>)}</div><DialogTrigger asChild><Button ref={reviewRef} className="button-pay" type="button" disabled={!canPay} onClick={() => setPayError('')}>{checkingCheckout || loading ? 'Checking checkout…' : checkout?.available ? 'Review payment to Corner Table' : 'Checkout unavailable'}<span aria-hidden="true">↗</span></Button></DialogTrigger></div>
            <DialogContent className="city-confirm"><DialogHeader><DialogTitle>A small payment.<br /><em>Real settlement.</em></DialogTitle><DialogDescription>Review the benefit you're sending. The prepared participant wallet signs; your personal wallet is not involved.</DialogDescription></DialogHeader><dl className="confirm-details"><div><dt>Amount</dt><dd>{amount} CITYCM</dd></div><div><dt>Recipient</dt><dd>Corner Table</dd></div><div><dt>Network</dt><dd>Monad testnet</dd></div><div><dt>Signer</dt><dd>Shared prepared wallet</dd></div></dl><p className="confirm-note">Fixed recipient · maximum fee 0.06 test MON. The exact transaction is saved before broadcast so it can be recovered.</p><Button ref={confirmRef} className="button-pay" type="button" onClick={() => void sendPayment()} disabled={!canPay}>{paying ? 'Confirming the real transfer…' : `Confirm ${amount}-credit payment`}<span aria-hidden="true">↗</span></Button><Button variant="ghost" type="button" onClick={() => setReview(false)}>{paying ? 'Close while we confirm' : 'Back to amount'}</Button></DialogContent></Dialog>
            {payError && <p className="checkout-error" role="alert">{payError}</p>}
            {intent && (submissionUnknown || unresolvedReceipt) && <div className="payment-recovery"><p>Your exact payment is saved on this device. Resending cannot create a second execution of its nonce.</p><Button type="button" disabled={paying} onClick={() => void recheckReceipt(intent.hash, undefined, intent.nonce)}>Recheck saved payment</Button><Button type="button" disabled={paying} onClick={() => void sendPayment(intent)}>Resend this exact payment</Button></div>}
            {receipt && <div className={`checkout-receipt ${receipt.status === 'confirmed' ? 'confirmed' : ''}`} role="status"><span>{receipt.status === 'confirmed' ? 'PAYMENT CONFIRMED' : receipt.status.toUpperCase()}</span><strong>{receipt.status === 'confirmed' ? `${receipt.amount} CITYCM reached Corner Table.` : receipt.message}</strong>{receipt.block && <small>Monad testnet · block {receipt.block.toLocaleString()}</small>}<a href={receipt.explorer} target="_blank" rel="noopener noreferrer">Inspect this transaction ↗</a>{unresolvedReceipt && <Button type="button" variant="ghost" className="refresh-button" onClick={() => void recheckReceipt(receipt.hash)}>Recheck receipt</Button>}</div>}
            <Button variant="ghost" className="refresh-button" type="button" onClick={() => void refresh()} disabled={loading || checkingCheckout || paying}>↻ Refresh balance &amp; checkout</Button>
            <p className="checkout-disclosure">Shared test-wallet signing. A shared capped allowance; max 5 CITYCM per payment, fixed merchant only. No public mint, issuer or identity-admin controls.</p>
          </section>
          <section className="merchant-panel" aria-labelledby="merchant-heading">
            <div className="merchant-panel-top"><span>YOUR RECIPIENT</span><span className="merchant-mark">CORNER TABLE <span aria-hidden="true">✓</span></span></div>
            <div className="merchant-illustration"><span className="merchant-orbit" aria-hidden="true">✳</span><CityScene compact /><span className="merchant-caption">A GOOD PLACE<br />TO STOP BY.</span></div>
            <div className="merchant-panel-bottom"><div><h2 id="merchant-heading">Corner Table</h2><p>Fictional demo merchant · prepared wallet<br />Registration fixture level {evidence.roles.merchant.cvi.subTier}</p></div><span className="merchant-number">01</span></div>
          <div className="merchant-receiving"><span>MERCHANT'S ON-CHAIN BALANCE</span><strong>{loading ? '···' : state ? state.balances.merchant : '—'} <small>CITYCM</small></strong><p>{loading ? 'Reading the same settlement ledger…' : state ? `At Monad block ${state.block.toLocaleString()}` : 'Balance unavailable. No value is assumed.'}</p>{receipt?.status === 'confirmed' && <a className="merchant-incoming" href={receipt.explorer} target="_blank" rel="noopener noreferrer"><span>THIS PAYMENT RECEIVED</span><strong>+{receipt.amount} CITYCM ↗</strong></a>}</div></section>
        </div>
        <section className="boundary-panel" aria-labelledby="boundary-heading"><span className="boundary-index">THE POLICY<br />NOT A UI RULE</span><div><h2 id="boundary-heading">The asset decides<br /><em>who can receive.</em></h2><p>The issuer configured a Cleanverse identity-level rule. The prepared merchant meets it; our lower-level comparison identity does not.</p><div className="policy-comparison"><div><span>MERCHANT FIXTURE</span><strong>Level 70 <span aria-hidden="true">✓</span></strong></div><span className="policy-threshold">CVA rule<br /><strong>69</strong></span><div className="policy-outsider"><span>OUTSIDER FIXTURE</span><strong>Level 1 <span aria-hidden="true">×</span></strong></div></div><p className="policy-fixture-note">Registration snapshots, not live CVI reads. The button checks the current contract without broadcasting.</p>{boundaryResult && <p className="boundary-result" role="status">{boundaryResult}</p>}</div><div className="boundary-actions"><Button className="boundary-try" type="button" disabled={!funded || checkingBoundary || paying} onClick={() => void testBoundary()}>{checkingBoundary ? 'Checking the actual CVA…' : 'Check outsider transfer'}</Button><small>Fresh read-only contract call</small><a href={`https://testnet.monadscan.com/tx/${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer">Historical mined failure ↗</a></div></section>
        <section id="receipts" className="receipt-section" aria-labelledby="receipt-heading"><div className="receipt-intro"><h2 id="receipt-heading">The proof is in<br /><em>the receipt.</em></h2><p>A successful merchant payment and a mined rejection, not just a disabled button. Monad charges the declared gas limit—even for a policy revert—so the transaction trace, not gas-limit equality, identifies the failure.</p></div><div className="receipt-list">
          <a href={`https://testnet.monadscan.com/tx/${evidence.issuanceTx}`} target="_blank" rel="noopener noreferrer"><span>01 / ISSUANCE</span><strong>City Money CVA issued</strong><small>Confirmed · CITYCM · 6 decimals</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${evidence.roles.merchant.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>02 / ELIGIBLE FIXTURE</span><strong>Merchant CVI registered</strong><small>Confirmed · test identity level 70 at registration</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${evidence.roles.outsider.registrationTx}`} target="_blank" rel="noopener noreferrer"><span>03 / BOUNDARY FIXTURE</span><strong>Outsider CVI registered</strong><small>Confirmed · test identity level 1 at registration</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${transactions.transactions.mint.hash}`} target="_blank" rel="noopener noreferrer"><span>04 / TEST ALLOCATION</span><strong>20 CITYCM minted</strong><small>Confirmed · participant wallet · receipt status 1</small><span aria-hidden="true">↗</span></a>
          <a href={`https://testnet.monadscan.com/tx/${transactions.transactions.payment.hash}`} target="_blank" rel="noopener noreferrer"><span>05 / PAYMENT</span><strong>5 credits to Corner Table</strong><small>Confirmed · prepared merchant · receipt status 1</small><span aria-hidden="true">↗</span></a>
          <a className="receipt-declined" href={`https://testnet.monadscan.com/tx/${transactions.transactions.rejection.hash}`} target="_blank" rel="noopener noreferrer"><span>06 / POLICY REJECTION</span><strong>1 credit to outsider failed</strong><small>Reverted · rule 69 vs identity level 1 · balances unchanged · status 0</small><span aria-hidden="true">↗</span></a>
        </div></section>
        <p className="workspace-fine-print">Sandbox identities were created without identity documents. Registration labels are not live CVI reads or proof of residence; the actual CVA rechecks its policy on transfer. This wallet and its capped payment allowance are shared, so other visitors can change live balances. The outsider button performs a read-only call, not another mined transaction. {state && `Last balance read ${new Date(state.verifiedAt).toLocaleString()}.`}</p>
      </div>
    </main>
  );
}
