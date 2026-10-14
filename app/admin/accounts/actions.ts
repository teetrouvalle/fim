"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";
type ReviewState={message:string;ok?:boolean};
export async function reviewCustomerAccount(_prev:ReviewState|null,form:FormData):Promise<ReviewState>{
 const admin=await getAdminSession();if(!admin)return {message:"Administrator sign-in required."};
 const id=String(form.get("user_id")||"");
 const decision=String(form.get("decision")||"");
 const note=String(form.get("note")||"").trim().slice(0,500);
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["approved","rejected"].includes(decision))return {message:"Invalid account review request."};
 if(decision==="rejected"&&!note)return {message:"Please enter a reason for declining the account."};
 try{
  const sql=db();
  const updated=await sql`
  WITH eligible AS (
   SELECT d.user_id,d.identifier FROM public.fim_customer_directory d WHERE d.user_id=${id}
   AND (d.email IS NULL OR NOT EXISTS(SELECT 1 FROM public.fim_admin_allowlist al WHERE lower(al.email)=lower(d.email)))
   LIMIT 1
  ), reviewed AS (
   INSERT INTO public.fim_account_reviews(user_id,account_email,status,reviewed_by,reviewed_at,review_note,updated_at)
   SELECT user_id,identifier,${decision},${admin.email},now(),${note},now() FROM eligible
   ON CONFLICT(user_id) DO UPDATE SET
    account_email=excluded.account_email,status=excluded.status,reviewed_by=excluded.reviewed_by,
    reviewed_at=excluded.reviewed_at,review_note=excluded.review_note,updated_at=now()
   RETURNING user_id,status
  ), audit AS (
   INSERT INTO public.fim_audit_log(actor_email,action,details)
   SELECT ${admin.email},'account_'||status,jsonb_build_object('user_id',user_id,'note',${note})
   FROM reviewed RETURNING id
  ) SELECT reviewed.status FROM reviewed JOIN audit ON true`;
  if(!updated.length)return {message:"Customer account not found or cannot be reviewed."};
  revalidatePath("/admin/accounts");revalidatePath("/admin");revalidatePath("/account");
  return {ok:true,message:decision==="approved"?"Customer approved for paid enrollment when it opens.":"Customer declined. Paid access is blocked."};
 }catch(error){
  console.error("[Account review]",error instanceof Error?error.message:String(error));
  return {message:"Couldn't save the decision. Please retry."};
 }
}
