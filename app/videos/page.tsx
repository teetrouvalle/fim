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
  <div style="position:relative;padding-top:56.25%;"><iframe src="https://player.mediadelivery.net/embed/778486/812bbd6d-6f2d-440d-af01-15b2df638c10?autoplay=true&loop=false&muted=true&preload=true&responsive=true" loading="lazy" style="border:0;position:absolute;top:0;height:100%;width:100%;" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;" allowfullscreen="true"></iframe></div>
 </div>
 </main>;
}
