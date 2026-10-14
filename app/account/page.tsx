import Link from "next/link";
import {redirect} from "next/navigation";
import {db} from "../../lib/admin";
import {getViewer,getActiveMembership} from "../../lib/member";
import {memberSignOut} from "./login/actions";
export const dynamic="force-dynamic";
export const metadata={title:"My Account | Fim Addis",robots:{index:false,follow:false}};
export default async function AccountPage(){
 const user=await getViewer();if(!user)redirect("/account/login");
 const sql=db();
 const [member,payments]=await Promise.all([getActiveMembership(user.id),sql`SELECT id,plan_id,amount_etb,status,receipt_channel,created_at,review_note FROM public.fim_payment_reviews WHERE account_user_id=${user.id} ORDER BY created_at DESC LIMIT 30`]);
 return <main className="shell account-page"><div className="account-heading"><div><p className="eyebrow">FIM ADDIS</p><h1>My account</h1><p className="muted">{user.name} · {user.email}</p></div><form action={memberSignOut}><button className="account-alt-button">Sign out</button></form></div>
 {!user.verified&&<div className="checkout-note"><strong>Verify your email</strong><p>Your email has not been verified. Payment submission and paid video access are disabled until you verify your address.</p><Link href="/account/login" className="subtle-link">Open verification →</Link></div>}
 <section className="account-summary"><div className="account-panel"><span className="eyebrow">Current membership</span><h2>{member?String(member.plan_id).toUpperCase():"No active plan"}</h2><p className="muted">{member?"Valid until "+new Date(member.expires_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"Pick a membership to unlock approved catalog titles after payment confirmation."}</p><Link href="/membership" className="subtle-link">View memberships →</Link></div><div className="account-panel"><span className="eyebrow">Watch</span><h2>Film library</h2><p className="muted">Availability depends on approved catalog items and your active membership.</p><Link href="/videos" className="subtle-link">Browse videos →</Link></div></section>
 <section className="admin-section"><h2>Payment submissions</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Submitted</th><th>Plan</th><th>Amount</th><th>Proof</th><th>Status</th></tr></thead><tbody>{payments.length?payments.map(p=><tr key={p.id}><td>{new Date(p.created_at).toLocaleDateString("en-GB")}</td><td>{p.plan_id}</td><td>{Number(p.amount_etb).toLocaleString()} ETB</td><td>{p.receipt_channel}</td><td>{p.status}{p.status==="rejected"&&p.review_note?" — "+p.review_note:""}</td></tr>):<tr><td colSpan={5}>You haven't submitted a payment yet.</td></tr>}</tbody></table></div></section>
 </main>
}
