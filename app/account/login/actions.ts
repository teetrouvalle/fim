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
 if(!email||!name||password.length<8)return {message:"Enter your name, email and a password with at least 8 characters."};
 try{
  const {error}=await auth.signUp.email({email,password,name});
  if(error)return {message:String(error.message||"Registration failed.")};
  return {message:"Account created. No email verification code is required. Sign in and choose a membership while an administrator reviews your account."};
 }catch{return {message:"Registration could not be completed. Please try again."}}
}
export async function memberGoogleLogin(){
 let url="";
 try{const {data,error}=await auth.signIn.social({provider:"google",callbackURL:"/account"});if(error)return;url=data?.url||"";}catch{return}
 if(url)redirect(url);
}
export async function memberSignOut(){await auth.signOut();redirect("/");}
