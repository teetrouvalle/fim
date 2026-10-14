import Link from "next/link";
import AdminLoginForm from "./form";
export const metadata={title:"Admin Sign In | Fim Addis",robots:{index:false,follow:false}};
export default function AdminLogin(){return <main className="shell admin-login-layout"><Link href="/" className="muted">← Back to Fim Addis</Link><AdminLoginForm/></main>}
