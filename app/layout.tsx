import type { Metadata } from "next";
import AgeNotice from "../components/age-notice";
import "./globals.css";
export const metadata: Metadata = { title: "Fim Addis | ፍም አዲስ", description: "Fim Addis — premium mature-rated film platform under development", robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AgeNotice />{children}</body></html>;
}
