import Link from "next/link";
import {redirect} from "next/navigation";
import {db,getAdminSession} from "../../../lib/admin";
import {getVideoDiagnostics} from "../../../lib/bunny";
import {ImportVideo,EditVideo} from "./video-forms";
export const dynamic="force-dynamic";
export const metadata={title:"Video management | Fim Addis",robots:{index:false,follow:false}};
export default async function VideoManagement(){
 const admin=await getAdminSession();if(!admin)redirect("/admin/login");
 const sql=db();
 const videos=await sql`SELECT id,bunny_guid,title,description,tier,rights_verified,rating_reviewed,published FROM public.fim_videos ORDER BY added_at DESC LIMIT 50`;
 let library:Awaited<ReturnType<typeof getVideoDiagnostics>>=[];let unavailable=false;
 try{library=await getVideoDiagnostics()}catch{unavailable=true}
 const saved=new Set(videos.map(v=>v.bunny_guid));
 return <main className="shell admin-dashboard"><Link href="/admin" className="subtle-link">← Dashboard</Link><p className="eyebrow" style={{marginTop:34}}>ADMINISTRATION</p><h1>Video management</h1><p className="muted">Import media from Bunny, review licensing and age classification, assign a tier, then publish. Published titles still require authenticated viewing and secured Bunny playback.</p>
 <section className="admin-section"><h2>Bunny Stream library</h2>{unavailable?<p>Bunny API unavailable. Check its credentials.</p>:library.length?library.filter(x=>!saved.has(x.guid)).map(x=><ImportVideo key={x.guid} guid={x.guid} title={x.title} status={x.status}/>):<p className="muted">No unimported Bunny videos found.</p>}</section>
 <section className="admin-section"><h2>Catalog entries</h2><div className="video-admin-grid">{videos.length?videos.map(v=><EditVideo key={v.id} video={v}/>):<p className="muted">Import a video first to configure access.</p>}</div></section>
 </main>
}
