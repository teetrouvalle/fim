import Link from "next/link";
import {redirect} from "next/navigation";
import {getAdminSession,db} from "../../../lib/admin";
import ReviewAccountForm from "./review-form";
export const dynamic="force-dynamic";
export const metadata={title:"Customer approvals | Fim Addis",robots:{index:false,follow:false}};
export default async function AccountsPage(){
 const admin=await getAdminSession();if(!admin)redirect("/admin/login");
 const sql=db();
 const rows=await sql`
  SELECT u.id,u.name,u.email,u."emailVerified" AS verified,u."createdAt" AS joined,
         coalesce(a.status,'pending') AS status,a.reviewed_at,a.review_note
  FROM neon_auth."user" u
  LEFT JOIN public.fim_account_reviews a ON a.user_id=u.id::text
  WHERE NOT EXISTS (SELECT 1 FROM public.fim_admin_allowlist al WHERE lower(al.email)=lower(u.email))
  ORDER BY CASE WHEN u."emailVerified" AND coalesce(a.status,'pending')='pending' THEN 0
                WHEN NOT u."emailVerified" THEN 2 ELSE 1 END,u."createdAt" DESC
  LIMIT 150`;
 const waiting=rows.filter(x=>x.verified&&x.status==="pending").length;
 return <main className="shell admin-dashboard">
 <Link href="/admin" className="subtle-link">← Administration</Link>
 <p className="eyebrow" style={{marginTop:34}}>CUSTOMER ACCOUNTS</p><h1>Account approvals</h1>
 <p className="muted">Review accounts after their Neon email is verified. Approve or decline each customer before M-PESA submission and streaming access. Email verification cannot be bypassed here.</p>
 <p className="muted"><strong>{waiting}</strong> verified account(s) waiting for review</p>
 <div className="payment-review-list">{rows.length?rows.map(a=><article key={a.id} className="account-panel">
 <div className="review-heading"><div><h2 style={{margin:"0 0 8px"}}>{a.name||"Customer"}</h2><p className="muted">{a.email} · joined {new Date(a.joined).toLocaleDateString("en-GB")}</p></div><span className="status-label">{a.verified?String(a.status).toUpperCase():"EMAIL NOT VERIFIED"}</span></div>
 {a.review_note&&<p className="muted">Review note: {a.review_note}</p>}
 {a.verified?<ReviewAccountForm userId={String(a.id)} status={String(a.status)}/>:<p className="muted">Awaiting email verification. No administrator decision is available until verification completes.</p>}
 </article>):<div className="account-panel"><p>No customer accounts yet. Newly registered customers will appear here.</p></div>}</div>
 </main>;
}
