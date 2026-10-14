"use client";
import {useActionState} from "react";
import {assignAccountTier} from "./tier-actions";
export default function AccountTierForm({userId,tier}:{userId:string;tier:string}){
 const [state,action,busy]=useActionState(assignAccountTier,null);
 return <form action={action} className="account-tier-form admin-form">
  <input name="user_id" type="hidden" value={userId}/>
  <label htmlFor={`tier-${userId}`}>Administrator-assigned access tier</label>
  <select id={`tier-${userId}`} name="tier" defaultValue={tier} key={tier}>
   <option value="free">Free — automatically available</option>
   <option value="basic">Basic</option>
   <option value="plus">Plus</option>
   <option value="premium">Premium</option>
  </select>
  <button className="btn" disabled={busy}>{busy?"Updating…":"Save tier"}</button>
  {state?.message&&<p role="status" className={state.ok?"save-confirmation":"form-alert"}>{state.message}</p>}
  <p className="muted tiny">Paid tiers assigned here give direct access while assigned, without a payment submission. Free removes administrator-granted paid access but does not cancel a separately purchased, unexpired membership.</p>
 </form>;
}
