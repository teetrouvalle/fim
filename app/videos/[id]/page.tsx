import Link from "next/link";
import {notFound} from "next/navigation";
import {createHash} from "node:crypto";
import {db} from "../../../lib/admin";
import {getViewer,getActiveMembership} from "../../../lib/member";
import {canAuthorizePlayback} from "../../../lib/publication-policy";
export const dynamic="force-dynamic";
export const metadata={title:"Watch | Fim Addis",robots:{index:false,follow:false}};
export default async function WatchPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const sql=db();
 const rows=await sql`SELECT id,title,description,tier,bunny_guid FROM public.fim_videos WHERE id=${id}::uuid AND published AND rights_verified AND rating_reviewed LIMIT 1`;
 if(!rows.length)notFound();
 const video=rows[0]; const viewer=await getViewer();
 const flags=await sql`SELECT value FROM public.fim_site_settings WHERE key='playback_open' LIMIT 1`;
 let access=false;
 if(viewer?.verified){
  const membership=await getActiveMembership(viewer.id);
  const rank={basic:1,plus:2,premium:3}[String(video.tier) as "basic"|"plus"|"premium"]||99;
  const purchases=video.tier==="purchase_only"?await sql`SELECT 1 FROM public.fim_video_entitlements WHERE user_id=${viewer.id} AND video_id=${id}::uuid LIMIT 1`:[];
  access=Boolean((membership&&Number(membership.rank)>=rank)||purchases.length);
 }
 const available=access&&canAuthorizePlayback()&&flags[0]?.value==="true";
 let src="";
 if(available){
  const expires=Math.floor(Date.now()/1000)+900;
  const guid=String(video.bunny_guid);
  const key=process.env.BUNNY_STREAM_TOKEN_KEY||"";
  const token=createHash("sha256").update(key+guid+expires).digest("hex");
  src=`https://player.mediadelivery.net/embed/${process.env.BUNNY_STREAM_LIBRARY_ID}/${guid}?token=${token}&expires=${expires}`;
 }
 return <main className="shell" style={{paddingTop:65,paddingBottom:95,maxWidth:1000}}><Link href="/videos" className="subtle-link">← Film library</Link><p className="eyebrow" style={{marginTop:34}}>FIM ADDIS VIDEO</p><h1 className="page-title">{video.title}</h1><p className="muted">{video.description}</p>
 {!viewer?<div className="checkout-note"><strong>Membership required</strong><p>Sign in and select a membership to watch approved videos.</p><Link href="/account/login" className="btn">Sign in →</Link></div>
 :!viewer.verified?<div className="checkout-note"><strong>Email verification required</strong><p>Verify your account to watch.</p><Link href="/account/login" className="btn">Verify email →</Link></div>
 :!access?<div className="checkout-note"><strong>Your plan doesn't include this film</strong><p>Upgrade your membership, or purchase this video individually when that option becomes available.</p><Link href="/membership" className="btn">View memberships →</Link></div>
 :!available?<div className="checkout-note"><strong>Playback is being prepared</strong><p>Secure video delivery is unavailable until our Bunny playback protection and final compliance checks are completed.</p></div>
 :<div className="signed-player"><iframe src={src} title={video.title} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>}
 </main>;
}
