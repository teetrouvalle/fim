"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";

export type ReviewState={message:string;ok?:boolean};
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Explicitly select the intended decision on the server. Do not rely on
 * submitter name/value fields, which may be omitted when React serializes
 * the FormData for a server action.
 */
async function applyPaymentDecision(decision:"approve"|"reject",form:FormData):Promise<ReviewState>{
 const admin=await getAdminSession();
 if(!admin)return {message:"Administrator session required. Sign in again."};
 const id=String(form.get("id")||"").trim();
 const note=String(form.get("note")||"").trim().slice(0,500);
 if(!uuidPattern.test(id))return {message:"Invalid payment ID. Refresh Payment verification and try again."};
 if(decision==="approve"&&form.get("confirmed")!=="yes")
  return {message:"You must independently confirm that the funds arrived in the receiving payment account."};
 if(decision==="reject"&&!note)return {message:"Enter a reason before rejecting."};

 try{
  const sql=db();
  // The database function performs row locking, idempotent review checks,
  // membership activation, and audit logging in one transaction.
  const rows=await sql`SELECT public.fim_review_membership_payment(${id}::uuid,${admin.email},${decision==="approve"},${note}) AS result`;
  const result=String(rows[0]?.result||"");
  if(!["approved","rejected"].includes(result))
   return {message:"Payment review returned an unexpected result. Refresh the page before retrying."};
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  revalidatePath("/account");
  return {ok:true,message:result===(decision==="approve"?"approved":"rejected")
   ?decision==="approve"?"Payment approved and 30-day membership activated.":"Payment rejected."
   :`Payment was already ${result}. Refresh the page.`};
 }catch(error){
  console.error("[Fim Addis] Payment review failed",
   error instanceof Error?{name:error.name,message:error.message}:String(error));
  return {message:"Payment review failed; no approval is confirmed. Refresh and retry or check the server logs."};
 }
}

export async function approvePayment(_prev:ReviewState|null,form:FormData):Promise<ReviewState>{
 return applyPaymentDecision("approve",form);
}
export async function rejectPayment(_prev:ReviewState|null,form:FormData):Promise<ReviewState>{
 return applyPaymentDecision("reject",form);
}
