import CustomerTierHeader from "../../components/customer-tier-header";
import Link from "next/link";
import {redirect} from "next/navigation";
import {db} from "../../lib/admin";
import {getViewer,getEffectiveMembership} from "../../lib/member";
import {getAccountReview} from "../../lib/account-approval";
import {memberSignOut} from "./login/actions";
import {parseCryptoReference} from "../../lib/crypto-payments";
import {getPlan} from "../../lib/memberships";
export const dynamic="force-dynamic";
export const metadata={title:"My Account | Fim Addis",robots:{index:false,follow:false}};
export default async function AccountPage(){
 const user=await getViewer();if(!user)redirect("/account/login");
 const sql=db();
 const [membership,payments,review]=await Promise.all([
  getEffectiveMembership(user.id),
  sql`SELECT id,plan_id,amount_etb,status,reference,receipt_channel,created_at,review_note FROM public.fim_payment_reviews WHERE account_user_id=${user.id} ORDER BY created_at DESC LIMIT 30`,
  getAccountReview(user.id)
 ]);
 return <main className="shell account-page">
 <CustomerTierHeader/>
 <div className="account-heading"><div><p className="eyebrow">FIM ADDIS</p><h1>My account</h1><p className="muted">{user.name}</p></div><form action={memberSignOut}><button className="account-alt-button">Sign out</button></form></div>
 <section className="account-summary">
 <div className="account-panel"><p className="eyebrow">EXPLORE</p><h2>Discover films</h2><p className="muted">Browse our free catalog and discover member-only releases. No subscription is required for free titles.</p><Link href="/videos" className="btn">Browse the film library →</Link></div>
 <div className="account-panel"><p className="eyebrow">CURRENT TIER</p><h2>{membership?String(membership.plan_id).toUpperCase():"No active plan"}</h2><p className="muted">{membership?(membership.source==="administrator"?"Assigned by an administrator — active until changed.":"Active until "+new Date(membership.expires_at).toLocaleDateString("en-GB")):"Free access is active. No subscription is required for free films."}</p>{membership&&<Link href="/membership" className="subtle-link">View plan options →</Link>}</div>
 </section>
 <section className="account-review-banner">
  <p className="eyebrow">FREE ACCESS</p><h2>Active — ready to browse</h2>
  <p className="muted">Free films are available immediately with no administrator approval.</p>
  <p className="eyebrow" style={{marginTop:18}}>MEMBERSHIP PAYMENTS</p>
  <h2>{review.status==="rejected"?"Payment submissions restricted":"Submit a payment screenshot"}</h2>
  <p className="muted">{review.status==="rejected"?"Your account cannot submit new payments. Contact support if you believe this is an error.":"Select a membership plan, upload your payment screenshot and reference, and wait for manual payment verification."}</p>
  {review.status!=="rejected"&&<Link href="/membership" className="subtle-link">Choose a membership plan →</Link>}
  {review.status==="rejected"&&review.reviewNote&&<p className="muted">Reason: {review.reviewNote}</p>}
 </section>
 <section className="admin-section"><h2>Payment history</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Submitted</th><th>Plan</th><th>Amount</th><th>Receipt via</th><th>Status</th></tr></thead><tbody>{payments.length?payments.map(p=><tr key={p.id}><td>{new Date(p.created_at).toLocaleDateString("en-GB")}</td><td>{p.plan_id}</td><td>{parseCryptoReference(String(p.reference||""))?"$"+getPlan(String(p.plan_id))?.priceCryptoUsd.toFixed(2)+" USD":Number(p.amount_etb).toLocaleString()+" ETB"}</td><td>{parseCryptoReference(String(p.reference||""))?.wallet.network||"M-Pesa"} · {p.receipt_channel}</td><td>{p.status}</td></tr>):<tr><td colSpan={5}>No payments submitted.</td></tr>}</tbody></table></div></section>
 </main>;
}
