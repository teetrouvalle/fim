import "server-only";
import {db} from "./admin";

export type AccountStatus="unverified"|"pending"|"approved"|"rejected";
export type AccountReview={status:AccountStatus;reviewNote:string;reviewedAt:string|null};

export async function getAccountReview(userId:string):Promise<AccountReview>{
 const sql=db();
 // The Neon Auth user directory is authoritative for verification, not client claims.
 const rows=await sql`
  SELECT u."emailVerified" AS verified,coalesce(a.status,'pending') AS status,
         coalesce(a.review_note,'') AS note,a.reviewed_at
  FROM neon_auth."user" u LEFT JOIN public.fim_account_reviews a ON a.user_id=u.id::text
  WHERE u.id::text=${userId} LIMIT 1`;
 if(!rows.length||!rows[0].verified)return {status:"unverified",reviewNote:"",reviewedAt:null};
 return {status:rows[0].status as AccountStatus,reviewNote:String(rows[0].note||""),reviewedAt:rows[0].reviewed_at?String(rows[0].reviewed_at):null};
}

export async function accountIsApproved(userId:string):Promise<boolean>{
 return (await getAccountReview(userId)).status==="approved";
}
