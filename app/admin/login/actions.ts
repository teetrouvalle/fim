"use server";
import {auth} from "../../../lib/auth/server";
import {redirect} from "next/navigation";
export async function signInAdmin(_prev:{error:string}|null,form:FormData){
 if(!process.env.NEON_AUTH_BASE_URL)return {error:"Administrator login is being configured."};
 const email=String(form.get("email")||"").trim().toLowerCase();
 const password=String(form.get("password")||"");
 if(!email||!password)return {error:"Please enter your email and password."};
 const {error}=await auth.signIn.email({email,password});
 if(error)return {error:"Could not sign in. Check your details and verify your email."};
 redirect("/admin");
}
export async function signUpAdmin(_prev:{error:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const password=String(form.get("password")||"");
 if(email!==(process.env.FIM_ADMIN_EMAIL||"").toLowerCase())return {error:"Admin registration is restricted."};
 if(password.length<12)return {error:"Use a password of at least 12 characters."};
 const {error}=await auth.signUp.email({email,password,name:"Fim Addis Administrator"});
 if(error)return {error:error.message||"Unable to register administrator."};
 try { await auth.sendVerificationEmail({email,callbackURL:"/admin"}); } catch { /* Verification can be requested from Neon if email provider is unavailable. */ }
 return {error:"Account created. Check your email for a verification message. Email verification must be enabled in Neon before dashboard access."};
}

export async function verifyAdminEmail(_prev:{error:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const otp=String(form.get("otp")||"").trim();
 if(email!==(process.env.FIM_ADMIN_EMAIL||"").toLowerCase())return {error:"Unauthorized email."};
 if(!/^\\d{4,8}$/.test(otp))return {error:"Enter the numeric verification code from your email."};
 const {error}=await auth.emailOtp.verifyEmail({email,otp});
 if(error)return {error:error.message||"Invalid or expired verification code."};
 return {error:"Email verified. You can now sign in."};
}
export async function resendAdminCode(_prev:{error:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 if(email!==(process.env.FIM_ADMIN_EMAIL||"").toLowerCase())return {error:"Unauthorized email."};
 const {error}=await auth.sendVerificationEmail({email,callbackURL:"/admin"});
 return {error:error?(error.message||"Unable to send verification code."):"A new verification code was requested. Check your inbox."};
}
