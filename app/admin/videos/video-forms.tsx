"use client";
import {useActionState} from "react";
import {importBunnyVideo,updateVideo} from "./actions";
export function ImportVideo({guid,title,status}:{guid:string;title:string;status:number}){
 const [state,action,busy]=useActionState(importBunnyVideo,null);
 return <form action={action} className="import-row"><input type="hidden" name="guid" value={guid}/><div><strong>{title}</strong><p className="muted tiny">{guid} · {status===4?"Ready":status===5?"Failed":"Processing"}</p></div><button className="account-alt-button" disabled={busy}>Import as draft</button>{state?.message&&<p role="status" className="form-alert">{state.message}</p>}</form>
}
export function EditVideo({video}:{video:{id:string,title:string,description:string,tier:string,rights_verified:boolean,rating_reviewed:boolean,published:boolean}}){
 const [state,action,busy]=useActionState(updateVideo,null);
 return <form action={action} className="admin-form account-panel"><input type="hidden" name="id" value={video.id}/>
 <label>Title</label><input name="title" defaultValue={video.title} maxLength={180} required/>
 <label>Description</label><textarea name="description" rows={3} defaultValue={video.description||""} maxLength={2400}/>
 <label>Required tier</label><select name="tier" defaultValue={video.tier}><option value="basic">Basic and above</option><option value="plus">Plus and above</option><option value="premium">Premium only</option><option value="purchase_only">Individual purchase only (checkout not yet configured)</option></select>
 <label className="checkbox-line"><input type="checkbox" name="rights" value="yes" defaultChecked={video.rights_verified}/> I confirm we have legal distribution rights for this video.</label>
 <label className="checkbox-line"><input type="checkbox" name="rating" value="yes" defaultChecked={video.rating_reviewed}/> I have reviewed the content classification, age restrictions and eligibility.</label>
 <label className="checkbox-line"><input type="checkbox" name="published" value="yes" defaultChecked={video.published}/> List the video publicly when both reviews are complete.</label>
 {state?.message&&<p role="status" className="form-alert">{state.message}</p>}
 <button className="btn" disabled={busy}>Save video</button></form>
}
