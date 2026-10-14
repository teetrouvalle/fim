import Link from "next/link";
import MemberLoginForm from "./form";
export const metadata={title:"Sign in or register | Fim Addis",robots:{index:false,follow:false}};
export default function LoginPage(){return <main className="shell" style={{paddingTop:36,paddingBottom:80}}><Link href="/" className="muted">← Fim Addis</Link><MemberLoginForm/></main>}
