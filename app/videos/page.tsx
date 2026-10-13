import Link from "next/link";
import {getBunnyLibraryHealth} from "../../lib/bunny";
export const dynamic="force-dynamic";
export const metadata={title:"Videos | Fim Addis"};
export default async function VideosPage(){
 const health=await getBunnyLibraryHealth();
 return <main className="shell" style={{paddingTop:65,paddingBottom:95}}>
 <Link className="muted" href="/">← Fim Addis</Link>
 <p className="eyebrow" style={{marginTop:35}}>FILM LIBRARY</p><h1 className="page-title">Discover Fim Addis.</h1>
 <p className="muted" style={{maxWidth:680,lineHeight:1.8}}>Discover films by category and language once titles have passed distribution-rights and content-rating review. Videos remain locked until eligible membership or individual purchase is confirmed.</p>
 <div className="library-info"><h2>Library update</h2>
  {!health.connected?<p>Our video catalog is being prepared. Please return soon.</p>:health.total===0?<p>The video library has no published titles yet.</p>:<>
   <p>{health.total} item{health.total===1?"":"s"} received by the media library. {health.processing>0?`${health.processing} item(s) currently processing. `:""}Only reviewed and approved films will appear for viewing.</p>
   {health.ready>0?<p>{health.ready} item(s) processed successfully and awaiting catalog approval.</p>:null}
  </>}
  <div className="library-placeholder" aria-hidden="true"><span>FIM ADDIS</span><span>ፍም አዲስ</span></div>
 </div>
 </main>;
}
