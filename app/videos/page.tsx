import Link from "next/link";
import {db} from "../../lib/admin";
export const dynamic="force-dynamic";
export const metadata={title:"Film library | Fim Addis"};
type Video={id:string;title:string;description:string;tier:string;is_free:boolean};
function Grid({items}:{items:Video[]}){
 return <div className="film-grid">{items.map(v=><article key={v.id} className="film-card">
 <Link href={`/videos/${v.id}`} className="film-card-link"><div className="film-art">ፍ</div><div className="film-body">
 <span className="eyebrow">{v.is_free?"FREE TO WATCH":v.tier==="purchase_only"?"INDIVIDUAL PURCHASE":v.tier.toUpperCase()+" MEMBERSHIP"}</span>
 <h3>{v.title}</h3><p className="muted">{v.description||"Discover this Fim Addis release."}</p>
 <span className="subtle-link">{v.is_free?"Watch free →":"View film →"}</span>
 </div></Link></article>)}</div>;
}
export default async function VideosPage(){
 const sql=db();const rows=await sql`SELECT id,title,description,tier,is_free FROM public.fim_videos
 WHERE published=true AND rights_verified=true AND rating_reviewed=true ORDER BY is_free DESC,added_at DESC LIMIT 120`;
 const videos=rows.map(v=>({id:String(v.id),title:String(v.title),description:String(v.description||""),tier:String(v.tier),is_free:Boolean(v.is_free)}));
 const free=videos.filter(v=>v.is_free),paid=videos.filter(v=>!v.is_free);
 return <main className="shell" style={{paddingTop:65,paddingBottom:95}}>
 <Link className="muted" href="/">← Fim Addis</Link><p className="eyebrow" style={{marginTop:35}}>FILM LIBRARY</p><h1 className="page-title">Discover the films.</h1>
 <p className="muted" style={{maxWidth:680,lineHeight:1.8}}>Watch free selections without a subscription. Choose a membership only when you want to unlock a paid title.</p>
 <section className="admin-section"><div className="library-heading"><div><p className="eyebrow">FREE CATALOG</p><h2>Watch for free</h2></div><span className="muted">{free.length} title(s)</span></div>
 {free.length?<Grid items={free}/>:<p className="muted">Free films are being prepared. Check back as new titles are published.</p>}</section>
 <section className="admin-section"><div className="library-heading"><div><p className="eyebrow">MEMBER CATALOG</p><h2>More to discover</h2></div><Link href="/membership" className="subtle-link">Compare plans →</Link></div>
 {paid.length?<Grid items={paid}/>:<p className="muted">Additional member titles will appear here once approved.</p>}</section>
 </main>;
}
