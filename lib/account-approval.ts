import "server-only";
import {db} from "./admin";
export type AccountStatus="pending"|"approved"|"rejected";
export type AccountReview={status:AccountStatus;reviewNote:string;reviewedAt:string|null};
/** Customer accounts do not require email verification; administrator approval is mandatory. */
export async function getAccountReview(userId:string):Promise<AccountReview>{
 const sql=db();
 const rows=await sql`
  SELECT coalesce(a.status,'pending') AS status,coalesce(a.review_note,'') AS note,a.reviewed_at
  FROM neon_auth."user" u LEFT JOIN public.fim_account_reviews a ON a.user_id=u.id::text
  WHERE u.id::text=${userId} LIMIT 1`;
 if(!rows.length)return {status:"pending",reviewNote:"",reviewedAt:null};
 return {status:rows[0].status as AccountStatus,reviewNote:String(rows[0].note||""),reviewedAt:rows[0].reviewed_at?String(rows[0].reviewed_at):null};
}
export async function accountIsApproved(userId:string):Promise<boolean>{
 return (await getAccountReview(userId)).status==="approved";
}
