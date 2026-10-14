"use client";
import {useActionState,useState} from "react";
import Link from "next/link";
import {memberSignIn,memberSignUp,memberGoogleLogin} from "./actions";
export default function MemberLoginForm({initialTab="signin"}:{initialTab?:"signin"|"signup"}){
 const [tab,setTab]=useState<"signin"|"signup">(initialTab);
 const [signInState,signInAction,signInPending]=useActionState(memberSignIn,null);
 const [signUpState,signUpAction,signUpPending]=useActionState(memberSignUp,null);
 return <div className="admin-login" style={{marginTop:40}}>
 <p className="eyebrow">FIM ADDIS ACCOUNT</p><h1>{tab==="signup"?"Create account":"Welcome back"}</h1>
 <p className="muted">Create an account and choose a membership. An administrator will review your registration before any payment or viewing access. No email code is required.</p>
 <div className="login-tabs"><button type="button" className={tab==="signin"?"active":""} onClick={()=>setTab("signin")}>Sign in</button><button type="button" className={tab==="signup"?"active":""} onClick={()=>setTab("signup")}>Sign up</button></div>
 <form className="admin-form" action={tab==="signup"?signUpAction:signInAction} key={tab}>
 {tab==="signup"&&<><label htmlFor="name">Your name</label><input id="name" name="name" required autoComplete="name"/></>}
 <label htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email"/>
 <label htmlFor="password">{tab==="signup"?"Password (minimum 8 characters)":"Password"}</label><input id="password" name="password" type="password" minLength={tab==="signup"?8:undefined} required autoComplete={tab==="signup"?"new-password":"current-password"}/>
 {(tab==="signup"?signUpState:signInState)?.message&&<p className={tab==="signup"&&signUpState?.message?.startsWith("Account created.")?"save-confirmation":"form-alert"} role="status">{(tab==="signup"?signUpState:signInState)?.message}</p>}
 {tab==="signup"&&signUpState?.message?.startsWith("Account created.")&&<div className="account-onboarding-next"><strong>Next: choose your membership</strong><p>Sign in to see your approval status and select Basic, Plus, or Premium. No email code is needed.</p><button type="button" className="account-alt-button" onClick={()=>setTab("signin")}>Sign in →</button><Link className="btn" href="/membership">Browse memberships →</Link></div>}
 <button className="btn" disabled={signInPending||signUpPending}>{tab==="signup"?"Create account":"Sign in"} →</button>
 </form>
 <form action={memberGoogleLogin} style={{marginTop:20}}><button className="account-alt-button" type="submit">Continue with Google</button></form>
 <p className="tiny muted">Manual administrator approval is required before any payment or paid viewing access. Keep your password private.</p>
 </div>;
}
