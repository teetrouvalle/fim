import CustomerTierHeader from "../../components/customer-tier-header";
import Link from "next/link";
import {plans,priceText} from "../../lib/memberships";
import {getViewer} from "../../lib/member";
export const metadata={title:"Memberships | Fim Addis"};
export const dynamic="force-dynamic";
export default async function MembershipPage(){
 const viewer=await getViewer();
 return <main className="shell" style={{paddingTop:65,paddingBottom:95}}>
 <CustomerTierHeader/>
 <Link className="muted" href="/">← Fim Addis</Link><p className="eyebrow" style={{marginTop:37}}>MEMBERSHIP</p>
 <h1 className="page-title">More than just watching.</h1>
 <p className="muted" style={{maxWidth:650,lineHeight:1.7}}>Explore the Basic, Plus, and Premium member experiences. Live broadcasts and events are offered only when scheduled; availability varies.</p>
 <div className="plan-grid membership-page-grid">{plans.map(p=><article key={p.id} className={"plan "+(p.featured?"highlight-plan":"")}>
  <span className="plan-count">TIER 0{p.rank} {p.featured?" · VIP ACCESS":""}</span><h2>{p.id.charAt(0).toUpperCase()+p.id.slice(1)}</h2><p className="plan-price">{priceText(p)}</p>
  <p className="muted">Per month · Crypto: <strong>${p.priceCryptoUsd.toFixed(2)} USD</strong></p><ul className="feature-list">{p.features.map(f=><li key={f.en}>{f.en}</li>)}</ul>
  <Link className="btn" href={viewer?"/checkout/"+p.id:"/account/login?next="+encodeURIComponent("/checkout/"+p.id)}>{viewer?"Continue to payment":"Sign in / Sign up"} <span aria-hidden>↗</span></Link>
 </article>)}</div>
 <p className="disclaimer">Individual purchase-only titles are not included in any subscription. Virtual meetups are moderated; in-person gatherings are lawful, non-sexual fan events and require separate confirmation. Live programming is subject to published schedules. Create an account or sign in before purchasing a membership. Upload your payment receipt securely on the website; all payments require administrator verification before access.</p>
 </main>;}
