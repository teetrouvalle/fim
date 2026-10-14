import "server-only";
import { auth } from "./auth/server";
import { db } from "./admin";
export type Viewer = {id:string; email:string; name:string; verified:boolean};
export async function getViewer():Promise<Viewer|null>{
 try{
  const {data}=await auth.getSession();
  const u=data?.user;
  if(!u?.id||!u.email)return null;
  return {id:u.id,email:u.email,name:u.name||u.email,verified:!!u.emailVerified};
 }catch{return null}
}
export async function getVerifiedViewer(){const v=await getViewer();return v?.verified?v:null}
export async function getActiveMembership(userId:string){
 const sql=db();
 const rows=await sql`SELECT m.plan_id,m.expires_at,p.rank FROM public.fim_memberships m JOIN public.fim_plans p ON p.id=m.plan_id WHERE m.user_id=${userId} AND m.expires_at>now() ORDER BY p.rank DESC,m.expires_at DESC LIMIT 1`;
 return rows[0]||null;
}
