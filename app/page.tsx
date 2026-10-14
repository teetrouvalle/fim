import FimAddisHome from "../components/prototype-home";
import {getViewer,getEffectiveMembership} from "../lib/member";
export const dynamic="force-dynamic";
export default async function Home() {
 const viewer=await getViewer();
 const membership=viewer?await getEffectiveMembership(viewer.id):null;
 const tier=membership?String(membership.plan_id).toUpperCase():"FREE";
 return <FimAddisHome signedIn={Boolean(viewer)} currentTier={tier}/>;
}
