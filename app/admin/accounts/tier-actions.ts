"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";
export type TierState={ok?:boolean;message:string};
export async function assignAccountTier(_prev:TierState|null,form:FormData):Promise<TierState>{
 const admin=await getAdminSession();
 if(!admin)return {message:"An administrator session is required."};
 const id=String(form.get("user_id")||"").trim();
 const tier=String(form.get("tier")||"").trim();
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["free","basic","plus","premium"].includes(tier))
  return {message:"Select a valid customer and access tier."};
 try{
  const sql=db();
  const rows=await sql`
   WITH allowed AS (
    SELECT d.user_id,d.identifier FROM public.fim_customer_directory d
    WHERE d.user_id=${id} AND (d.email IS NULL OR NOT EXISTS(
     SELECT 1 FROM public.fim_admin_allowlist a WHERE lower(a.email)=lower(d.email)))
    LIMIT 1
   ), saved AS (
    INSERT INTO public.fim_admin_tier_grants(user_id,tier,assigned_by,assigned_at)
    SELECT user_id,${tier},${admin.email},now() FROM allowed
    ON CONFLICT(user_id) DO UPDATE SET
     tier=excluded.tier,assigned_by=excluded.assigned_by,assigned_at=now()
    RETURNING user_id,tier
   ), paid_approval AS (
    INSERT INTO public.fim_account_reviews(user_id,account_email,status,reviewed_by,reviewed_at,review_note,updated_at)
    SELECT user_id,identifier,'approved',${admin.email},now(),'Paid tier assigned by administrator',now()
    FROM allowed WHERE ${tier}<>'free'
    ON CONFLICT(user_id) DO UPDATE SET status='approved',reviewed_by=excluded.reviewed_by,
     reviewed_at=excluded.reviewed_at,review_note=excluded.review_note,updated_at=now()
    RETURNING user_id
   ), audit AS (
    INSERT INTO public.fim_audit_log(actor_email,action,details)
    SELECT ${admin.email},'account_tier_assigned',jsonb_build_object('user_id',user_id,'tier',tier)
    FROM saved RETURNING id
   )
   SELECT saved.tier FROM saved JOIN audit ON true`;
  if(!rows.length)return {message:"Customer was not found or cannot receive a tier."};
  revalidatePath("/admin/accounts");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/videos");
  return {ok:true,message:tier==="free"?"Free access is active; the administrator-paid tier grant has been cleared.":"Account assigned to "+tier.toUpperCase()+". Paid films at this tier are now available when playback is enabled."};
 }catch(error){
  console.error("[Fim Addis tier assignment]",error instanceof Error?error.message:String(error));
  return {message:"The tier could not be saved. Please try again."};
 }
}
