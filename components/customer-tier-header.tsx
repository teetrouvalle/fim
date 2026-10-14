import Link from "next/link";
import {getEffectiveMembership,getViewer} from "../lib/member";

/** Customer-only status bar; never renders account identifiers or administrator email. */
export default async function CustomerTierHeader(){
 const viewer=await getViewer();
 const membership=viewer?await getEffectiveMembership(viewer.id):null;
 const tier=membership?String(membership.plan_id).toUpperCase():"FREE";
 return <nav className="customer-tier-header" aria-label="Customer navigation">
  <Link className="customer-tier-brand" href="/">ፍም አዲስ <span>Fim Addis</span></Link>
  <div className="customer-tier-actions">
   <Link href="/videos">Films</Link>
   {viewer?<><span className="member-tier-label" aria-label={`Current membership tier: ${tier}`}>Your tier: <strong>{tier}</strong></span><Link href="/account">My account</Link></>:
    <><Link href="/account/login">Sign in</Link><Link href="/account/login?mode=signup">Sign up</Link></>}
  </div>
 </nav>;
}
