import Link from "next/link";
import {notFound} from "next/navigation";
import {createHash} from "node:crypto";
import {db} from "../../../lib/admin";
import {getViewer,getActiveMembership} from "../../../lib/member";
import {getAccountReview} from "../../../lib/account-approval";
import {canAuthorizePlayback} from "../../../lib/publication-policy";
import PlanPrompt from "../plan-prompt";
export const dynamic="force-dynamic";
export const metadata={title:"Watch | Fim Addis",robots:{index:false,follow:false}};
export default async function WatchPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const sql=db();
 const rows=await sql`SELECT id,title,description,tier,is_free,bunny_guid FROM public.fim_videos
 WHERE id=${id}::uuid AND published AND rights_verified AND rating_reviewed LIMIT 1`;
 if(!rows.length)notFound();
 const video=rows[0];const free=Boolean(video.is_free);
 let entitled=free;
 if(!free){
  const user=await getViewer();
  if(user&&(await getAccountReview(user.id)).status==="approved"){
   const membership=await getActiveMembership(user.id);
   const rank={basic:1,plus:2,premium:3}[String(video.tier) as "basic"|"plus"|"premium"]||99;
   const purchased=video.tier==="purchase_only"?await sql`SELECT 1 FROM public.fim_video_entitlements WHERE user_id=${user.id} AND video_id=${id}::uuid LIMIT 1`:[];
   entitled=Boolean((membership&&Number(membership.rank)>=rank)||purchased.length);
  }
 }
 const flag=await sql`SELECT value FROM public.fim_site_settings WHERE key='playback_open' LIMIT 1`;
 const available=entitled&&canAuthorizePlayback()&&flag[0]?.value==="true";
 let iframe="";
 if(available){
  const expires=Math.floor(Date.now()/1000)+3*60*60;
  const guid=String(video.bunny_guid);
  const key=process.env.BUNNY_STREAM_TOKEN_KEY||"";
  const token=createHash("sha256").update(key+guid+expires).digest("hex");
  iframe=`https://player.mediadelivery.net/embed/${process.env.BUNNY_STREAM_LIBRARY_ID}/${guid}?token=${token}&expires=${expires}`;
 }
 return <main className="shell" style={{paddingTop:65,paddingBottom:95,maxWidth:1000}}>
 <Link href="/videos" className="subtle-link">← Film library</Link>
 <p className="eyebrow" style={{marginTop:34}}>{free?"FREE TO WATCH":"FIM ADDIS MEMBERSHIP"}</p>
 <h1 className="page-title">{video.title}</h1><p className="muted">{video.description}</p>
 {!entitled?<div className="checkout-note"><h2>Membership required</h2><p>This is a paid film. Pick an eligible membership to unlock it after account and payment approval.</p><PlanPrompt title={String(video.title)} minTier={String(video.tier)} purchaseOnly={video.tier==="purchase_only"}/></div>
 :!available?<div className="checkout-note" role="status"><h2>{free?"Free film":"Film"} currently unavailable</h2><p>Streaming is being prepared. Playback will be available after Bunny Stream security and publication checks are completed. No payment is required for free films.</p></div>
 :<div className="signed-player"><iframe src={iframe} title={String(video.title)} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>}
 </main>;
}
