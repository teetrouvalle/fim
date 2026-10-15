"use server";
import {revalidatePath} from "next/cache";
import {getViewer} from "../../lib/member";
import {accountIsApproved} from "../../lib/account-approval";
import {db} from "../../lib/admin";
export type SubmissionState={message:string;reference?:string;ok?:boolean};
const MAX_RECEIPT=900_000;
export async function submitMpesaPayment(_prev:SubmissionState|null,form:FormData):Promise<SubmissionState>{
 if(process.env.FIM_PAYMENTS_OPEN!=="true")return {message:"Payments are not open yet. Please don't transfer funds."};
 const user=await getViewer();if(!user)return {message:"Please sign in before submitting payment proof."};
 if(!await accountIsApproved(user.id))return {message:"This account cannot submit payments. Contact support."};
 const plan=String(form.get("plan")||"").toLowerCase();
 const channel="website";
 const transaction=String(form.get("transaction")||"").trim().toUpperCase();
 if(!["basic","plus","premium"].includes(plan))return {message:"Invalid membership plan."};
 if(!/^[A-Z0-9-]{6,80}$/.test(transaction))return {message:"Enter the payment transaction reference (6–80 letters or numbers)."};
 const raw=form.get("receipt");
 const file=raw&&typeof raw!=="string"&&raw.size>0?raw:null;
 if(!file)return {message:"Please upload a payment screenshot (PNG/JPG) or PDF."};
 if(file&&file.size>MAX_RECEIPT)return {message:"Your screenshot exceeds 900 KB. Please compress it and try again."};
 let encoded="",mime="",filename="";
 if(file){
  filename=file.name.slice(0,120);const buf=Buffer.from(await file.arrayBuffer());const hex=buf.subarray(0,8).toString("hex");
  mime=hex.startsWith("89504e470d0a1a0a")?"image/png":hex.startsWith("ffd8ff")?"image/jpeg":hex.startsWith("255044462d")?"application/pdf":"";
  if(!mime)return {message:"Use a PNG, JPG or PDF receipt only."};
  encoded=buf.toString("base64");
 }
 try{
  const sql=db();
  const available=await sql`SELECT value FROM public.fim_site_settings WHERE key='payments_open' LIMIT 1`;
  if(available[0]?.value!=="true")return {message:"Payments are temporarily unavailable. Do not transfer money yet."};
  const recent=await sql`SELECT count(*)::int AS count FROM public.fim_payment_reviews WHERE account_user_id=${user.id} AND created_at>now()-interval '24 hours'`;
  if(Number(recent[0]?.count||0)>=3)return {message:"Maximum three payment submissions per day. Contact support if you need a correction."};
  const plans=await sql`SELECT price_etb FROM public.fim_plans WHERE id=${plan}`;
  const amount=plans[0]?.price_etb;
  if(!Number.isInteger(Number(amount))||Number(amount)<=0)return {message:"Plan not available."};
  const row=await sql`INSERT INTO public.fim_payment_reviews (account_user_id,account_email,plan_id,amount_etb,reference,mpesa_transaction_id,receipt_channel,payment_method,receipt_bytes,receipt_mime,receipt_filename,status)
     VALUES (${user.id},${user.email},${plan},${Number(amount)},${transaction},${transaction},${channel},'mpesa',CASE WHEN ${encoded}='' THEN NULL ELSE decode(${encoded},'base64') END,${mime||null},${filename||null},'pending') RETURNING id`;
  revalidatePath("/account");
  const id=String(row[0]?.id||"");
  return {ok:true,reference:id,message:"Your screenshot was uploaded successfully. Your membership will activate after the administrator verifies your payment."};
 }catch(e){
  const error=String(e);
  if(error.includes("fim_mpesa_txn_unique")||error.includes("duplicate key"))return {message:"This payment transaction reference has already been submitted."};
  return {message:"Could not submit your payment proof. Please try again."};
 }
}
