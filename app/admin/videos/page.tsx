import Link from "next/link";
import {redirect} from "next/navigation";
import {db,getAdminSession} from "../../../lib/admin";
import {getVideoDiagnostics} from "../../../lib/bunny";
import {ImportVideo,EditVideo,SyncBunnyUploads} from "./video-forms";
export const dynamic="force-dynamic";
export const metadata={title:"Video management | Fim Addis",robots:{index:false,follow:false}};
export default async function VideoManagement(){
 const admin=await getAdminSession();if(!admin)redirect("/admin/login");
 const sql=db();
 const videos=await sql`SELECT id,bunny_guid,title,description,tier,is_free,thumbnail_bytes IS NOT NULL AS has_thumbnail,thumbnail_updated_at,rights_verified,rating_reviewed,published FROM public.fim_videos ORDER BY added_at DESC LIMIT 50`;
 const libraryId=process.env.BUNNY_STREAM_LIBRARY_ID||"Not configured";
 let library:Awaited<ReturnType<typeof getVideoDiagnostics>>=[];let errorMessage="";
 try{library=await getVideoDiagnostics()}
 catch(error){errorMessage=error instanceof Error?error.message:"The connection failed."}
 const saved=new Set(videos.map(v=>v.bunny_guid));
 const unimported=library.filter(item=>!saved.has(item.guid));
 return <main className="shell admin-dashboard"><Link href="/admin" className="subtle-link">← Dashboard</Link><p className="eyebrow" style={{marginTop:34}}>ADMINISTRATION</p><h1>Video management</h1><p className="muted">Sync videos uploaded in Bunny, review licensing and age classification, choose Free or a paid tier, then publish each video. Free videos can be watched without a membership once secure Bunny playback is available. Paid videos require an approved account and eligible membership.</p>
 <section className="admin-section"><h2>Bunny Stream uploads</h2>
 <p className="muted">Connected library ID in Vercel: <strong>{libraryId}</strong>. Compare this with the Library ID displayed in your Bunny Stream dashboard. They must match, and the API key must belong to that same library.</p>
 {errorMessage?<div className="form-alert" role="status"><strong>Unable to read Bunny uploads:</strong> {errorMessage} Verify the library ID and its matching Stream API key in Vercel. Your website catalog is independent of the Bunny upload list.</div>:
 <><p className="muted">Bunny uploads: <strong>{library.length}</strong> · New uploads to import: <strong>{unimported.length}</strong> · Saved catalog entries: <strong>{videos.length}</strong></p>
 <SyncBunnyUploads/>
 {unimported.length?unimported.map(x=><ImportVideo key={x.guid} guid={x.guid} title={x.title} status={x.status}/>):<p className="muted">{library.length?"No new uploads to import. Scroll to the catalog editors below to publish videos.":"No Bunny uploads found. Make sure you uploaded to the library ID shown above."}</p>}
 </>}
 </section>
 <section className="admin-section"><p className="eyebrow">PUBLIC CATALOG</p><h2>Free catalog</h2><p className="muted">Mark any imported Bunny video as Free in its editor below. Free films have no membership paywall, but still require distribution rights, age-classification review, and publication.</p>
 <p className="muted">{videos.filter(v=>v.is_free&&v.published).length} published free film(s) · {videos.filter(v=>v.is_free&&!v.published).length} free draft(s)</p>
 </section>
 <section className="admin-section"><p className="eyebrow">CATALOG ENTRIES</p><h2>Manage free and paid films</h2><div className="video-admin-grid">{videos.length?videos.map(v=><EditVideo key={v.id} video={{id:String(v.id),title:String(v.title),description:String(v.description||""),tier:String(v.tier),is_free:Boolean(v.is_free),has_thumbnail:Boolean(v.has_thumbnail),thumbnail_version:v.thumbnail_updated_at?new Date(v.thumbnail_updated_at).getTime().toString():"0",rights_verified:Boolean(v.rights_verified),rating_reviewed:Boolean(v.rating_reviewed),published:Boolean(v.published)}}/>):<p className="muted">Import a video from Bunny first.</p>}</div></section>
 </main>;
}
