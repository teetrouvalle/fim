"use client";
import {useActionState} from "react";
import {submitMpesaPayment} from "./actions";

export default function PaymentForm({plan}:{plan:string}){
 const [state,act,busy]=useActionState(submitMpesaPayment,null);
 return <section className="account-panel" style={{marginTop:24}}>
  <p className="eyebrow">PAYMENT VERIFICATION</p>
  <h2>Upload your payment screenshot</h2>
  <p className="muted">After transferring the exact plan amount to the recipient above, enter your transaction reference and upload a clear screenshot of the payment confirmation. Your membership becomes active only after the administrator verifies the funds.</p>
  {state?.ok?<div className="checkout-note" role="status">
   <strong>Payment proof received</strong>
   <p>{state.message}</p>
   <p className="muted">Submission reference: <code>{state.reference}</code></p>
   <p><a className="subtle-link" href="/account">View payment status →</a></p>
  </div>:<form className="admin-form" action={act}>
   <input type="hidden" name="plan" value={plan}/>
   <input type="hidden" name="channel" value="website"/>
   <label htmlFor="transaction">Payment transaction reference</label>
   <input id="transaction" name="transaction" placeholder="Reference from your payment confirmation" minLength={6} maxLength={80} required autoComplete="off"/>
   <label htmlFor="receipt">Payment screenshot (required)</label>
   <input id="receipt" name="receipt" type="file" accept="image/png,image/jpeg,application/pdf" required/>
   <p className="tiny muted">PNG, JPG or PDF · maximum 900 KB. Make sure the amount, recipient, and transaction reference are readable.</p>
   {state?.message&&<p className="form-alert" role="status">{state.message}</p>}
   <button className="btn" disabled={busy}>{busy?"Uploading…":"Submit payment screenshot →"}</button>
  </form>}
 </section>;
}
