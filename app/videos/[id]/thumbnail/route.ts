import {db,getAdminSession} from "../../../../lib/admin";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f-]{36}$/i;
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!UUID.test(id))return new Response("Not found",{status:404});
 try{
  const sql=db();
  const rows=await sql`SELECT thumbnail_bytes,thumbnail_mime,published,rights_verified,rating_reviewed
   FROM public.fim_videos WHERE id=${id}::uuid LIMIT 1`;
  const video=rows[0];
  if(!video?.thumbnail_bytes)return new Response("Not found",{status:404});
  if(!video.published||!video.rights_verified||!video.rating_reviewed){
   const admin=await getAdminSession();
   if(!admin)return new Response("Not found",{status:404});
  }
  if(!["image/png","image/jpeg","image/webp"].includes(String(video.thumbnail_mime)))
   return new Response("Not found",{status:404});
  const raw=video.thumbnail_bytes;
  const bytes=typeof raw==="string"?Buffer.from(raw.replace(/^\\x/,""),"hex"):Buffer.from(raw);
  if(!bytes.length||bytes.length>500_000)return new Response("Not found",{status:404});
  return new Response(new Uint8Array(bytes),{headers:{
   "Content-Type":String(video.thumbnail_mime),
   "Content-Disposition":"inline",
   "Cache-Control":"no-store",
   "X-Content-Type-Options":"nosniff"
  }});
 }catch{return new Response("Not found",{status:404})}
}
