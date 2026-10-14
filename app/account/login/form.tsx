"use client";
import {useActionState,useState,useEffect} from "react";
import {memberSignIn,memberSignUp,memberGoogleLogin} from "./actions";
export default function MemberLoginForm({initialTab="signin"}:{initialTab?:"signin"|"signup"}){
 const [tab,setTab]=useState<"signin"|"signup">(initialTab);
 useEffect(()=>{const restore=(event:PageTransitionEvent)=>{if(event.persisted)window.location.reload()};window.addEventListener("pageshow",restore);return ()=>window.removeEventListener("pageshow",restore)},[]);
 const [kind,setKind]=useState<"email"|"phone">("email");
 const [login,loginAction,loginPending]=useActionState(memberSignIn,null);
 const [signup,signupAction,signupPending]=useActionState(memberSignUp,null);
 const state=tab==="signin"?login:signup;
 return <div className="admin-login" style={{marginTop:40}}>
 <p className="eyebrow">FIM ADDIS</p><h1>{tab==="signup"?"Create your account":"Welcome back"}</h1>
 <p className="muted">Register with an email address or mobile number. No email verification code is required. Browse free videos immediately; paid films require an approved account and membership.</p>
 <div className="login-tabs"><button type="button" className={tab==="signin"?"active":""} onClick={()=>setTab("signin")}>Sign in</button><button type="button" className={tab==="signup"?"active":""} onClick={()=>setTab("signup")}>Sign up</button></div>
 <form action={tab==="signup"?signupAction:loginAction} className="admin-form" key={tab+"-"+kind}>
  <input type="hidden" name="kind" value={kind}/>
  {tab==="signup"&&<><label htmlFor="name">Your name</label><input id="name" name="name" required autoComplete="name" maxLength={120}/></>}
  <label>Register using</label>
  <div className="auth-type-selector"><button type="button" className={kind==="email"?"selected":""} onClick={()=>setKind("email")}>Email</button><button type="button" className={kind==="phone"?"selected":""} onClick={()=>setKind("phone")}>Phone</button></div>
  <label htmlFor="identity">{kind==="phone"?"Phone number":"Email address"}</label>
  <input id="identity" name="identity" type={kind==="phone"?"tel":"email"} autoComplete={kind==="phone"?"tel":"email"} inputMode={kind==="phone"?"tel":"email"} required placeholder={kind==="phone"?"0912345678 or +251912345678":"name@example.com"}/>
  <label htmlFor="password">{tab==="signup"?"Password (8 characters minimum)":"Password"}</label>
  <input id="password" name="password" type="password" autoComplete={tab==="signup"?"new-password":"current-password"} minLength={tab==="signup"?8:undefined} required/>
  {state?.message&&<p role="status" className="form-alert">{state.message}</p>}
  <button className="btn" disabled={signupPending||loginPending}>{tab==="signup"?"Create account":"Sign in to Fim Addis"} →</button>
 </form>
 <form action={memberGoogleLogin} style={{marginTop:18}}><button className="account-alt-button">Continue with Google</button></form>
 <p className="tiny muted">Phone accounts cannot receive SMS password resets at this time. Keep your password safe. Paid memberships require administrator approval.</p>
 </div>;
}
