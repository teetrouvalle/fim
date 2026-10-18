"use client";
import {useActionState} from "react";
import {approvePayment,rejectPayment} from "./actions";

export default function ReviewForm({id}:{id:string}){
 const [approval,approve,approving]=useActionState(approvePayment,null);
 const [rejection,reject,rejecting]=useActionState(rejectPayment,null);
 const busy=approving||rejecting;
 return <div className="payment-review-actions">
  <form action={approve} className="admin-form" style={{paddingTop:10}}>
   <input type="hidden" name="id" value={id}/>
   <label htmlFor={`confirm-${id}`} style={{fontWeight:400}}>
    <input type="checkbox" name="confirmed" value="yes" id={`confirm-${id}`} style={{marginRight:7}}/>
    I verified this exact transaction in the receiving payment account.
   </label>
   <label htmlFor={`approve-note-${id}`}>Internal approval note (optional)</label>
   <input id={`approve-note-${id}`} name="note" maxLength={500} placeholder="Reference checked"/>
   {approval?.message&&<p role="status" className={approval.ok?"save-confirmation":"form-alert"}>{approval.message}</p>}
   <button type="submit" className="btn" disabled={busy}>{approving?"Approving…":"Approve payment"}</button>
  </form>
  <details className="admin-secondary-review">
   <summary>Reject this payment</summary>
   <form action={reject} className="admin-form">
    <input type="hidden" name="id" value={id}/>
    <label htmlFor={`reject-note-${id}`}>Reason for rejection</label>
    <input id={`reject-note-${id}`} name="note" maxLength={500} placeholder="Enter the reason" required/>
    {rejection?.message&&<p role="status" className={rejection.ok?"save-confirmation":"form-alert"}>{rejection.message}</p>}
    <button type="submit" className="account-alt-button" disabled={busy}>{rejecting?"Rejecting…":"Confirm rejection"}</button>
   </form>
  </details>
 </div>;
}
