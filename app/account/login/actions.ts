"use server";
import {revalidatePath} from "next/cache";
import {auth} from "../../../lib/auth/server";
import {redirect} from "next/navigation";
import {loginPhone,registerPhone,signOutPhone} from "../../../lib/phone-auth";
function returnAfterAuth(form:FormData){
 const value=String(form.get("next")||"");
 // Only these local paths are permitted; never redirect to an arbitrary URL.
 return /^\/checkout\/(basic|plus|premium)$/.test(value)?value:"/";
}
function credentials(form:FormData){
 return {kind:String(form.get("kind")||"email"),identity:String(form.get("identity")||"").trim(),password:String(form.get("password")||"")};
}
export async function memberSignIn(_prev:{message:string}|null,form:FormData){
 const {kind,identity,password}=credentials(form);
 if(!password||!identity)return {message:"Enter your email or phone and password."};
 if(kind==="phone"){
  const error=await loginPhone(identity,password);
  if(error)return {message:error};
 }else{
  if(kind!=="email"||!identity.includes("@"))return {message:"Enter a valid email address."};
  try{
   const {error}=await auth.signIn.email({email:identity.toLowerCase(),password});
   if(error)return {message:"Incorrect email or password."};
   await signOutPhone();
  }catch{return {message:"Sign-in service temporarily unavailable."}}
 }
 revalidatePath("/");
 redirect(returnAfterAuth(form));
}
export async function memberSignUp(_prev:{message:string}|null,form:FormData){
 const {kind,identity,password}=credentials(form);
 const name=String(form.get("name")||"").trim();
 if(!name||password.length<8)return {message:"Enter your name and a password with at least 8 characters."};
 if(kind==="phone"){
  const error=await registerPhone(name,identity,password);
  if(error)return {message:error};
 }else{
  if(kind!=="email"||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity))return {message:"Enter a valid email address."};
  try{
   const {error}=await auth.signUp.email({email:identity.toLowerCase(),password,name});
   if(error)return {message:error.message||"Registration failed."};
   const result=await auth.signIn.email({email:identity.toLowerCase(),password});
   if(result.error)return {message:"Account created. Sign in to continue."};
   await signOutPhone();
  }catch{return {message:"Could not finish registration. Please sign in with your new account."}}
 }
 revalidatePath("/");
 redirect(returnAfterAuth(form));
}
export async function memberGoogleLogin(form:FormData){
 let url="";
 try{const {data,error}=await auth.signIn.social({provider:"google",callbackURL:returnAfterAuth(form)});if(error)return;url=data?.url||"";}catch{return}
 if(url)redirect(url);
}
export async function memberSignOut(){
 await signOutPhone();
 try{await auth.signOut()}catch{/* phone-only account */}
 redirect("/");
}
