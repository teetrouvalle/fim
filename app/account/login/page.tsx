import Link from "next/link";
import MemberLoginForm from "./form";
import {redirect} from "next/navigation";
import {getViewer} from "../../../lib/member";
export const dynamic="force-dynamic";
export const metadata={title:"Sign in or register | Fim Addis",robots:{index:false,follow:false}};
export default async function LoginPage({searchParams}:{searchParams:Promise<{mode?:string;next?:string}>}){
 const q=await searchParams;
 const returnTo=/^\/checkout\/(basic|plus|premium)$/.test(q.next||"")?String(q.next):"/";
 const viewer=await getViewer();
 if(viewer)redirect(returnTo);
 return <main className="shell" style={{paddingTop:36,paddingBottom:80}}>
  <Link href="/" className="muted">← Fim Addis</Link>
  <MemberLoginForm initialTab={q.mode==="signup"?"signup":"signin"} returnTo={returnTo}/>
 </main>;
}
