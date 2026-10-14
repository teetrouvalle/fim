"use client";
import {useActionState} from "react";
import {reviewCustomerAccount} from "./actions";
export default function ReviewAccountForm({userId,status}:{userId:string;status:string}){
 const [state,action,busy]=useActionState(reviewCustomerAccount,null);
 return <form action={action} className="admin-form account-review-form">
  <input type="hidden" name="user_id" value={userId}/>
  <label htmlFor={`account-note-${userId}`}>Review notes or decline reason</label>
  <textarea name="note" id={`account-note-${userId}`} maxLength={500} rows={2} placeholder="A reason is required when declining"/>
  {state?.message&&<p role="status" className={state.ok?"save-confirmation":"form-alert"}>{state.message}</p>}
  <div className="review-buttons">
   <button type="submit" name="decision" value="approved" className="btn" disabled={busy}>{status==="approved"?"Keep approved":"Approve account"}</button>
   <button type="submit" name="decision" value="rejected" className="account-alt-button" disabled={busy}>{status==="rejected"?"Keep declined":"Decline account"}</button>
  </div>
 </form>;
}
