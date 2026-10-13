import Link from "next/link";import { plans,priceText } from "../../lib/memberships";
export const metadata={title:"Memberships | Fim Addis"};
export default function MembershipPage(){return <main className="shell" style={{paddingTop:65,paddingBottom:95}}>
 <Link className="muted" href="/">← Fim Addis</Link><p className="eyebrow" style={{marginTop:37}}>MEMBERSHIP</p>
 <h1 className="page-title">More than just watching.</h1>
 <p className="muted" style={{maxWidth:650,lineHeight:1.7}}>Explore the Basic, Plus, and Premium member experiences. Live broadcasts and events are offered only when scheduled; availability varies.</p>
 <div className="plan-grid membership-page-grid">{plans.map(p=><article key={p.id} className={"plan "+(p.featured?"highlight-plan":"")}>
  <span className="plan-count">TIER 0{p.rank} {p.featured?" · VIP ACCESS":""}</span><h2>{p.id.charAt(0).toUpperCase()+p.id.slice(1)}</h2><p className="plan-price">{priceText(p)}</p>
  <p className="muted">Per month</p><ul className="feature-list">{p.features.map(f=><li key={f.en}>{f.en}</li>)}</ul>
  <Link className="btn" href={"/checkout/"+p.id}>View membership <span aria-hidden>↗</span></Link>
 </article>)}</div>
 <p className="disclaimer">Individual purchase-only titles are not included in any subscription. Virtual meetups are moderated; in-person gatherings are lawful, non-sexual fan events and require separate confirmation. Live programming is subject to published schedules. Payments require administrator verification.</p>
 </main>;}
