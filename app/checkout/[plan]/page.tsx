import CustomerTierHeader from "../../../components/customer-tier-header";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getPlan} from "../../../lib/memberships";
import {getViewer} from "../../../lib/member";
import {getAccountReview} from "../../../lib/account-approval";
import {db} from "../../../lib/admin";
import {canAcceptPayment} from "../../../lib/publication-policy";
import PaymentForm from "../payment-form";
export const dynamic="force-dynamic";
export default async function Checkout({params}:{params:Promise<{plan:string}>}){
 const {plan:id}=await params; const plan=getPlan(id);if(!plan)notFound();
 const [viewer,flags]=await Promise.all([getViewer(),db()`SELECT value FROM public.fim_site_settings WHERE key='payments_open'`]);
 const enabled=canAcceptPayment()&&flags[0]?.value==="true";
 const review=viewer?await getAccountReview(viewer.id):null;
 const canPay=enabled&&Boolean(viewer)&&review?.status!=="rejected";
 const number="251708195264";const telegram=process.env.FIM_TELEGRAM_USERNAME||"keithify";
 return <main className="shell" style={{maxWidth:820,paddingTop:65,paddingBottom:90}}>
 <CustomerTierHeader/>
 <Link href="/membership" className="muted">← Memberships</Link><p className="eyebrow" style={{marginTop:30}}>MEMBERSHIP CHECKOUT</p>
 <h1 className="page-title">{plan.id.charAt(0).toUpperCase()+plan.id.slice(1)}</h1><p className="muted">30 days per confirmed payment · manual payment verification</p>
 <div className="account-panel" style={{marginTop:28}}><p className="eyebrow">Membership summary</p><h2>{Number(plan.priceEtb).toLocaleString()} ETB <small className="muted" style={{fontSize:14,fontWeight:400}}>/ 30 days</small></h2><ul className="feature-list">{plan.features.map(f=><li key={f.en}>{f.en}</li>)}</ul></div>
 <div className="payment-method-grid">
 <section className="account-panel"><p className="eyebrow">PAYMENT RECIPIENT</p><h2>{number}</h2><p><strong>Semira Musa</strong></p><p className="muted">Pay only when the payment submission form is available. Keep your transaction reference and upload a screenshot for review.</p></section>
 <section className="account-panel"><p className="eyebrow">TELEGRAM RECEIPTS</p><h2>{canPay?"@"+telegram:"Available after approval"}</h2>{canPay&&<a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="subtle-link">Open Telegram ↗</a>}<p className="muted">The official contact appears here when your account and checkout are active.</p></section>
 </div>
 {!viewer?<section className="checkout-note"><strong>Sign in or create an account first</strong><p>Register and choose this membership. Free access is immediate; paid membership activates after payment verification.</p><Link href="/account/login" className="btn">Sign in / Sign up →</Link></section>
 :review?.status==="rejected"?<section className="checkout-note"><strong>Account declined</strong><p>Your account cannot submit payments. {review.reviewNote||"Please contact the Fim Addis team for further information."}</p><Link href="/account" className="subtle-link">Account status →</Link></section>
 :review?.status!=="approved"?<section className="checkout-note"><strong>Awaiting account approval</strong><p>You've selected your plan. An administrator must approve your account before you can pay. No transfer is required now.</p><Link href="/account" className="subtle-link">Check account status →</Link></section>
 :!enabled?<section className="checkout-note" role="status"><strong>Payments aren't open yet</strong><p>Your account is approved, but M-PESA enrollment is still disabled. Do not transfer funds until checkout opens.</p></section>
 :<PaymentForm plan={plan.id} telegram={telegram}/>}

 <p className="disclaimer">Transfers must be independently confirmed by Fim Addis. Uploaded receipts and Telegram messages never activate membership automatically. Any payment dispute should be directed to the contact details displayed on this website. Purchase-only films are not included in membership plans.</p>
 </main>;
}
