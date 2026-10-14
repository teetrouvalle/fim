"use client";
import {useActionState,useState} from "react";
import Link from "next/link";
import {memberSignIn,memberSignUp,memberRequestCode,memberVerifyCode,memberGoogleLogin} from "./actions";
export default function MemberLoginForm({initialTab="signin"}:{initialTab?:"signin"|"signup"|"verify"}){
 const [tab,setTab]=useState<"signin"|"signup"|"verify">(initialTab);
 const [a,aAction,aPending]=useActionState(memberSignIn,null);
 const [b,bAction,bPending]=useActionState(memberSignUp,null);
 const [c,cAction,cPending]=useActionState(memberVerifyCode,null);
 const [d,dAction,dPending]=useActionState(memberRequestCode,null);
 return <div className="admin-login" style={{marginTop:40}}>
 <p className="eyebrow">FIM ADDIS ACCOUNT</p><h1>{tab==="signup"?"Create account":tab==="verify"?"Verify your email":"Welcome back"}</h1>
 <p className="muted">Sign up, verify your email, and choose a membership. An administrator will review your verified account before payments or viewing access can begin.</p>
 <div className="login-tabs"><button className={tab==="signin"?"active":""} onClick={()=>setTab("signin")}>Sign in</button><button className={tab==="signup"?"active":""} onClick={()=>setTab("signup")}>Register</button><button className={tab==="verify"?"active":""} onClick={()=>setTab("verify")}>Verify email</button></div>
 {tab!=="verify"?<form className="admin-form" action={tab==="signup"?bAction:aAction}>
 {tab==="signup"&&<><label htmlFor="name">Your name</label><input id="name" name="name" required autoComplete="name"/></>}
 <label htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email"/>
 <label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={tab==="signup"?12:undefined} required autoComplete={tab==="signup"?"new-password":"current-password"}/>
 {(tab==="signup"?b:a)?.message&&<p className="form-alert" role="status">{(tab==="signup"?b:a)?.message}</p>}
 {tab==="signup"&&b?.message?.startsWith("Account created.")&&<div className="account-onboarding-next"><strong>Next: verify your email and select a membership</strong><p>Choose your plan now, then complete account verification and wait for administrator approval before making payment.</p><button type="button" className="account-alt-button" onClick={()=>setTab("verify")}>Verify email →</button><Link className="btn" href="/membership">Browse memberships →</Link></div>}
 <button className="btn" disabled={aPending||bPending}>{tab==="signup"?"Create account":"Sign in"} →</button>
 </form>:<>
 <form className="admin-form" action={cAction}><label htmlFor="verify-email">Email</label><input id="verify-email" name="email" type="email" required/><label htmlFor="otp">Verification code</label><input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{4,8}" autoComplete="one-time-code" required/>{c?.message&&<p role="status" className="form-alert">{c.message}</p>}<button className="btn" disabled={cPending}>Verify email →</button></form>
 <form className="admin-form" action={dAction} style={{marginTop:20}}><label htmlFor="resend-email">Resend code to</label><input id="resend-email" name="email" type="email" required/>{d?.message&&<p role="status" className="form-alert">{d.message}</p>}<button className="btn" disabled={dPending}>Resend verification code</button></form>
 </>}
 <form action={memberGoogleLogin} style={{marginTop:20}}><button className="account-alt-button" type="submit">Continue with Google</button></form>
 <p className="tiny muted">Account access uses Neon Auth. No payment is collected during registration.</p>
 </div>
}
