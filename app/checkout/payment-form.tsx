"use client";
import {useActionState,useState} from "react";
import {cryptoWallets,findCryptoWallet} from "../../lib/crypto-payments";
import {submitMpesaPayment} from "./actions";

type Props={
 plan:string;
 cryptoPriceUsd:number;
 mpesaNumber:string;
 paymentEnabled:boolean;
 accountEligible:boolean;
 unavailableMessage:string;
};
export default function PaymentForm({plan,cryptoPriceUsd,mpesaNumber,paymentEnabled,accountEligible,unavailableMessage}:Props){
 const [state,act,busy]=useActionState(submitMpesaPayment,null);
 const [method,setMethod]=useState("mpesa");
 const wallet=findCryptoWallet(method);
 const canSubmit=paymentEnabled&&accountEligible;
 return <section className="account-panel" style={{marginTop:24}}>
  <p className="eyebrow">PAYMENT METHOD</p>
  <h2>Choose how to pay</h2>
  <div className="admin-form">
   <label htmlFor="payment-network">Method and network</label>
   <select id="payment-network" value={method} onChange={e=>setMethod(e.target.value)}>
    <option value="mpesa">M-Pesa · ETB</option>
    {cryptoWallets.map(w=><option key={w.id} value={w.id}>{w.currency} · {w.network}</option>)}
   </select>
  </div>
  <div className="checkout-note" style={{marginTop:16}}>
   <p className="eyebrow">AMOUNT DUE</p>
   {wallet?<><strong>{wallet.currency==="BTC"?"$"+cryptoPriceUsd.toFixed(2)+" USD equivalent in BTC":cryptoPriceUsd.toFixed(2)+" "+wallet.currency}</strong>
    <p className="muted">Fixed crypto price: ${cryptoPriceUsd.toFixed(2)} USD. Network fees are extra; the ETB price does not determine your crypto amount.</p></>
    :<><strong>M-Pesa payment in ETB</strong><p className="muted">Pay the ETB membership price shown above.</p></>}
  </div>
  {!canSubmit?<div className="checkout-note" role="status"><strong>Payment submission unavailable</strong><p>{unavailableMessage}</p><p className="muted">Payment options are shown for reference only. Do not send funds while submissions are unavailable.</p></div>:<>
   {wallet?<div className="checkout-note">
    <p className="eyebrow">RECEIVING WALLET</p><strong>{wallet.currency} · {wallet.network}</strong>
    <p className="crypto-address">{wallet.address}</p>
    <button type="button" className="account-alt-button" onClick={()=>void navigator.clipboard.writeText(wallet.address)}>Copy address</button>
    <p className="tiny muted">Send only {wallet.currency} on {wallet.network}. Sending on the wrong network or using the wrong token may permanently lose funds.</p>
    {wallet.currency==="BTC"&&<p className="tiny muted">The BTC amount changes with the Bitcoin/USD rate. Check a current quote before transferring; we manually verify that the value received covers ${cryptoPriceUsd.toFixed(2)} USD.</p>}
   </div>:<div className="checkout-note">
    <p className="eyebrow">M-PESA RECIPIENT</p><h2>{mpesaNumber}</h2><p><strong>Semira Musa</strong></p>
   </div>}
   <p className="muted" style={{lineHeight:1.7}}>After paying, upload a clear payment screenshot. You may also include a transaction reference. Access is granted only after an administrator independently verifies receipt of the funds.</p>
   {state?.ok?<div className="checkout-note" role="status">
    <strong>Payment proof received</strong><p>{state.message}</p>
    <p className="muted">Submission reference: <code>{state.reference}</code></p>
    <p><a className="subtle-link" href="/account">View payment status →</a></p>
   </div>:<form className="admin-form" action={act}>
    <input type="hidden" name="plan" value={plan}/>
    <input type="hidden" name="payment_method" value={method}/>
    <label htmlFor="transaction">{wallet?"Blockchain transaction hash / signature (optional)":"M-Pesa transaction reference (optional)"}</label>
    <input id="transaction" key={method} name="transaction" placeholder={wallet?"Paste the complete on-chain transaction hash":"Reference from your M-Pesa confirmation"} minLength={6} maxLength={128} autoComplete="off"/>
    <label htmlFor="receipt">Payment screenshot (required)</label>
    <input id="receipt" name="receipt" type="file" accept="image/png,image/jpeg,application/pdf" required/>
    <p className="tiny muted">PNG, JPG or PDF · maximum 900 KB. Screenshots alone do not confirm payment.</p>
    {state?.message&&<p className="form-alert" role="status">{state.message}</p>}
    <button className="btn" disabled={busy}>{busy?"Submitting…":"Submit payment for review →"}</button>
   </form>}
  </>}
 </section>;
}
