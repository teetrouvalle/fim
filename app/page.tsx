import {db} from "../lib/admin";
import FimAddisHome from "../components/prototype-home";
import {getViewer,getEffectiveMembership} from "../lib/member";
export const dynamic="force-dynamic";
export default async function Home() {
 const viewer=await getViewer();
 const membership=viewer?await getEffectiveMembership(viewer.id):null;
 const tier=membership?String(membership.plan_id).toUpperCase():"FREE";
 const sql=db();
 const rows=await sql`SELECT id,title,description,tier,is_free,thumbnail_bytes IS NOT NULL AS has_thumbnail,thumbnail_updated_at,show_on_home FROM public.fim_videos WHERE published=true AND rights_verified=true AND rating_reviewed=true ORDER BY is_free DESC,added_at DESC LIMIT 120`;
 const films=rows.map(v=>({id:String(v.id),title:String(v.title),description:String(v.description||""),tier:String(v.tier),is_free:Boolean(v.is_free),show_on_home:Boolean(v.show_on_home),has_thumbnail:Boolean(v.has_thumbnail),thumbnail_version:v.thumbnail_updated_at?new Date(v.thumbnail_updated_at).getTime().toString():"0"}));
 return <FimAddisHome signedIn={Boolean(viewer)} hasPaidMembership={Boolean(membership)} currentTier={tier} films={films}/>;
}
