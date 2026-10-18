import Link from "next/link";
import {redirect} from "next/navigation";
import {getAdminSession,db} from "../../../lib/admin";
import ReviewForm from "./review-form";
import {parseCryptoReference} from "../../../lib/crypto-payments";
import {getPlan} from "../../../lib/memberships";
export const dynamic="force-dynamic";
export const metadata={title:"Payment review | Fim Addis",robots:{index:false,follow:false}};
export default async function AdminPayments(){
 const admin=await getAdminSession();if(!admin)redirect("/admin/login");
 const sql=db();
 const payments=await sql`SELECT id,account_email,plan_id,amount_etb,reference,mpesa_transaction_id,receipt_channel,receipt_filename,receipt_mime,status,created_at,reviewed_at,review_note FROM public.fim_payment_reviews ORDER BY (status='pending') DESC,created_at DESC LIMIT 100`;
 return <main className="shell admin-dashboard"><Link href="/admin" className="subtle-link">← Dashboard</Link><p className="eyebrow" style={{marginTop:35}}>ADMINISTRATION</p><h1>Payment verification</h1><p className="muted">Verify the actual transfer in the receiving account before approving. A screenshot alone is not proof that the funds arrived.</p>
 <div className="payment-review-list">{payments.length?payments.map(p=>{const crypto=parseCryptoReference(String(p.reference||""));
 const usd=getPlan(String(p.plan_id))?.priceCryptoUsd;
 return <article className="account-panel" key={p.id}>
 <div className="review-heading"><div><strong>{p.account_email}</strong><p className="muted">{p.plan_id.toUpperCase()} · {crypto?"$"+usd?.toFixed(2)+" USD · "+crypto.wallet.currency+" on "+crypto.wallet.network:Number(p.amount_etb).toLocaleString()+" ETB · M-Pesa"} · {new Date(p.created_at).toLocaleString("en-GB")}</p></div><span className="status-label">{p.status.toUpperCase()}</span></div>
 <p>{crypto?"Blockchain transaction hash / signature":"M-Pesa transaction reference"}: <strong className="crypto-address">{crypto?(crypto.transaction||"Not provided — verify receipt manually"):(p.reference||"Not provided — verify receipt manually")}</strong></p><p>Receipt channel: {p.receipt_channel} {p.receipt_filename?"· "+p.receipt_filename:""}</p>
 {p.receipt_filename&&<Link href={`/admin/payments/${p.id}/receipt`} className="subtle-link" target="_blank">View private receipt ↗</Link>}

 {p.status==="pending"?<ReviewForm id={p.id}/>:<p className="muted">Reviewed: {p.reviewed_at?new Date(p.reviewed_at).toLocaleString("en-GB"):"—"} {p.review_note?"· "+p.review_note:""}</p>}
 </article>}):<div className="account-panel"><p>No payment submissions.</p></div>}</div>
 </main>
}
