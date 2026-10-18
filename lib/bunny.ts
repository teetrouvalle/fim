import "server-only";
type BunnyVideo = { guid: string; title: string; status: number; length: number; storageSize: number; encodeProgress: number; dateUploaded: string; thumbnailFileName: string | null; isPublic: boolean };
type BunnyListResponse = { items?: BunnyVideo[]; totalItems?: number };
export type BunnyLibraryHealth = { connected: boolean; total: number; ready: number; processing: number; failed: number; error?: "missing_configuration"|"unavailable"|"authorization_failed" };
/** No media identifiers, titles, CDN URLs, or credentials are returned. Playback and publication remain separate server-gated operations. */
export async function getBunnyLibraryHealth():Promise<BunnyLibraryHealth> {
 const id=process.env.BUNNY_STREAM_LIBRARY_ID;
 const key=process.env.BUNNY_STREAM_API_KEY;
 if(!id||!key||!/^\d+$/.test(id))return {connected:false,total:0,ready:0,processing:0,failed:0,error:"missing_configuration"};
 try {
  const res=await fetch(`https://video.bunnycdn.com/library/${id}/videos?page=1&itemsPerPage=100`,{
   headers:{"AccessKey":key,"Accept":"application/json"},cache:"no-store",signal:AbortSignal.timeout(8000)
  });
  if(!res.ok)return {connected:false,total:0,ready:0,processing:0,failed:0,error:res.status===401||res.status===403?"authorization_failed":"unavailable"};
  const data=await res.json() as BunnyListResponse;
  const items=Array.isArray(data.items)?data.items:[];
  return {connected:true,total:Math.max(items.length,Number(data.totalItems)||0),ready:items.filter(x=>x.status===4).length,processing:items.filter(x=>![4,5].includes(x.status)).length,failed:items.filter(x=>x.status===5).length};
 }catch{return {connected:false,total:0,ready:0,processing:0,failed:0,error:"unavailable"};}
}
/** Owner diagnostics only, do not expose this to public API calls. */
export type BunnyVideoSummary=Pick<BunnyVideo,"guid"|"title"|"status"|"length"|"storageSize"|"encodeProgress"|"thumbnailFileName">;
export async function getVideoDiagnostics():Promise<BunnyVideoSummary[]> {
 const id=process.env.BUNNY_STREAM_LIBRARY_ID;
 const key=process.env.BUNNY_STREAM_API_KEY;
 if(!id||!key||!/^[0-9]+$/.test(id))throw new Error("Bunny library ID or API key is not configured");
 const all:BunnyVideoSummary[]=[];
 // Bunny paginates at 100 videos. Fetch subsequent pages so recent uploads are not hidden.
 for(let page=1;page<=10;page++){
  const response=await fetch(`https://video.bunnycdn.com/library/${id}/videos?page=${page}&itemsPerPage=100&orderBy=date`,{
   headers:{"AccessKey":key,"Accept":"application/json"},cache:"no-store",signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)throw new Error(response.status===401||response.status===403
   ?"Bunny Stream API key was rejected for this video library."
   :`Bunny Stream returned HTTP ${response.status}.`);
  const data=await response.json() as BunnyListResponse;
  const videos=Array.isArray(data.items)?data.items:[];
  all.push(...videos.map(v=>({guid:v.guid,title:v.title,status:v.status,length:v.length,storageSize:v.storageSize,encodeProgress:v.encodeProgress,thumbnailFileName:v.thumbnailFileName||null})));
  if(videos.length<100||all.length>=Number(data.totalItems)||page===10)break;
 }
 return all;
}

/**
 * Copy the selected Bunny Stream thumbnail into Fim Addis, without exposing
 * private API keys or private video files to browsers.
 * CDN token authentication is separate from Stream embed authentication.
 */
export type BunnyThumbnailResult=
 |{ok:true;base64:string;mime:"image/jpeg"|"image/png"|"image/webp"}
 |{ok:false;reason:"invalid_id"|"invalid_filename"|"cdn_unconfigured"|"denied_403"|"missing_404"|"redirect"|"unavailable"|"too_large"|"invalid_image"|"other_http"};
export async function downloadBunnyThumbnail(video:Pick<BunnyVideoSummary,"guid"|"thumbnailFileName">):Promise<BunnyThumbnailResult>{
 const guid=String(video.guid||"");
 if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(guid))return {ok:false,reason:"invalid_id"};
 const name=String(video.thumbnailFileName||"thumbnail.jpg").trim();
 if(name.length>120||!/^[-A-Za-z0-9_.]+$/.test(name)||name==="."||name===".."||name.includes(".."))return {ok:false,reason:"invalid_filename"};
 const host=String(process.env.BUNNY_STREAM_CDN_HOSTNAME||"").trim().replace(/^https:\/\//i,"").replace(/\/$/,"");
 if(!/^[a-z0-9-]+\.b-cdn\.net$/i.test(host))return {ok:false,reason:"cdn_unconfigured"};
 const pathname="/"+guid+"/"+encodeURIComponent(name);
 const url="https://"+host+pathname;
 const options={cache:"no-store" as const,redirect:"manual" as const,signal:AbortSignal.timeout(6500),headers:{Referer:"https://fim-addis.vercel.app/"}};
 let response:Response;
 try{
  response=await fetch(url,options);
  // Stream embed-key auth does NOT sign the separate CDN pull-zone URLs.
  if(response.status===403&&process.env.BUNNY_CDN_TOKEN_KEY){
   const {createHmac}=await import("node:crypto");
   const expires=Math.floor(Date.now()/1000)+300;
   const token="HS256-"+createHmac("sha256",process.env.BUNNY_CDN_TOKEN_KEY)
    .update(pathname+expires).digest("base64url");
   response=await fetch(url+"?token="+encodeURIComponent(token)+"&expires="+expires,options);
  }
 }catch{return {ok:false,reason:"unavailable"};}
 if(response.status===403)return {ok:false,reason:"denied_403"};
 if(response.status===404)return {ok:false,reason:"missing_404"};
 if(response.status>=300&&response.status<400)return {ok:false,reason:"redirect"};
 if(!response.ok)return {ok:false,reason:"other_http"};
 if(Number(response.headers.get("content-length")||0)>500000)return {ok:false,reason:"too_large"};
 let bytes:Buffer;
 try{bytes=Buffer.from(await response.arrayBuffer())}catch{return {ok:false,reason:"unavailable"};}
 if(bytes.length>500000)return {ok:false,reason:"too_large"};
 if(bytes.length<12)return {ok:false,reason:"invalid_image"};
 const magic=bytes.subarray(0,12).toString("hex");
 let mime:"image/jpeg"|"image/png"|"image/webp"|null=null;
 if(magic.startsWith("ffd8ff"))mime="image/jpeg";
 else if(magic.startsWith("89504e470d0a1a0a"))mime="image/png";
 else if(bytes.subarray(0,4).toString("ascii")==="RIFF"&&bytes.subarray(8,12).toString("ascii")==="WEBP")mime="image/webp";
 if(!mime)return {ok:false,reason:"invalid_image"};
 return {ok:true,base64:bytes.toString("base64"),mime};
}
