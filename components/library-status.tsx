"use client";
import { useEffect, useState } from "react";
type Health={connected:boolean;total:number;ready:number;processing:number;failed:number};
export default function LibraryStatus({language}:{language:"en"|"am"}){
 const [health,setHealth]=useState<Health|null>(null);
 useEffect(()=>{let mounted=true;const controller=new AbortController();fetch("/api/library-status",{signal:controller.signal}).then(r=>r.ok?r.json():null).then((data:Health|null)=>{if(mounted&&data)setHealth(data)}).catch(()=>{});return()=>{mounted=false;controller.abort()}},[]);
 if(!health)return <p className="muted">{language==="am"?"የቪዲዮ ስብስቡ በዝግጅት ላይ ነው።":"The film collection is being prepared."}</p>;
 if(!health.connected)return <p className="muted">{language==="am"?"የቪዲዮ ስብስቡ በዝግጅት ላይ ነው።":"The catalog will be available after media setup."}</p>;
 return <p className="muted" role="status">{language==="am"
  ?`በማከማቻው ያሉ ቪዲዮዎች፦ ${health.total}። በሂደት ላይ፦ ${health.processing}። ዝግጁ፦ ${health.ready}። ለሕዝብ ከመታየታቸው በፊት ፈቃድ ይፈልጋሉ።`
  :`${health.total} video(s) in Bunny Stream · ${health.processing} processing · ${health.ready} encoded. Titles go live only after rights review and publication approval.`}</p>
}
