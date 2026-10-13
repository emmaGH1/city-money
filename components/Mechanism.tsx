export function Mechanism({ compact = false }: { compact?: boolean }) {
  return <div className={`mechanism ${compact ? 'mechanism-compact' : ''}`} aria-label="Cleanverse identity eligibility, CVA enforcement, Monad settlement">
    <div><span>CLEANVERSE CVI</span><strong>Who qualifies.</strong></div><span className="mechanism-arrow" aria-hidden="true">→</span>
    <div><span>CLEANVERSE CVA</span><strong>The rule travels.</strong></div><span className="mechanism-arrow" aria-hidden="true">→</span>
    <div><span>MONAD</span><strong>The payment settles.</strong></div>
  </div>;
}
