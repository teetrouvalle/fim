import "server-only";
import {auth} from "./auth/server";
import {neon} from "@neondatabase/serverless";
export function db(){if(!process.env.DATABASE_URL)throw new Error("Database not configured");return neon(process.env.DATABASE_URL)}
export async function getAdminSession(){
 if(!process.env.NEON_AUTH_BASE_URL||!process.env.NEON_AUTH_COOKIE_SECRET||!process.env.DATABASE_URL)return null;
 try{
 const {data:session}=await auth.getSession();
 const user=session?.user;
 if(!user?.email||!user.emailVerified)return null;
 const sql=db();
 const allowed=await sql`SELECT email FROM public.fim_admin_allowlist WHERE lower(email)=lower(${user.email}) LIMIT 1`;
 if(allowed.length!==1)return null;
 return {id:user.id,email:user.email,name:user.name||"Administrator"};
 }catch{return null;}
}
