"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {plans} from "../../lib/memberships";
export default function PlanPrompt({title,minTier,purchaseOnly=false,signedIn=false}:{title:string;minTier:string;purchaseOnly?:boolean;signedIn?:boolean}){
 const [open,setOpen]=useState(true);
 useEffect(()=>{
  if(!open)return;
  const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
  window.addEventListener("keydown",close);
  return ()=>window.removeEventListener("keydown",close);
 },[open]);
 const minRank={basic:1,plus:2,premium:3}[minTier as "basic"|"plus"|"premium"]||3;
 const eligible=plans.filter(p=>p.rank>=minRank);
 return <>
 <button type="button" className="btn" onClick={()=>setOpen(true)}>{purchaseOnly?"View purchase information":"Unlock this film"}</button>
 {open&&<div className="plan-modal-backdrop" role="presentation" onClick={()=>setOpen(false)}>
  <div role="dialog" aria-modal="true" aria-label="Membership options" className="plan-modal" onClick={e=>e.stopPropagation()}>
   <div className="plan-modal-head"><div><p className="eyebrow">FIM ADDIS ACCESS</p><h2>{purchaseOnly?"Individual title":"Choose your membership"}</h2></div><button type="button" className="plan-modal-close" aria-label="Close membership options" onClick={()=>setOpen(false)}>×</button></div>
   <p className="muted">{purchaseOnly?`“${title}” is available only through an individual purchase. Individual video checkout is not open yet.`:`“${title}” is included with the following membership plans. Free films need no subscription.`}</p>
   {!purchaseOnly&&<div className="plan-modal-grid">{eligible.map(p=><article className="plan-modal-tier" key={p.id}><strong>{p.id.toUpperCase()}</strong><p className="plan-modal-price">{p.priceEtb?.toLocaleString()} ETB <small>/ 30 days</small></p><Link href={signedIn?`/checkout/${p.id}`:`/account/login?next=${encodeURIComponent(`/checkout/${p.id}`)}`} className="btn">Choose {p.id} →</Link></article>)}</div>}
   <p className="muted tiny">Sign in or create an account before purchasing a plan. Membership starts only after an administrator verifies your payment. You can browse free films without buying a plan.</p>
   <div className="plan-modal-actions"><Link href="/videos" className="subtle-link">Browse free films →</Link><button type="button" className="account-alt-button" onClick={()=>setOpen(false)}>Continue browsing</button></div>
  </div>
 </div>}
 </>;
}
