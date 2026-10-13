'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const questions = [
  ['What is real?', 'The Cleanverse-issued CVA, on-chain balances, merchant payments and mined failure are real Monad testnet evidence. The neighborhood and identities are fictional; the credits have no real-money value.'],
  ['Do I need a wallet?', 'No. Checkout uses one shared prepared participant wallet, held server-side. Payments are capped at 1–5 whole credits and can go only to Corner Table. The issuer key is not deployed, and there is no public mint or reset.'],
  ['What does eligibility mean here?', 'The asset uses Cleanverse’s issuer-configured identity-level rule. The prepared participant and merchant were registered at level 70; the comparison identity at level 1. These are registration fixtures, not real KYC or geographic residency checks. Other valid identities meeting the rule may qualify too.'],
  ['What would a real pilot need?', 'An agreed issuer and funding model, real participant onboarding, and merchant redemption or settlement. There is no government partner, fiat backing or production-compliance claim in this sandbox.'],
];
export function SandboxFAQ() {
  return <Accordion className="sandbox-faq" type="single" collapsible>{questions.map(([question, answer], index) => <AccordionItem value={`question-${index}`} key={question}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent>{answer}</AccordionContent></AccordionItem>)}</Accordion>;
}
