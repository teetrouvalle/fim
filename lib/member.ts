import "server-only";
import {auth} from "./auth/server";
import {db} from "./admin";
import {getPhoneViewer} from "./phone-auth";
export type Viewer={id:string;email:string;name:string;verified:boolean;phone?:string;method:"email"|"phone"};
export async function getViewer():Promise<Viewer|null>{
 const phone=await getPhoneViewer();
 if(phone)return phone;
 try{
  const {data}=await auth.getSession();
  const u=data?.user;
  if(!u?.id||!u.email)return null;
  return {id:u.id,email:u.email,name:u.name||u.email,verified:!!u.emailVerified,method:"email"};
 }catch{return null}
}
export async function getVerifiedViewer(){const v=await getViewer();return v?.verified?v:null}
export async function getActiveMembership(userId:string){
 const sql=db();
 const rows=await sql`SELECT m.plan_id,m.expires_at,p.rank FROM public.fim_memberships m JOIN public.fim_plans p ON p.id=m.plan_id WHERE m.user_id=${userId} AND m.expires_at>now() ORDER BY p.rank DESC,m.expires_at DESC LIMIT 1`;
 return rows[0]||null;
}

/** Effective access is the stronger of an unexpired paid membership or an explicit administrator tier grant. */
export async function getEffectiveMembership(userId:string){
 const sql=db();
 const rows=await sql`
  SELECT plan_id,rank,expires_at,source FROM (
   SELECT m.plan_id,p.rank,m.expires_at,'payment'::text AS source
   FROM public.fim_memberships m JOIN public.fim_plans p ON p.id=m.plan_id
   WHERE m.user_id=${userId} AND m.expires_at>now()
   UNION ALL
   SELECT g.tier AS plan_id,p.rank,NULL::timestamptz AS expires_at,'administrator'::text AS source
   FROM public.fim_admin_tier_grants g JOIN public.fim_plans p ON p.id=g.tier
   WHERE g.user_id=${userId} AND g.tier<>'free'
  ) AS access ORDER BY rank DESC,expires_at DESC NULLS LAST LIMIT 1`;
 return rows[0]||null;
}
