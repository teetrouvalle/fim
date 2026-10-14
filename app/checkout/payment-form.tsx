"use client";
import {useActionState} from "react";
import {submitMpesaPayment} from "./actions";
export default function PaymentForm({plan,telegram}:{plan:string;telegram:string}){
 const [state,act,busy]=useActionState(submitMpesaPayment,null);
 return <section className="account-panel" style={{marginTop:24}}>
  <h2>Submit M-PESA payment proof</h2><p className="muted">Pay the exact amount to the verified number above, then submit the M-PESA transaction ID. We review every payment manually; a screenshot alone does not activate membership.</p>
  {state?.ok?<div className="checkout-note" role="status"><strong>Submission received</strong><p>{state.message}</p><p className="muted">Reference: <code>{state.reference}</code></p>{telegram&&<a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="btn">Send receipt via Telegram ↗</a>}<p><a className="subtle-link" href="/account">Check payment status →</a></p></div>:<form className="admin-form" action={act}>
  <input type="hidden" name="plan" value={plan}/>
  <label htmlFor="transaction">M-PESA transaction ID</label><input id="transaction" name="transaction" placeholder="As shown in the M-PESA confirmation" minLength={6} maxLength={80} required/>
  <label htmlFor="channel">How will you submit your receipt?</label><select name="channel" id="channel" defaultValue="website"><option value="website">Upload on this website</option><option value="telegram">Send via Telegram (@{telegram})</option></select>
  <label htmlFor="receipt">Receipt (PNG/JPG/PDF, max 900 KB for website upload)</label><input id="receipt" name="receipt" type="file" accept="image/png,image/jpeg,application/pdf"/>
  {state?.message&&<p className="form-alert" role="status">{state.message}</p>}
  <button className="btn" disabled={busy}>{busy?"Submitting…":"Submit for manual verification →"}</button>
 </form>}
 </section>
}
