import Link from "next/link";
import {redirect} from "next/navigation";
import {getAdminSession,db} from "../../../lib/admin";
import ReviewAccountForm from "./review-form";
import AccountTierForm from "./tier-form";
export const dynamic="force-dynamic";
export const metadata={title:"Customer approvals | Fim Addis",robots:{index:false,follow:false}};
export default async function AccountsPage({searchParams}:{searchParams:Promise<{page?:string}>}){
 const admin=await getAdminSession();if(!admin)redirect("/admin/login");
 const query=await searchParams;
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.page||"1",10)||1));
 const pageSize=75;const offset=(page-1)*pageSize;
 const sql=db();
 const [rows,summary]=await Promise.all([sql`
  SELECT u.user_id AS id,u.name,u.identifier,u.method,u.joined,
         coalesce(a.status,'pending') AS status,a.review_note,coalesce(g.tier,'free') AS assigned_tier
  FROM public.fim_customer_directory u
  LEFT JOIN public.fim_account_reviews a ON a.user_id=u.user_id
  LEFT JOIN public.fim_admin_tier_grants g ON g.user_id=u.user_id
  WHERE u.email IS NULL OR NOT EXISTS(SELECT 1 FROM public.fim_admin_allowlist al WHERE lower(al.email)=lower(u.email))
  ORDER BY CASE WHEN coalesce(a.status,'pending')='pending' THEN 0 ELSE 1 END,u.joined DESC
  LIMIT ${pageSize} OFFSET ${offset}`,
 sql`SELECT count(*)::int AS total,
  count(*) FILTER(WHERE coalesce(a.status,'pending')='pending')::int AS waiting
  FROM public.fim_customer_directory u
  LEFT JOIN public.fim_account_reviews a ON a.user_id=u.user_id
  WHERE u.email IS NULL OR NOT EXISTS(SELECT 1 FROM public.fim_admin_allowlist al WHERE lower(al.email)=lower(u.email))`]);
 const total=Number(summary[0]?.total||0),waiting=Number(summary[0]?.waiting||0);
 return <main className="shell admin-dashboard">
 <Link href="/admin" className="subtle-link">← Administration</Link>
 <p className="eyebrow" style={{marginTop:34}}>CUSTOMER ACCOUNTS</p><h1>Customer access &amp; tiers</h1>
 <p className="muted">Email and phone registrations are shown together. Free access is active automatically for every account. Assign Basic, Plus or Premium here to grant paid-film access manually. Payment approvals remain separate.</p>
 <p className="muted">{total} registered customer(s) · {waiting} without a manual account decision (no approval required)</p>
 <div className="payment-review-list">{rows.length?rows.map(a=><article className="account-panel" key={a.id}>
 <div className="review-heading"><div><h2 style={{margin:"0 0 8px"}}>{a.name||"Customer"}</h2><p className="muted">{a.identifier} · {a.method==="phone"?"Phone":"Email"} · Joined {new Date(a.joined).toLocaleDateString("en-GB")}</p></div><span className="status-label">{String(a.status).toUpperCase()}</span></div>
 {a.review_note&&<p className="muted">Review note: {a.review_note}</p>}
 <p className="muted"><strong>Free access: ACTIVE</strong> · Paid account review: {String(a.status).toUpperCase()}</p>
 <AccountTierForm userId={String(a.id)} tier={String(a.assigned_tier)}/>
 <details className="admin-secondary-review"><summary>Optional account restriction / review</summary><ReviewAccountForm userId={String(a.id)} status={String(a.status)}/></details>
 </article>):<div className="account-panel"><p>No customers registered yet.</p></div>}</div>
 <nav className="admin-pagination" aria-label="Account pages">{page>1&&<Link href={`/admin/accounts?page=${page-1}`} className="account-alt-button">← Previous</Link>}<span className="muted">Page {page} of {Math.max(1,Math.ceil(total/pageSize))}</span>{page*pageSize<total&&<Link href={`/admin/accounts?page=${page+1}`} className="account-alt-button">Next →</Link>}</nav>
 </main>;
}
