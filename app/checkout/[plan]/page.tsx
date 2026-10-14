import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan } from "../../../lib/memberships";
import { canAcceptPayment } from "../../../lib/publication-policy";
export default async function Checkout({params}:{params:Promise<{plan:string}>}){
 const {plan:id}=await params;
 const plan=getPlan(id);
 if(!plan)notFound();
 const enabled=canAcceptPayment();
 return <main className="shell" style={{maxWidth:760,paddingTop:70,paddingBottom:90}}>
  <Link href="/#membership" className="muted">← Back to membership plans</Link>
  <p className="eyebrow" style={{marginTop:30}}>FIM ADDIS MEMBERSHIP</p>
  <h1 style={{fontSize:"clamp(35px,5vw,55px)",marginBottom:12}}>{plan.id.charAt(0).toUpperCase()+plan.id.slice(1)}</h1>
  <p className="muted">Membership access for 30 days · M-PESA payment · manually verified</p>
  <div className="plan" style={{minHeight:0,marginTop:28}}>
   <span className="plan-count">MEMBERSHIP SUMMARY</span>
   <h2 style={{fontSize:38,margin:"18px 0 6px"}}>{plan.priceEtb===null?"Price not set":plan.priceEtb.toLocaleString("en-US")+" ETB"} <span className="muted" style={{fontSize:14}}>/ month</span></h2>
   <ul className="feature-list">{plan.features.map(f=><li key={f.en}>{f.en}</li>)}</ul>
  </div>
  <section aria-label="M-PESA payment details" className="checkout-note" style={{marginTop:24}}>
   <h2 style={{fontSize:22,marginBottom:16}}>M-PESA payment details</h2>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16}}>
    <div style={{padding:16,border:"1px solid var(--line)"}}>
     <p className="muted" style={{fontSize:13,margin:0}}>M-PESA receiving number</p>
     <strong style={{display:"block",marginTop:9}}>To be provided</strong>
     <p className="muted" style={{fontSize:12,marginBottom:0}}>Placeholder — not a payment destination</p>
    </div>
    <div style={{padding:16,border:"1px solid var(--line)"}}>
     <p className="muted" style={{fontSize:13,margin:0}}>Official Telegram receipt account</p>
     <strong style={{display:"block",marginTop:9}}>To be provided</strong>
     <p className="muted" style={{fontSize:12,marginBottom:0}}>Placeholder — no Telegram link is active</p>
    </div>
   </div>
   <p className="muted" style={{fontSize:13,marginTop:17}}>Receipt upload on the website: not available yet. After launch, choose website upload or send proof through the official Telegram account, with manual payment verification.</p>
  </section>
  <section className="checkout-note" role="status">
   <strong>{enabled?"Payment available":"Payment enrollment isn't open yet"}</strong>
   <p>{enabled?"Continue using the authenticated payment workflow.":"This is a price preview only; no order or payment has been created. M-PESA checkout will open once the official receiving number, receipt submission, and manual approval workflow are configured."}</p>
   <p>When checkout opens, you can submit your M-PESA transaction reference and receipt privately on the website or send proof to the verified Telegram account displayed here. Membership only activates after we verify the payment. Never send funds to a number or Telegram contact that has not been confirmed on this website.</p>
  </section>
 </main>;
}
