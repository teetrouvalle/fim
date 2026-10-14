import Link from "next/link";
import {redirect} from "next/navigation";
import {getAdminSession,db} from "../../lib/admin";
import {getBunnyLibraryHealth} from "../../lib/bunny";
export const dynamic="force-dynamic";
export const metadata={title:"Administration | Fim Addis",robots:{index:false,follow:false}};
export default async function Admin(){
 const user=await getAdminSession();if(!user)redirect("/admin/login");
 const sql=db();
 const [plans,videos,payments,stats,accounts]=await Promise.all([
 sql`SELECT id,price_etb,rank FROM public.fim_plans ORDER BY rank`,
 sql`SELECT id,title,tier,published,rights_verified,rating_reviewed,added_at FROM public.fim_videos ORDER BY added_at DESC LIMIT 20`,
 sql`SELECT id,account_email,plan_id,amount_etb,reference,status,receipt_channel,created_at FROM public.fim_payment_reviews ORDER BY created_at DESC LIMIT 20`,
 getBunnyLibraryHealth(),
 sql`SELECT count(*)::int AS count FROM neon_auth."user" u LEFT JOIN public.fim_account_reviews a ON a.user_id=u.id::text WHERE u."emailVerified"=true AND coalesce(a.status,\'pending\')=\'pending\' AND NOT EXISTS (SELECT 1 FROM public.fim_admin_allowlist al WHERE lower(al.email)=lower(u.email))`,
 ]);
 return <main className="shell admin-dashboard">
  <header className="admin-header"><div><p className="eyebrow">FIM ADDIS / ፍም አዲስ</p><h1>Administration</h1><p className="muted">Signed in: {user.email}</p></div><Link href="/" className="subtle-link">View website ↗</Link></header>
  <div className="admin-metrics">
   <article><span>Bunny video items</span><strong>{stats.connected?stats.total:"—"}</strong><small>{stats.connected?`${stats.ready} ready · ${stats.processing} processing`:"Connection unavailable"}</small></article>
   <article><span>Published catalog</span><strong>{videos.filter((v)=>v.published).length}</strong><small>Approved items in the latest 20</small></article>
   <article><span>Pending payment reviews</span><strong>{payments.filter(p=>p.status==="pending").length}</strong><small>Recent submissions only</small></article>
  </div>
  <section className="admin-quicklinks"><Link className="btn" href="/admin/accounts">Review customer accounts ({Number(accounts[0]?.count||0)}) →</Link><Link className="btn" href="/admin/payments">Review payments →</Link><Link className="account-alt-button" href="/admin/videos">Manage film catalog →</Link><Link className="account-alt-button" href="/account">My account →</Link></section>
  <section className="admin-section"><div className="admin-section-heading"><h2>Membership plans</h2><Link href="/membership" className="subtle-link">View plans →</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Plan</th><th>Monthly price</th><th>Status</th></tr></thead><tbody>{plans.map(p=><tr key={p.id}><td>{p.id}</td><td>{p.price_etb===null?"Not set":Number(p.price_etb).toLocaleString()+" ETB"}</td><td>Configured</td></tr>)}</tbody></table></div></section>
  <section className="admin-section"><h2>Video management</h2><p className="muted">Videos require confirmed distribution rights, classification, and administrator publication before customers can view them. Media uploads are managed through Bunny Stream.</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Title</th><th>Tier</th><th>Rights review</th><th>Catalog status</th></tr></thead><tbody>{videos.length?videos.map(v=><tr key={v.id}><td>{v.title}</td><td>{v.tier}</td><td>{v.rights_verified&&v.rating_reviewed?"Cleared":"Pending"}</td><td>{v.published?"Published":"Draft"}</td></tr>):<tr><td colSpan={4}>No videos entered yet. Bunny content is not automatically public.</td></tr>}</tbody></table></div></section>
  <section className="admin-section"><h2>Payment reviews</h2><p className="muted">M-PESA payments must be independently verified against the receiving account before approval. Receipt evidence may come from the website or the official Telegram account; submission and activation are not yet open.</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Applicant</th><th>Plan</th><th>Amount</th><th>Receipt via</th><th>Status</th></tr></thead><tbody>{payments.length?payments.map(p=><tr key={p.id}><td>{p.account_email}</td><td>{p.plan_id}</td><td>{Number(p.amount_etb).toLocaleString()} ETB</td><td>{p.receipt_channel}</td><td>{p.status}</td></tr>):<tr><td colSpan={5}>No payment submissions to review.</td></tr>}</tbody></table></div></section>
 </main>;
}
