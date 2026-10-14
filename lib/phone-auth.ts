import "server-only";
import {randomBytes,createHash,createHmac,scrypt,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {cookies,headers} from "next/headers";
import {db} from "./admin";

const scryptAsync=promisify(scrypt);
const COOKIE_NAME="fim_phone_session";
const SESSION_SECONDS=60*60*24*30;
const PHONE_PATTERN=/^\+[1-9][0-9]{7,14}$/;

export function normalizePhone(value:string):string|null{
 const raw=value.trim().replace(/[\s()\-]/g,"");
 let normalized=raw;
 if(/^0[79][0-9]{8}$/.test(raw))normalized="+251"+raw.slice(1);
 else if(/^251[79][0-9]{8}$/.test(raw))normalized="+"+raw;
 if(!PHONE_PATTERN.test(normalized))return null;
 return normalized;
}
async function digestPassword(password:string,salt:string){
 const hash=(await scryptAsync(password,Buffer.from(salt,"hex"),64)) as Buffer;
 return hash.toString("hex");
}
async function setPhoneCookie(userId:string){
 const token=randomBytes(32).toString("hex");
 const tokenHash=createHash("sha256").update(token).digest("hex");
 const sql=db();
 await sql`INSERT INTO public.fim_phone_sessions(token_hash,user_id,expires_at) VALUES(${tokenHash},${userId}::uuid,now()+interval '30 days')`;
 const store=await cookies();
 store.set(COOKIE_NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_SECONDS});
}
export async function signOutPhone(){
 const store=await cookies();
 const token=store.get(COOKIE_NAME)?.value;
 if(token){
  try{
   const sql=db();
   await sql`DELETE FROM public.fim_phone_sessions WHERE token_hash=${createHash("sha256").update(token).digest("hex")}`;
  }catch{/* do not prevent local sign out */}
 }
 store.delete(COOKIE_NAME);
}
export async function getPhoneViewer():Promise<{id:string;name:string;email:string;phone:string;verified:boolean;method:"phone"}|null>{
 const store=await cookies();
 const token=store.get(COOKIE_NAME)?.value;
 if(!token||!/^[0-9a-f]{64}$/.test(token))return null;
 try{
  const sql=db();
  const rows=await sql`SELECT p.id,p.phone,p.name FROM public.fim_phone_sessions s
   JOIN public.fim_phone_accounts p ON p.id=s.user_id
   WHERE s.token_hash=${createHash("sha256").update(token).digest("hex")} AND s.expires_at>now() LIMIT 1`;
  if(!rows.length)return null;
  return {id:String(rows[0].id),name:String(rows[0].name),phone:String(rows[0].phone),email:String(rows[0].phone),verified:false,method:"phone"};
 }catch{return null}
}
export async function registerPhone(name:string,number:string,password:string):Promise<string|null>{
 const phone=normalizePhone(number);
 if(!phone)return "Enter a valid phone number, for example 0912345678 or +251912345678.";
 if(password.length<8)return "Password must have at least 8 characters.";
 if(!name.trim()||name.length>120)return "Enter your name (up to 120 characters).";
 const store=await headers();
 const source=(store.get("x-forwarded-for")||store.get("x-real-ip")||"unknown").split(",")[0].trim();
 const pepper=process.env.NEON_AUTH_COOKIE_SECRET;
 if(!pepper)return "Phone registration is temporarily unavailable.";
 const ipHash=createHmac("sha256",pepper).update(source).digest("hex");
 const sql=db();
 try{
  const count=await sql`SELECT count(*)::int AS total FROM public.fim_phone_signup_attempts WHERE ip_hash=${ipHash} AND created_at>now()-interval '1 hour'`;
  if(Number(count[0]?.total||0)>=8)return "Too many registrations. Please try again later.";
  await sql`INSERT INTO public.fim_phone_signup_attempts(ip_hash) VALUES(${ipHash})`;
  const salt=randomBytes(16).toString("hex");
  const hash=await digestPassword(password,salt);
  const result=await sql`INSERT INTO public.fim_phone_accounts(phone,name,password_hash,password_salt) VALUES(${phone},${name.trim()},${hash},${salt}) ON CONFLICT (phone) DO NOTHING RETURNING id`;
  if(!result.length)return "This phone number already has an account. Please sign in.";
  await setPhoneCookie(String(result[0].id));
  return null;
 }catch(error){
  console.error("[Fim Addis phone registration]",error instanceof Error?error.message:String(error));
  return "Could not create this account. Please try again.";
 }
}
export async function loginPhone(number:string,password:string):Promise<string|null>{
 const phone=normalizePhone(number);
 if(!phone)return "Enter your phone number in a valid format.";
 if(!password)return "Enter your password.";
 try{
  const sql=db();
  const rows=await sql`SELECT id,password_hash,password_salt,locked_until FROM public.fim_phone_accounts WHERE phone=${phone} LIMIT 1`;
  if(!rows.length)return "Incorrect phone number or password.";
  const account=rows[0];
  if(account.locked_until&&new Date(account.locked_until).getTime()>Date.now())return "Too many attempts. Try again in 15 minutes.";
  const candidate=Buffer.from(await digestPassword(password,String(account.password_salt)),"hex");
  const actual=Buffer.from(String(account.password_hash),"hex");
  const valid=candidate.length===actual.length&&timingSafeEqual(candidate,actual);
  if(!valid){
   await sql`UPDATE public.fim_phone_accounts SET failed_attempts=failed_attempts+1,
    locked_until=CASE WHEN failed_attempts+1>=6 THEN now()+interval '15 minutes' ELSE NULL END WHERE id=${account.id}::uuid`;
   return "Incorrect phone number or password.";
  }
  await sql`UPDATE public.fim_phone_accounts SET failed_attempts=0,locked_until=NULL WHERE id=${account.id}::uuid`;
  await setPhoneCookie(String(account.id));
  return null;
 }catch(error){
  console.error("[Fim Addis phone login]",error instanceof Error?error.message:String(error));
  return "Phone sign-in is temporarily unavailable.";
 }
}
