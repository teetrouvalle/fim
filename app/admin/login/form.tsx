"use client";
import {useActionState,useState} from "react";
import {signInAdmin,signUpAdmin} from "./actions";
export default function AdminLoginForm(){
 const [mode,setMode]=useState<"signin"|"signup">("signin");
 const [signinState,signinAction,signinPending]=useActionState(signInAdmin,null);
 const [signupState,signupAction,signupPending]=useActionState(signUpAdmin,null);
 return <div className="admin-login">
  <h1>Administrator access</h1><p className="muted">Fim Addis management · Authorized personnel only</p>
  <div className="login-tabs"><button type="button" className={mode==="signin"?"active":""} onClick={()=>setMode("signin")}>Sign in</button><button type="button" className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>First-time setup</button></div>
  <form action={mode==="signin"?signinAction:signupAction} className="admin-form" key={mode}>
   <label htmlFor="email">Administrator email</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="Your administrator email"/>
   <label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete={mode==="signin"?"current-password":"new-password"} minLength={mode==="signup"?12:undefined}/>
   {(mode==="signin"?signinState:signupState)?.error?<p role="status" className="form-alert">{(mode==="signin"?signinState:signupState)?.error}</p>:null}
   <button className="btn" disabled={signinPending||signupPending}>{mode==="signin"?"Sign in":"Create administrator account"} →</button>
  </form>
  <p className="tiny muted">Access requires a verified email and an approved administrator account. Passwords are managed by Neon Auth.</p>
 </div>;
}
