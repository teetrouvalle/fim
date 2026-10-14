import Link from "next/link";
import {notFound} from "next/navigation";
import {getPlan} from "../../../lib/memberships";
import {getViewer} from "../../../lib/member";
import {db} from "../../../lib/admin";
import {canAcceptPayment} from "../../../lib/publication-policy";
import PaymentForm from "../payment-form";
export const dynamic="force-dynamic";
export default async function Checkout({params}:{params:Promise<{plan:string}>}){
 const {plan:id}=await params; const plan=getPlan(id);if(!plan)notFound();
 const [viewer,flags]=await Promise.all([getViewer(),db()`SELECT value FROM public.fim_site_settings WHERE key='payments_open'`]);
 const enabled=canAcceptPayment()&&flags[0]?.value==="true";
 const number="0707070707";const telegram="keithify";
 return <main className="shell" style={{maxWidth:820,paddingTop:65,paddingBottom:90}}>
 <Link href="/membership" className="muted">← Memberships</Link><p className="eyebrow" style={{marginTop:30}}>MEMBERSHIP CHECKOUT</p>
 <h1 className="page-title">{plan.id.charAt(0).toUpperCase()+plan.id.slice(1)}</h1><p className="muted">30 days per confirmed payment · manual M-PESA verification</p>
 <div className="account-panel" style={{marginTop:28}}><p className="eyebrow">Membership summary</p><h2>{Number(plan.priceEtb).toLocaleString()} ETB <small className="muted" style={{fontSize:14,fontWeight:400}}>/ 30 days</small></h2><ul className="feature-list">{plan.features.map(f=><li key={f.en}>{f.en}</li>)}</ul></div>
 <div className="payment-method-grid">
 <section className="account-panel"><p className="eyebrow">M-PESA</p><h2>{number}</h2><p className="muted">Receiving mobile number</p></section>
 <section className="account-panel"><p className="eyebrow">TELEGRAM RECEIPTS</p><h2>@{telegram}</h2><a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="subtle-link">Open Telegram ↗</a><p className="muted">Include your transaction ID and payment reference after submitting.</p></section>
 </div>
 {!enabled?<section className="checkout-note" role="status"><strong>Payments are not open yet</strong><p>The contact details above are configured, but do not send money yet. The film catalog, payment flow, and eligibility checks are being verified before enrollment opens. No order can be submitted while payments are closed.</p></section>
 :!viewer?<section className="checkout-note"><strong>Sign in to proceed</strong><p>You need an account before submitting M-PESA proof.</p><Link href="/account/login" className="btn">Sign in or register →</Link></section>
 :!viewer.verified?<section className="checkout-note"><strong>Verify your account</strong><p>Verify your email address before submitting payment.</p><Link href="/account/login" className="btn">Verify email →</Link></section>
 :<PaymentForm plan={plan.id} telegram={telegram}/>}
 <p className="disclaimer">M-PESA transfers must be independently confirmed by Fim Addis. Uploaded receipts and Telegram messages never activate membership automatically. Any payment dispute should be directed to the contact details displayed on this website. Purchase-only films are not included in membership plans.</p>
 </main>;
}
