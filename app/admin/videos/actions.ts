"use server";
import {revalidatePath} from "next/cache";
import {getAdminSession,db} from "../../../lib/admin";
import {getVideoDiagnostics} from "../../../lib/bunny";

type State={message:string;ok?:boolean;savedAt?:string};
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function failureMessage(error:unknown, operation:"import"|"save"){
  console.error(`[Fim Addis Video Manager] ${operation} failed`,error instanceof Error?{name:error.name,message:error.message}:String(error));
  return "The database could not "+(operation==="save"?"save these changes.":"import the video.")+" Please try again.";
}

export async function importBunnyVideo(_state:State|null,form:FormData):Promise<State>{
 const admin=await getAdminSession();
 if(!admin)return {message:"Your administrator session expired. Sign in again."};
 const guid=String(form.get("guid")||"").trim();
 if(!uuidPattern.test(guid))return {message:"Invalid Bunny Stream video ID."};
 let bunny:Awaited<ReturnType<typeof getVideoDiagnostics>>;
 try{bunny=await getVideoDiagnostics()}
 catch{return {message:"Unable to reach Bunny Stream. The video wasn't imported. Please retry when Bunny is available."}}
 const video=bunny.find(x=>x.guid.toLowerCase()===guid.toLowerCase());
 if(!video)return {message:"Video not found in your Bunny Stream library. Refresh the page and try again."};
 try{
  const sql=db();
  // Save the video and its audit record as one PostgreSQL operation. A conflict is not a successful import.
  const result=await sql`
   WITH added AS (
     INSERT INTO public.fim_videos(bunny_guid,title,tier,published)
     VALUES(${video.guid},${video.title?.trim()||"Untitled video"},'basic',false)
     ON CONFLICT(bunny_guid) DO NOTHING RETURNING id
   ), audit AS (
     INSERT INTO public.fim_audit_log(actor_email,action,details)
     SELECT ${admin.email},'video_imported',jsonb_build_object('video_id',id,'bunny_guid',${video.guid})
     FROM added RETURNING id
   )
   SELECT added.id FROM added JOIN audit ON true`;
  if(!result.length)return {message:"This Bunny video is already in the catalog. Find it under Catalog entries below."};
  revalidatePath("/admin/videos");
  return {ok:true,message:"Imported successfully. It is saved as a private draft; review its rights and rating before publishing."};
 }catch(e){return {message:failureMessage(e,"import")}}
}

export async function updateVideo(_state:State|null,form:FormData):Promise<State>{
 const admin=await getAdminSession();
 if(!admin)return {message:"Your administrator session expired. Sign in again."};
 const id=String(form.get("id")||"").trim();
 const title=String(form.get("title")||"").trim().slice(0,180);
 const description=String(form.get("description")||"").trim().slice(0,2400);
 const tier=String(form.get("tier")||"basic");
 const isFree=form.get("is_free")==="yes";
 const rights=form.get("rights")==="yes";
 const rating=form.get("rating")==="yes";
 const requestedPublication=form.get("published")==="yes";
 const removeThumbnail=form.get("remove_thumbnail")==="yes";
 const upload=form.get("thumbnail");
 const thumbnail=upload&&typeof upload!=="string"&&upload.size>0?upload:null;
 if(thumbnail&&removeThumbnail)return {message:"Choose either a new thumbnail or Remove, not both."};
 if(thumbnail&&thumbnail.size>500_000)return {message:"Thumbnail is too large. Use JPG, PNG or WebP under 500 KB."};
 let thumbnailAction:"keep"|"replace"|"remove"=removeThumbnail?"remove":"keep";
 let thumbnailData="";
 let thumbnailMime:string|null=null;
 if(thumbnail){
  const data=Buffer.from(await thumbnail.arrayBuffer());
  const hex=data.subarray(0,12).toString("hex");
  thumbnailMime=hex.startsWith("ffd8ff")?"image/jpeg":hex.startsWith("89504e470d0a1a0a")?"image/png":
   (data.subarray(0,4).toString("ascii")==="RIFF"&&data.subarray(8,12).toString("ascii")==="WEBP")?"image/webp":null;
  if(!thumbnailMime)return {message:"Thumbnail must be a valid JPG, PNG or WebP image."};
  thumbnailAction="replace";
  thumbnailData=data.toString("base64");
 }
 if(!uuidPattern.test(id)||!title||!["basic","plus","premium","purchase_only"].includes(tier))
  return {message:"Enter a title and select a valid tier before saving."};
 try{
  const sql=db();
  const current=await sql`SELECT bunny_guid,published FROM public.fim_videos WHERE id=${id}::uuid LIMIT 1`;
  if(!current.length)return {message:"This video was not found. Refresh the manager and retry."};

  let publish=requestedPublication&&rights&&rating;
  let publicationNote=requestedPublication&&!publish?" Publication is off until distribution rights and content-rating review are confirmed.":"";
  // Check encoding ONLY when publishing a draft for the first time.
  // Editing an already-published video must not fail because the Bunny API is temporarily unavailable.
  if(publish&&!current[0].published){
   try{
    const library=await getVideoDiagnostics();
    const item=library.find(x=>x.guid===current[0].bunny_guid);
    if(!item||item.status!==4){
     publish=false;
     publicationNote=item?.status===5
      ?" The Bunny encode has failed, so this video remains a draft."
      :" Bunny hasn't confirmed that the video is ready, so it remains a draft.";
    }
   }catch{
    publish=false;
    publicationNote=" Bunny is temporarily unavailable. Changes were saved as a draft; try publishing again later.";
   }
  }

  // Keep saving metadata independent of a temporary Bunny API outage, with an atomic audit record.
  const result=await sql`
   WITH updated AS (
    UPDATE public.fim_videos
    SET title=${title},description=${description},tier=${tier},
        is_free=${isFree},rights_verified=${rights},rating_reviewed=${rating},
        thumbnail_bytes=CASE WHEN ${thumbnailAction}='remove' THEN NULL
          WHEN ${thumbnailAction}='replace' THEN decode(${thumbnailData},'base64')
          ELSE thumbnail_bytes END,
        thumbnail_mime=CASE WHEN ${thumbnailAction}='remove' THEN NULL
          WHEN ${thumbnailAction}='replace' THEN ${thumbnailMime} ELSE thumbnail_mime END,
        thumbnail_updated_at=CASE WHEN ${thumbnailAction}='keep' THEN thumbnail_updated_at ELSE now() END,
        published=${publish},updated_at=now()
    WHERE id=${id}::uuid
    RETURNING id,updated_at,published
   ), audit AS (
    INSERT INTO public.fim_audit_log(actor_email,action,details)
    SELECT ${admin.email},'video_updated',
      jsonb_build_object('id',id,'published',published,'tier',${tier},'is_free',${isFree},'thumbnail_action',${thumbnailAction})
    FROM updated RETURNING id
   )
   SELECT updated.id,updated.updated_at,updated.published FROM updated JOIN audit ON true`;
  if(!result.length)return {message:"Video could not be updated. Refresh the page and retry."};
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  revalidatePath(`/videos/${id}`);
  const timestamp=new Date(result[0].updated_at).toISOString();
  return {ok:true,savedAt:timestamp,message:publicationNote
    ?"Video details saved."+publicationNote
    :publish?"Video saved and published to the approved catalog.":"Video saved as a private draft."};
 }catch(e){return {message:failureMessage(e,"save")}}
}
