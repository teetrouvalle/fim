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
 return {error:"Account created. Verify your email, then sign in to access the dashboard."};
}
