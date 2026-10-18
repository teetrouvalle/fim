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
         coalesce(a.status,'pending') AS status,a.review_note,coalesce(g.tier,'free') AS assigned_tier,
         CASE WHEN coalesce(paid.rank,0)>coalesce(grant_plan.rank,0)
              THEN paid.plan_id ELSE coalesce(g.tier,'free') END AS effective_tier
  FROM public.fim_customer_directory u
  LEFT JOIN public.fim_account_reviews a ON a.user_id=u.user_id
  LEFT JOIN public.fim_admin_tier_grants g ON g.user_id=u.user_id
  LEFT JOIN public.fim_plans grant_plan ON grant_plan.id=g.tier
  LEFT JOIN LATERAL (
    SELECT m.plan_id,p.rank
    FROM public.fim_memberships m
    JOIN public.fim_plans p ON p.id=m.plan_id
    WHERE m.user_id=u.user_id AND m.expires_at>now()
    ORDER BY p.rank DESC,m.expires_at DESC LIMIT 1
  ) paid ON true
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
 <p className="muted">Every customer appears as a compact row with their name and current access tier. Select a row to expand its account details and settings. Free access starts automatically, and payment approvals remain separate.</p>
 <p className="muted">{total} registered customer(s) · {waiting} without a manual account decision (no approval required)</p>

 <div className="video-manager-list account-manager-list">
 {rows.length?rows.map(a=><details className="video-manager-item account-manager-item" key={String(a.id)}>
  <summary className="video-manager-summary">
   <span className="video-manager-name">{a.name||"Customer"}</span>
   <span className="video-manager-tier">{String(a.effective_tier||"free").toUpperCase()}</span>
  </summary>
  <div className="video-manager-details account-manager-details">
   <div className="account-manager-profile">
    <p><strong>Account:</strong> {a.identifier}</p>
    <p><strong>Registration:</strong> {a.method==="phone"?"Phone":"Email"}</p>
    <p><strong>Joined:</strong> {new Date(a.joined).toLocaleDateString("en-GB")}</p>
    <p><strong>Current access:</strong> {String(a.effective_tier||"free").toUpperCase()}</p>
    <p><strong>Administrator-assigned tier:</strong> {String(a.assigned_tier||"free").toUpperCase()}</p>
    <p><strong>Free access:</strong> Active</p>
    <p><strong>Account review:</strong> {String(a.status).toUpperCase()}</p>
    {a.review_note&&<p><strong>Review note:</strong> {a.review_note}</p>}
   </div>
   <AccountTierForm userId={String(a.id)} tier={String(a.assigned_tier)}/>
   <details className="admin-secondary-review">
    <summary>Optional account restriction / review</summary>
    <ReviewAccountForm userId={String(a.id)} status={String(a.status)}/>
   </details>
  </div>
 </details>):<div className="account-panel"><p>No customers registered yet.</p></div>}
 </div>
 <nav className="admin-pagination" aria-label="Account pages">{page>1&&<Link href={`/admin/accounts?page=${page-1}`} className="account-alt-button">← Previous</Link>}<span className="muted">Page {page} of {Math.max(1,Math.ceil(total/pageSize))}</span>{page*pageSize<total&&<Link href={`/admin/accounts?page=${page+1}`} className="account-alt-button">Next →</Link>}</nav>
 </main>;
}
