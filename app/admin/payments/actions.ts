"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";
export type ReviewState={message:string;ok?:boolean};
export async function reviewPayment(_prev:ReviewState|null,form:FormData):Promise<ReviewState>{
 const admin=await getAdminSession();if(!admin)return {message:"Administrator session required."};
 const id=String(form.get("id")||"");
 const decision=String(form.get("decision")||"");
 const note=String(form.get("note")||"").slice(0,500).trim();
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["approve","reject"].includes(decision))return {message:"Invalid review request."};
 if(decision==="approve"&&form.get("confirmed")!=="yes")return {message:"You must independently confirm that the funds arrived in the receiving payment account."};
 if(decision==="reject"&&!note)return {message:"Enter a reason before rejecting."};
 try{
  const sql=db();
  const rows=await sql`SELECT public.fim_review_membership_payment(${id}::uuid,${admin.email},${decision==="approve"},${note}) AS result`;
  revalidatePath("/admin/payments");revalidatePath("/admin");revalidatePath("/account");
  return {ok:true,message:rows[0]?.result==="approved"?"Payment approved and 30-day membership activated.":rows[0]?.result==="rejected"?"Payment rejected.": "Payment was already reviewed."};
 }catch{return {message:"Review failed. Please check the transaction reference and retry."}}
}
