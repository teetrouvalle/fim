import {getAdminSession,db} from "../../../../../lib/admin";
export const dynamic="force-dynamic";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
 const admin=await getAdminSession();
 if(!admin)return new Response("Unauthorized",{status:401});
 const {id}=await context.params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return new Response("Invalid reference",{status:400});
 const sql=db();
 const rows=await sql`SELECT receipt_bytes,receipt_mime FROM public.fim_payment_reviews WHERE id=${id}::uuid LIMIT 1`;
 const p=rows[0];
 if(!p?.receipt_bytes)return new Response("Receipt not uploaded",{status:404});
 const data=p.receipt_bytes;
 const bytes=typeof data==="string"?Buffer.from(data.replace(/^\\x/,""),"hex"):Buffer.from(data);
 const mime=["image/png","image/jpeg","application/pdf"].includes(p.receipt_mime)?p.receipt_mime:"application/octet-stream";
 return new Response(new Uint8Array(bytes),{headers:{"Content-Type":mime,"Cache-Control":"private, no-store, max-age=0","Content-Security-Policy":"default-src 'none'; sandbox","X-Content-Type-Options":"nosniff","Content-Disposition":"inline; filename=receipt"}});
}
