"use client";
import {useActionState} from "react";
import Image from "next/image";
import {deleteVideo,importBunnyVideo,updateVideo,syncBunnyUploads} from "./actions";
export function SyncBunnyUploads(){
 const [state,action,busy]=useActionState(syncBunnyUploads,null);
 return <form action={action} className="admin-form" style={{marginTop:18,marginBottom:22}}>
  <button type="submit" className="btn" style={{alignSelf:"flex-start"}} disabled={busy}>{busy?"Syncing videos and thumbnails…":"Sync Bunny videos + thumbnails →"}</button>
  {state?.message&&<p role="status" className={state.ok?"save-confirmation":"form-alert"}>{state.message}</p>}
 </form>;
}
export function ImportVideo({guid,title,status}:{guid:string;title:string;status:number}){
 const [state,action,busy]=useActionState(importBunnyVideo,null);
 return <form action={action} className="import-row"><input type="hidden" name="guid" value={guid}/><div><strong>{title}</strong><p className="muted tiny">{guid} · {status===4?"Ready":status===5?"Failed":"Processing"}</p></div><button className="account-alt-button" disabled={busy}>{busy?"Importing…":"Import as draft"}</button>{state?.message&&<p role="status" className={state.ok?"save-confirmation":"form-alert"}>{state.message}</p>}</form>
}
export function DeleteVideo({id,title}:{id:string;title:string}){
 const [state,action,busy]=useActionState(deleteVideo,null);
 return <form action={action} className="admin-form" onSubmit={e=>{if(!window.confirm(`Remove "${title}" from Fim Addis? This will not delete the Bunny upload.`))e.preventDefault()}}>
 <input type="hidden" name="id" value={id}/>
 <button type="submit" className="account-alt-button" disabled={busy}>{busy?"Removing…":"Delete from catalog"}</button>
 {state?.message&&<p role="status" className={state.ok?"save-confirmation":"form-alert"}>{state.message}</p>}
 </form>;
}
export function EditVideo({video}:{video:{id:string,title:string,description:string,tier:string,is_free:boolean,show_on_home:boolean,has_thumbnail:boolean,thumbnail_version:string,rights_verified:boolean,rating_reviewed:boolean,published:boolean}}){
 const [state,action,busy]=useActionState(updateVideo,null);
 return <form action={action} className="admin-form account-panel"><input type="hidden" name="id" value={video.id}/>
 <label>Title</label><input name="title" defaultValue={video.title} maxLength={180} required/>
 <label>Description</label><textarea name="description" rows={3} defaultValue={video.description||""} maxLength={2400}/>
 <label className="checkbox-line"><input type="checkbox" name="is_free" value="yes" defaultChecked={video.is_free}/> <strong>Free catalog — anyone can watch without paying</strong></label>
 <p className="muted tiny">Free films appear in the public Free catalog after rights, rating and publication checks. You can switch this off later.</p>
 <label className="checkbox-line"><input type="checkbox" name="show_on_home" value="yes" defaultChecked={video.show_on_home}/> <strong>Show on homepage (paid films)</strong></label>
 <p className="muted tiny">Selected paid films appear below the existing free section. The first 12 are visible to everyone; only subscribed members can expand the rest. Turn this off to keep the title in the film library but off the homepage.</p>
 <fieldset className="admin-thumb-fieldset">
  <legend>Film thumbnail</legend>
  {video.has_thumbnail?<Image className="admin-thumb-preview" unoptimized alt={video.title+" thumbnail"} src={`/videos/${video.id}/thumbnail?v=${encodeURIComponent(video.thumbnail_version)}`} width={360} height={203}/>:<p className="muted tiny">No custom thumbnail. A neutral placeholder is displayed in the catalog.</p>}
  <label htmlFor={`thumbnail-${video.id}`}>Upload a thumbnail (JPG, PNG or WebP, max 500 KB)</label>
  <input id={`thumbnail-${video.id}`} type="file" name="thumbnail" accept="image/jpeg,image/png,image/webp"/>
  {video.has_thumbnail&&<label className="checkbox-line"><input type="checkbox" name="remove_thumbnail" value="yes"/> Remove existing thumbnail</label>}
 </fieldset>
 <label>Required membership tier (only applies when this video is not free)</label><select name="tier" defaultValue={video.tier}><option value="basic">Basic and above</option><option value="plus">Plus and above</option><option value="premium">Premium only</option><option value="purchase_only">Individual purchase only (checkout not yet configured)</option></select>
 <label className="checkbox-line"><input type="checkbox" name="rights" value="yes" defaultChecked={video.rights_verified}/> I confirm we have legal distribution rights for this video.</label>
 <label className="checkbox-line"><input type="checkbox" name="rating" value="yes" defaultChecked={video.rating_reviewed}/> I have reviewed the content classification, age restrictions and eligibility.</label>
 <label className="checkbox-line"><input type="checkbox" name="published" value="yes" defaultChecked={video.published}/> List the video publicly when both reviews are complete.</label>
 {state?.message&&<div role="status" aria-live="polite" className={state.ok?"save-confirmation":"form-alert"}><strong>{state.ok?"✓ ":""}{state.message}</strong>{state.ok&&state.savedAt&&<small style={{display:"block",marginTop:6}}>Saved in Neon · {new Date(state.savedAt).toLocaleString()}</small>}</div>}
 <button className="btn" disabled={busy}>{busy?"Saving changes…":"Save changes"}</button></form>
}
