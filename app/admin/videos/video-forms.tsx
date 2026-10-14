"use client";
import {useActionState} from "react";
import {importBunnyVideo,updateVideo} from "./actions";
export function ImportVideo({guid,title,status}:{guid:string;title:string;status:number}){
 const [state,action,busy]=useActionState(importBunnyVideo,null);
 return <form action={action} className="import-row"><input type="hidden" name="guid" value={guid}/><div><strong>{title}</strong><p className="muted tiny">{guid} · {status===4?"Ready":status===5?"Failed":"Processing"}</p></div><button className="account-alt-button" disabled={busy}>{busy?"Importing…":"Import as draft"}</button>{state?.message&&<p role="status" className={state.ok?"save-confirmation":"form-alert"}>{state.message}</p>}</form>
}
export function EditVideo({video}:{video:{id:string,title:string,description:string,tier:string,is_free:boolean,rights_verified:boolean,rating_reviewed:boolean,published:boolean}}){
 const [state,action,busy]=useActionState(updateVideo,null);
 return <form action={action} className="admin-form account-panel"><input type="hidden" name="id" value={video.id}/>
 <label>Title</label><input name="title" defaultValue={video.title} maxLength={180} required/>
 <label>Description</label><textarea name="description" rows={3} defaultValue={video.description||""} maxLength={2400}/>
 <label className="checkbox-line"><input type="checkbox" name="is_free" value="yes" defaultChecked={video.is_free}/> <strong>Free catalog — anyone can watch without paying</strong></label>
 <p className="muted tiny">Free films appear in the public Free catalog after rights, rating and publication checks. You can switch this off later.</p>
 <label>Required membership tier (only applies when this video is not free)</label><select name="tier" defaultValue={video.tier}><option value="basic">Basic and above</option><option value="plus">Plus and above</option><option value="premium">Premium only</option><option value="purchase_only">Individual purchase only (checkout not yet configured)</option></select>
 <label className="checkbox-line"><input type="checkbox" name="rights" value="yes" defaultChecked={video.rights_verified}/> I confirm we have legal distribution rights for this video.</label>
 <label className="checkbox-line"><input type="checkbox" name="rating" value="yes" defaultChecked={video.rating_reviewed}/> I have reviewed the content classification, age restrictions and eligibility.</label>
 <label className="checkbox-line"><input type="checkbox" name="published" value="yes" defaultChecked={video.published}/> List the video publicly when both reviews are complete.</label>
 {state?.message&&<div role="status" aria-live="polite" className={state.ok?"save-confirmation":"form-alert"}><strong>{state.ok?"✓ ":""}{state.message}</strong>{state.ok&&state.savedAt&&<small style={{display:"block",marginTop:6}}>Saved in Neon · {new Date(state.savedAt).toLocaleString()}</small>}</div>}
 <button className="btn" disabled={busy}>{busy?"Saving changes…":"Save changes"}</button></form>
}
