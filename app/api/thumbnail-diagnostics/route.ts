import {db} from "../../../lib/admin";
import {getVideoDiagnostics} from "../../../lib/bunny";
export const dynamic="force-dynamic";
export const maxDuration=30;
export async function GET(){
 const headers={"Content-Type":"application/json","Cache-Control":"no-store, no-cache, max-age=0"};
 try{
  const sql=db();
  const rows=await sql`SELECT bunny_guid FROM public.fim_videos WHERE thumbnail_bytes IS NULL ORDER BY added_at DESC LIMIT 1`;
  const target=String(rows[0]?.bunny_guid||"");
  if(!target)return new Response(JSON.stringify({status:"no_missing_artwork"}),{headers});
  const library=await getVideoDiagnostics();
  const selected=library.find(x=>x.guid===target);
  if(!selected)return new Response(JSON.stringify({status:"bunny_video_missing"}),{headers});
  const raw=String(selected.thumbnailFileName||"");
  const host=String(process.env.BUNNY_STREAM_CDN_HOSTNAME||"").replace(/^https:\/\//i,"").replace(/\/$/,"");
  const safeName=/^[-A-Za-z0-9_.]+$/.test(raw||"thumbnail.jpg");
  const shape=raw?({size:raw.length,extension:raw.split(".").pop()?.slice(0,8)||"",safeName,hasSlash:raw.includes("/")||raw.includes("\\")}):{size:0,extension:"",safeName:false,hasSlash:false};
  const names=[...new Set([raw||"thumbnail.jpg","thumbnail.jpg","thumbnail_1.jpg"])].filter(n=>n.length<121&&/^[-A-Za-z0-9_.]+$/.test(n));
  const probes=[];
  for(const name of names){
   const url="https://"+host+"/"+encodeURIComponent(target)+"/"+encodeURIComponent(name);
   try{
    const res=await fetch(url,{headers:{Referer:"https://fim-addis.vercel.app/"},cache:"no-store",signal:AbortSignal.timeout(5500),redirect:"manual"});
    const type=res.headers.get("content-type")||"";
    let hex="";
    if(res.ok){const bytes=Buffer.from(await res.arrayBuffer());hex=bytes.subarray(0,8).toString("hex")}
    probes.push({variant:name===raw?"selected":name==="thumbnail.jpg"?"default":"alternative",http:res.status,type:type.split(";")[0],len:res.headers.get("content-length"),locationPresent:!!res.headers.get("location"),imageMagic:hex});
   }catch(e){probes.push({variant:name===raw?"selected":name==="thumbnail.jpg"?"default":"alternative",error:e instanceof Error?e.name:"fetch_error",message:e instanceof Error?e.message.slice(0,130):"failure"})}
  }
  return new Response(JSON.stringify({status:"checked",bunnyStatus:selected.status,filenameShape:shape,cdnConfigured:!!host,probes}),{headers});
 }catch(e){return new Response(JSON.stringify({status:"error",type:e instanceof Error?e.name:"unknown",message:e instanceof Error?e.message.slice(0,120):"unknown"}),{headers,status:500})}
}
