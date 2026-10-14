"use client";
import {useActionState,useState} from "react";
import {signInAdmin,signUpAdmin,verifyAdminEmail,resendAdminCode,adminGoogleLogin} from "./actions";
export default function AdminLoginForm(){
 const [mode,setMode]=useState<"signin"|"signup"|"verify">("signin");
 const [signinState,signinAction,signinPending]=useActionState(signInAdmin,null);
 const [signupState,signupAction,signupPending]=useActionState(signUpAdmin,null);
 const [verifyState,verifyAction,verifyPending]=useActionState(verifyAdminEmail,null);
 const [resendState,resendAction,resendPending]=useActionState(resendAdminCode,null);
 return <div className="admin-login">
  <h1>Administrator access</h1><p className="muted">Fim Addis management · Authorized personnel only</p>
  <div className="login-tabs"><button type="button" className={mode==="signin"?"active":""} onClick={()=>setMode("signin")}>Sign in</button><button type="button" className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>First-time setup</button><button type="button" className={mode==="verify"?"active":""} onClick={()=>setMode("verify")}>Verify email</button></div>
  {mode==="verify"?<><form action={verifyAction} className="admin-form"><label htmlFor="verification-email">Administrator email</label><input id="verification-email" name="email" type="email" required/><label htmlFor="otp">Email verification code</label><input id="otp" name="otp" inputMode="numeric" pattern="[0-9]{4,8}" autoComplete="one-time-code" required/>{verifyState?.error?<p className="form-alert" role="status">{verifyState.error}</p>:null}<button className="btn" disabled={verifyPending}>Verify email →</button></form><form action={resendAction} className="admin-form" style={{marginTop:15}}><label htmlFor="resend-email">Need another code? Enter your email</label><input id="resend-email" name="email" type="email" required/>{resendState?.error?<p role="status">{resendState.error}</p>:null}<button className="btn" disabled={resendPending}>Resend code</button></form></>:<form action={mode==="signin"?signinAction:signupAction} className="admin-form" key={mode}>
   <label htmlFor="email">Administrator email</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="Your administrator email"/>
   <label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete={mode==="signin"?"current-password":"new-password"} minLength={mode==="signup"?12:undefined}/>
   {(mode==="signin"?signinState:signupState)?.error?<p role="status" className="form-alert">{(mode==="signin"?signinState:signupState)?.error}</p>:null}
   <button className="btn" disabled={signinPending||signupPending}>{mode==="signin"?"Sign in":"Create administrator account"} →</button>
  </form>}
  <form action={adminGoogleLogin} style={{marginTop:20}}><button className="account-alt-button" type="submit">Continue with Google</button></form><p className="tiny muted">Access requires a verified email and an approved administrator account. Passwords are managed by Neon Auth.</p>
 </div>;
}
