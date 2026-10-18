import Link from "next/link";
import {redirect} from "next/navigation";
import {getAdminSession,db} from "../../lib/admin";
export const dynamic="force-dynamic";
export const metadata={title:"Administration | Fim Addis",robots:{index:false,follow:false}};
export default async function Admin(){
 const user=await getAdminSession();if(!user)redirect("/admin/login");
 const sql=db();
 const [plans,videos,payments,catalogCount,accounts,playbackSettings]=await Promise.all([
  sql`SELECT id,price_etb,rank FROM public.fim_plans ORDER BY rank`,
  sql`SELECT id,title,tier,is_free,published,rights_verified,rating_reviewed FROM public.fim_videos ORDER BY added_at DESC LIMIT 40`,
  sql`SELECT id,account_email,plan_id,amount_etb,status,receipt_channel FROM public.fim_payment_reviews ORDER BY created_at DESC LIMIT 20`,
  sql`SELECT count(*)::int AS count FROM public.fim_videos`,
  sql`SELECT count(*)::int AS count FROM public.fim_customer_directory u LEFT JOIN public.fim_account_reviews a ON a.user_id=u.user_id
   WHERE coalesce(a.status,'pending')='pending' AND (u.email IS NULL OR NOT EXISTS(SELECT 1 FROM public.fim_admin_allowlist x WHERE lower(x.email)=lower(u.email)))`,
  sql`SELECT value FROM public.fim_site_settings WHERE key='playback_open' LIMIT 1`
 ]);
 return <main className="shell admin-dashboard">
 <header className="admin-header"><div><p className="eyebrow">FIM ADDIS / ፍም አዲስ</p><h1>Administration</h1><p className="muted">Administrator dashboard</p></div><Link href="/" className="subtle-link">View website ↗</Link></header>
 <div className="admin-metrics">
 <article><span>Videos in catalog</span><strong>{Number(catalogCount[0]?.count||0)}</strong><small><Link href="/admin/videos?bunny=1#bunny-uploads">Check Bunny uploads ↗</Link></small></article>
 <article><span>Free films published</span><strong>{videos.filter(v=>v.published&&v.is_free).length}</strong><small>Public catalog · latest 40</small></article>
 <article><span>Pending customer reviews</span><strong>{Number(accounts[0]?.count||0)}</strong><small>Email and phone customers</small></article></div>
 <section className="admin-quicklinks"><Link href="/admin/accounts" className="btn">Manage accounts & tiers →</Link><Link href="/admin/payments" className="account-alt-button">Review payments ({payments.filter(p=>p.status==="pending").length}) →</Link><Link href="/admin/videos" className="account-alt-button">Manage free & paid catalog →</Link></section>
 <section className="admin-section"><h2>Playback diagnostics</h2><p className="muted">Server-side checks only. Secret values are never displayed.</p><div className="admin-table-wrap"><table className="admin-table"><tbody><tr><th>Vercel playback switch</th><td>{process.env.FIM_PLAYBACK_OPEN==="true"?"Enabled":"Disabled or missing"}</td></tr><tr><th>Neon playback switch</th><td>{playbackSettings[0]?.value==="true"?"Enabled":"Disabled or missing"}</td></tr><tr><th>Bunny token signing key</th><td>{process.env.BUNNY_STREAM_TOKEN_KEY?.trim()?"Present":"Missing or empty"}</td></tr><tr><th>Bunny library ID</th><td>{process.env.BUNNY_STREAM_LIBRARY_ID?.trim()?"Present":"Missing or empty"}</td></tr><tr><th>Published reviewed videos</th><td>{videos.filter(v=>v.published&&v.rights_verified&&v.rating_reviewed).length}</td></tr></tbody></table></div></section>
 <section className="admin-section"><h2>Membership prices</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Plan</th><th>30-day price</th></tr></thead><tbody>{plans.map(p=><tr key={p.id}><td>{p.id}</td><td>{Number(p.price_etb).toLocaleString()} ETB</td></tr>)}</tbody></table></div></section>
 <section className="admin-section"><h2>Video overview</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Video</th><th>Access</th><th>Status</th></tr></thead><tbody>{videos.map(v=><tr key={v.id}><td>{v.title}</td><td>{v.is_free?"FREE":v.tier}</td><td>{v.published?"Published":"Draft"}</td></tr>)}</tbody></table></div></section>
 </main>;
}
