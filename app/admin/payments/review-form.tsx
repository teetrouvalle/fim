"use client";
import {useActionState} from "react";
import {reviewPayment} from "./actions";
export default function ReviewForm({id}:{id:string}){
 const [state,act,busy]=useActionState(reviewPayment,null);
 return <form action={act} className="admin-form" style={{paddingTop:10}}>
 <input type="hidden" name="id" value={id}/>
 <label htmlFor={`confirm-${id}`} style={{fontWeight:400}}><input type="checkbox" name="confirmed" value="yes" id={`confirm-${id}`} style={{marginRight:7}}/>I verified this exact transaction in the receiving payment account.</label>
 <label htmlFor={`note-${id}`}>Internal note / rejection reason</label><input id={`note-${id}`} name="note" maxLength={500} placeholder="Reference checked or reason for rejection"/>
 {state?.message&&<p role="status" className="form-alert">{state.message}</p>}
 <div className="review-buttons"><button className="btn" name="decision" value="approve" disabled={busy}>Approve payment</button><button className="account-alt-button" name="decision" value="reject" disabled={busy}>Reject</button></div>
 </form>
}
