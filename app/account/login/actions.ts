"use server";
import {auth} from "../../../lib/auth/server";
import {redirect} from "next/navigation";
export async function memberSignIn(_state:{message:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const password=String(form.get("password")||"");
 if(!email||!password)return {message:"Please enter both fields."};
 try{
  const {error}=await auth.signIn.email({email,password});
  if(error)return {message:error.message||"Could not sign in."};
 }catch{return {message:"Sign-in service temporarily unavailable."}}
 redirect("/account");
}
export async function memberSignUp(_state:{message:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const password=String(form.get("password")||"");
 const name=String(form.get("name")||"").trim();
 if(!email||!name||password.length<12)return {message:"Enter your name, email and a password with at least 12 characters."};
 try{
  const {error}=await auth.signUp.email({email,password,name});
  if(error)return {message:error.message||"Registration failed."};
  const sent=await auth.emailOtp.sendVerificationOtp({email,type:"email-verification"});
  return {message:sent.error?"Account created. Verification email is temporarily unavailable; you can use Google sign-in or retry verification.":"Account created. Enter your verification code in the Verify email tab."};
 }catch{return {message:"Account created or verification unavailable. Try signing in."}}
}
export async function memberRequestCode(_state:{message:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 if(!email)return {message:"Enter your email first."};
 try{const {error}=await auth.emailOtp.sendVerificationOtp({email,type:"email-verification"});return {message:error?(error.message||"Verification email is unavailable."):"If eligible, a verification code has been requested."}}catch{return {message:"Verification provider unavailable."}}
}
export async function memberVerifyCode(_state:{message:string}|null,form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const otp=String(form.get("otp")||"").trim();
 if(!/^[0-9]{4,8}$/.test(otp))return {message:"Enter the numeric code from your email."};
 try{const {error}=await auth.emailOtp.verifyEmail({email,otp});return {message:error?(error.message||"Code invalid or expired."):"Email verified. You can now sign in."}}catch{return {message:"Verification is temporarily unavailable."}}
}
export async function memberGoogleLogin(){
 let url="";
 try{const {data,error}=await auth.signIn.social({provider:"google",callbackURL:"/account"});if(error)return;url=data?.url||"";}catch{return}
 if(url)redirect(url);
}
export async function memberSignOut(){await auth.signOut();redirect("/");}
