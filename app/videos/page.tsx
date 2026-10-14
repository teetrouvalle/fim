import Link from "next/link";
import {db} from "../../lib/admin";
import {getBunnyLibraryHealth} from "../../lib/bunny";
export const dynamic="force-dynamic";
export const metadata={title:"Film library | Fim Addis"};
export default async function VideosPage(){
 const [health,videos]=await Promise.all([
 getBunnyLibraryHealth(),
 db()`SELECT id,title,description,tier FROM public.fim_videos WHERE published=true AND rights_verified=true AND rating_reviewed=true ORDER BY added_at DESC LIMIT 60`
 ]);
 return <main className="shell" style={{paddingTop:65,paddingBottom:95}}>
 <Link className="muted" href="/">← Fim Addis</Link><p className="eyebrow" style={{marginTop:35}}>FILM LIBRARY</p><h1 className="page-title">Discover Fim Addis.</h1>
 <p className="muted" style={{maxWidth:680,lineHeight:1.8}}>Browse curated films with verified distribution permissions and content review. Videos require the appropriate paid membership or an individual video entitlement.</p>
 {videos.length?<div className="film-grid">{videos.map(v=><article key={v.id} className="film-card"><div className="film-art">ፍ</div><div className="film-body"><span className="eyebrow">{v.tier==="purchase_only"?"INDIVIDUAL PURCHASE":String(v.tier).toUpperCase()+" ACCESS"}</span><h2>{v.title}</h2><p className="muted">{v.description||"Discover the film on Fim Addis."}</p><Link href={`/videos/${v.id}`} className="subtle-link">Film details →</Link></div></article>)}</div>
 :<div className="library-info"><h2>Our catalog is being prepared</h2><p>No licensed and reviewed films have been published yet. Come back as new titles are approved.</p>{health.connected&&<p>{health.ready} media file(s) processed successfully in our private library.</p>}</div>}
 </main>;
}
