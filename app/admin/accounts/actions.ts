"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";
type ReviewState={message:string;ok?:boolean};

export async function reviewCustomerAccount(_prev:ReviewState|null,form:FormData):Promise<ReviewState>{
 const admin=await getAdminSession();
 if(!admin)return {message:"Your administrator session expired. Please sign in."};
 const userId=String(form.get("user_id")||"").trim();
 const decision=String(form.get("decision")||"");
 const note=String(form.get("note")||"").trim().slice(0,500);
 if(!/^[0-9a-f-]{36}$/i.test(userId)||!["approved","rejected"].includes(decision))
  return {message:"Invalid account review request."};
 if(decision==="rejected"&&!note)return {message:"Provide a reason for declining the account."};
 try{
  const sql=db();
  // All registered customer accounts can be reviewed without email verification.
  // The authorization check is server-side and edits + audit entry are atomic.
  const rows=await sql`
   WITH eligible AS (
    SELECT u.id::text AS user_id,u.email FROM neon_auth."user" u
    WHERE u.id::text=${userId}
      AND NOT EXISTS (SELECT 1 FROM public.fim_admin_allowlist al WHERE lower(al.email)=lower(u.email))
    LIMIT 1
   ), reviewed AS (
    INSERT INTO public.fim_account_reviews(user_id,account_email,status,reviewed_by,reviewed_at,review_note,updated_at)
    SELECT user_id,email,${decision},${admin.email},now(),${note},now() FROM eligible
    ON CONFLICT(user_id) DO UPDATE SET
      account_email=excluded.account_email,status=excluded.status,reviewed_by=excluded.reviewed_by,
      reviewed_at=excluded.reviewed_at,review_note=excluded.review_note,updated_at=now()
    RETURNING user_id,status
   ), audit AS (
    INSERT INTO public.fim_audit_log(actor_email,action,details)
    SELECT ${admin.email},'account_'||status,jsonb_build_object('user_id',user_id,'note',${note})
    FROM reviewed RETURNING id
   )
   SELECT reviewed.status FROM reviewed JOIN audit ON true`;
  if(!rows.length)return {message:"This account could not be found or reviewed."};
  revalidatePath("/admin/accounts");revalidatePath("/admin");revalidatePath("/account");
  return {ok:true,message:decision==="approved"?"Account approved. The customer may proceed when payment enrollment opens.":"Account declined. Payment and playback are blocked for this account."};
 }catch(error){
  console.error("[Fim Addis account review]",error instanceof Error?error.message:String(error));
  return {message:"Unable to save this account decision. Try again."};
 }
}
