"use client";
import {useActionState,useState} from "react";
import {submitMpesaPayment} from "./actions";

export default function PaymentForm({plan}:{plan:string}){
 const [state,act,busy]=useActionState(submitMpesaPayment,null);
 const [method,setMethod]=useState("mpesa");
 const wallets=[
  {id:"usdt_bep20",label:"USDT · BNB Smart Chain (BEP20)",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdt_eth",label:"USDT · Ethereum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdt_arb",label:"USDT · Arbitrum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdt_op",label:"USDT · Optimism",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdc_arb",label:"USDC · Arbitrum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdc_eth",label:"USDC · Ethereum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdc_base",label:"USDC · Base",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
  {id:"usdc_sol",label:"USDC · Solana",address:"9embAL4QMf3YzyQLJY2oxfoaDddKcNthviAuWJaiTu2Z"},
  {id:"usdt_sol",label:"USDT · Solana",address:"9embAL4QMf3YzyQLJY2oxfoaDddKcNthviAuWJaiTu2Z"},
  {id:"usdt_trc20",label:"USDT · Tron (TRC20)",address:"TLakkQZgq8JzedA17BrcVi2gUKoPcX2tdg"},
  {id:"btc",label:"BTC · Bitcoin",address:"bc1q8r4vgkh3ynzd65p2vhlf2f2l964xuk7fxfntv5"}
 ];
 const wallet=wallets.find(w=>w.id===method);
 return <section className="account-panel" style={{marginTop:24}}>
  <p className="eyebrow">PAYMENT VERIFICATION</p>
  <h2>Upload your payment screenshot</h2>
  <label htmlFor="payment-network">Payment method and network</label>
  <select id="payment-network" value={method} onChange={e=>setMethod(e.target.value)}><option value="mpesa">M-Pesa</option>{wallets.map(w=><option key={w.id} value={w.id}>{w.label}</option>)}</select>
  {wallet&&<div className="checkout-note"><strong>{wallet.label}</strong><p className="crypto-address">{wallet.address}</p><button type="button" className="account-alt-button" onClick={()=>navigator.clipboard.writeText(wallet.address)}>Copy wallet address</button><p className="tiny muted">Use only the selected network. Confirm the cryptocurrency amount with support before sending; the membership price above is in ETB. Wrong-network transfers may be lost.</p></div>}
  <p className="muted">After transferring the exact plan amount to the recipient above, enter your transaction reference and upload a clear screenshot of the payment confirmation. Your membership becomes active only after the administrator verifies the funds.</p>
  {state?.ok?<div className="checkout-note" role="status">
   <strong>Payment proof received</strong>
   <p>{state.message}</p>
   <p className="muted">Submission reference: <code>{state.reference}</code></p>
   <p><a className="subtle-link" href="/account">View payment status →</a></p>
  </div>:<form className="admin-form" action={act}>
   <input type="hidden" name="plan" value={plan}/>
   <input type="hidden" name="channel" value="website"/><input type="hidden" name="payment_method" value={method}/>
   <label htmlFor="transaction">{wallet?"Blockchain transaction hash":"Payment transaction reference"}</label>
   <input id="transaction" name="transaction" placeholder={wallet?"Transaction hash from blockchain explorer":"Reference from your payment confirmation"} minLength={6} maxLength={80} required autoComplete="off"/>
   <label htmlFor="receipt">Payment screenshot (required)</label>
   <input id="receipt" name="receipt" type="file" accept="image/png,image/jpeg,application/pdf" required/>
   <p className="tiny muted">PNG, JPG or PDF · maximum 900 KB. Make sure the amount, recipient, and transaction reference are readable.</p>
   {state?.message&&<p className="form-alert" role="status">{state.message}</p>}
   <button className="btn" disabled={busy}>{busy?"Uploading…":"Submit payment screenshot →"}</button>
  </form>}
 </section>;
}
