"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";
import {getVideoDiagnostics} from "../../../lib/bunny";
type State={message:string;ok?:boolean};
export async function importBunnyVideo(_state:State|null,form:FormData):Promise<State>{
 const admin=await getAdminSession();if(!admin)return {message:"Administrator login required."};
 const guid=String(form.get("guid")||"").trim();
 if(!/^[a-f0-9-]{36}$/i.test(guid))return {message:"Invalid Bunny video ID."};
 try{
  const bunny=await getVideoDiagnostics();
  const v=bunny.find(v=>v.guid===guid);
  if(!v)return {message:"This video is not present in your Bunny library."};
  const sql=db();
  await sql`INSERT INTO public.fim_videos(bunny_guid,title,tier,published) VALUES(${v.guid},${v.title||"Untitled video"},'basic',false) ON CONFLICT(bunny_guid) DO NOTHING`;
  await sql`INSERT INTO public.fim_audit_log(actor_email,action,details) VALUES(${admin.email},'video_imported',jsonb_build_object('guid',${guid}))`;
  revalidatePath("/admin/videos");return {ok:true,message:"Video added as a private draft. Review rights and content rating before publishing."};
 }catch{return {message:"Could not import video. Check Bunny connectivity."}}
}
export async function updateVideo(_state:State|null,form:FormData):Promise<State>{
 const admin=await getAdminSession();if(!admin)return {message:"Administrator login required."};
 const id=String(form.get("id")||"");
 const title=String(form.get("title")||"").trim().slice(0,180);
 const description=String(form.get("description")||"").trim().slice(0,2400);
 const tier=String(form.get("tier")||"basic");
 const rights=form.get("rights")==="yes";
 const rating=form.get("rating")==="yes";
 const published=form.get("published")==="yes";
 if(!/^[0-9a-f-]{36}$/i.test(id)||!title||!["basic","plus","premium","purchase_only"].includes(tier))return {message:"Invalid video details."};
 if(published&&(!rights||!rating))return {message:"Verify your distribution rights and age-rating review before publication."};
 try{
  const sql=db();
  const video=await sql`SELECT bunny_guid FROM public.fim_videos WHERE id=${id}::uuid`;
  if(!video.length)return {message:"Video not found."};
  if(published){
   const bunny=await getVideoDiagnostics();
   if(bunny.find(v=>v.guid===video[0].bunny_guid)?.status!==4)return {message:"Bunny video is not ready for playback."};
  }
  await sql`UPDATE public.fim_videos SET title=${title},description=${description},tier=${tier},rights_verified=${rights},rating_reviewed=${rating},published=${published},updated_at=now() WHERE id=${id}::uuid`;
  await sql`INSERT INTO public.fim_audit_log(actor_email,action,details) VALUES(${admin.email},'video_updated',jsonb_build_object('id',${id},'published',${published},'rights_verified',${rights},'rating_reviewed',${rating}))`;
  revalidatePath("/admin/videos");revalidatePath("/videos");
  return {ok:true,message:published?"Video listed in the approved catalog.":"Video changes saved."};
 }catch{return {message:"Unable to save. Verify all fields and try again."}}
}
