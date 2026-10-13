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
export async function getVideoDiagnostics():Promise<Pick<BunnyVideo,"guid"|"title"|"status"|"length"|"storageSize"|"encodeProgress">[]> {
 const id=process.env.BUNNY_STREAM_LIBRARY_ID;const key=process.env.BUNNY_STREAM_API_KEY;
 if(!id||!key||!/^\d+$/.test(id))return [];
 const response=await fetch(`https://video.bunnycdn.com/library/${id}/videos?page=1&itemsPerPage=100`,{headers:{"AccessKey":key},cache:"no-store",signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error("Bunny library unavailable");
 const data=await response.json() as BunnyListResponse;
 return (data.items??[]).map(v=>({guid:v.guid,title:v.title,status:v.status,length:v.length,storageSize:v.storageSize,encodeProgress:v.encodeProgress}));
}
