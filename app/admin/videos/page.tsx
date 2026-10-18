import Link from "next/link";
import {redirect} from "next/navigation";
import {db,getAdminSession} from "../../../lib/admin";
import {getVideoDiagnostics} from "../../../lib/bunny";
import {ImportVideo,EditVideo,DeleteVideo,SyncBunnyUploads} from "./video-forms";
export const dynamic="force-dynamic";
export const metadata={title:"Video management | Fim Addis",robots:{index:false,follow:false}};
export default async function VideoManagement({searchParams}:{searchParams:Promise<{bunny?:string}>}){
 const admin=await getAdminSession();if(!admin)redirect("/admin/login");
 const query=await searchParams;
 const showBunnyUploads=query.bunny==="1";
 const sql=db();
 const videos=await sql`SELECT id,bunny_guid,title,description,tier,is_free,thumbnail_bytes IS NOT NULL AS has_thumbnail,thumbnail_updated_at,rights_verified,rating_reviewed,published,show_on_home FROM public.fim_videos ORDER BY published ASC, added_at DESC LIMIT 50`;
 const libraryId=process.env.BUNNY_STREAM_LIBRARY_ID||"Not configured";
 let library:Awaited<ReturnType<typeof getVideoDiagnostics>>=[];let errorMessage="";
 if(showBunnyUploads){
  try{library=await getVideoDiagnostics()}
  catch(error){errorMessage=error instanceof Error?error.message:"The connection failed."}
 }
 const saved=new Set(videos.map(v=>v.bunny_guid));
 const unimported=library.filter(item=>!saved.has(item.guid));
 return <main className="shell admin-dashboard"><Link href="/admin" className="subtle-link">← Dashboard</Link><p className="eyebrow" style={{marginTop:34}}>ADMINISTRATION</p><h1>Video management</h1><p className="muted">Sync videos uploaded in Bunny, review licensing and age classification, choose Free or a paid tier, then publish each video. Free videos can be watched without a membership once secure Bunny playback is available. Paid videos require an eligible membership.</p>
 <section className="admin-section" id="bunny-uploads">
 <h2>Bunny Stream uploads</h2>
 <p className="muted">The catalog editors below load immediately without contacting Bunny Stream. Use Sync to import new uploads, or check the upload list only when you need it.</p>
 <SyncBunnyUploads/>
 {showBunnyUploads?
   <>
    <p className="muted">Connected Bunny library ID: <strong>{libraryId}</strong>. Compare this with the Stream library ID in Bunny if the upload list is unavailable.</p>
    {errorMessage?<div className="form-alert" role="status"><strong>Unable to read Bunny uploads:</strong> {errorMessage} Verify the Stream library ID and API key in Vercel. Existing video editing is unaffected.</div>:
    <>
     <p className="muted">Bunny uploads: <strong>{library.length}</strong> · New uploads to import: <strong>{unimported.length}</strong> · Saved catalog entries: <strong>{videos.length}</strong></p>
     {unimported.length?unimported.map(x=><ImportVideo key={x.guid} guid={x.guid} title={x.title} status={x.status}/>):<p className="muted">{library.length?"No new Bunny uploads to import.":"No Bunny uploads were found for this library."}</p>}
    </>}
    <Link href="/admin/videos#bunny-uploads" className="subtle-link">Hide Bunny upload list ↑</Link>
   </>
   :<Link href="/admin/videos?bunny=1#bunny-uploads" className="account-alt-button">Check Bunny upload list ↗</Link>}
 </section>
 <section className="admin-section"><p className="eyebrow">PUBLIC CATALOG</p><h2>Free catalog</h2><p className="muted">Mark any imported Bunny video as Free in its editor below. Free films have no membership paywall, but still require distribution rights, age-classification review, and publication.</p>
 <p className="muted">{videos.filter(v=>v.is_free&&v.published).length} published free film(s) · {videos.filter(v=>v.is_free&&!v.published).length} free draft(s)</p>
 </section>
 <section className="admin-section">
 <p className="eyebrow">CATALOG ENTRIES</p>
 <h2>Manage free and paid films</h2>
 <p className="muted"><strong>{videos.filter(v=>!v.published).length} video(s) still in drafts.</strong> Drafts appear first. Expand a draft, confirm distribution rights and content classification, check Published, then save. Videos are shown publicly only after all checks are complete.</p>
 <p className="muted">Choose whether each paid video appears on the homepage. The three free films at the top of the homepage remain unchanged.</p>
 <div className="video-manager-list">
 {videos.length?videos.map(v=><details className="video-manager-item" key={String(v.id)}>
   <summary className="video-manager-summary">
     <span className="video-manager-name">{String(v.title)}{!v.published&&<span className="video-manager-draft"> · DRAFT</span>}</span>
     <span className="video-manager-tier">{v.is_free?"Free":v.tier==="purchase_only"?"Purchase only":String(v.tier).charAt(0).toUpperCase()+String(v.tier).slice(1)}</span>
   </summary>
   <div className="video-manager-details">
     <EditVideo video={{id:String(v.id),title:String(v.title),description:String(v.description||""),tier:String(v.tier),is_free:Boolean(v.is_free),show_on_home:Boolean(v.show_on_home),has_thumbnail:Boolean(v.has_thumbnail),thumbnail_version:v.thumbnail_updated_at?new Date(v.thumbnail_updated_at).getTime().toString():"0",rights_verified:Boolean(v.rights_verified),rating_reviewed:Boolean(v.rating_reviewed),published:Boolean(v.published)}}/>
     <div className="video-manager-delete"><DeleteVideo id={String(v.id)} title={String(v.title)}/></div>
   </div>
 </details>):<p className="muted">Import a video from Bunny first.</p>}
 </div>
 </section>
 </main>;
}
