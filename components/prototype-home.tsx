"use client";
import { useEffect, useState } from "react";

type Language = "en" | "am";
type Theme = "dark" | "light";
const copy = {
  en: {
    navDiscover: "Discover", navMembership: "Memberships", navAbout: "About",
    limited: "A NEW HOME FOR FILM", titleA: "Bold stories.", titleB: "A different way to watch.",
    intro: "Fim Addis is taking shape. A curated home for mature-rated films and entertainment, with access on your terms.",
    launch: "Prototype preview", cta: "Explore the concept", status: "No streaming. No payments.",
    browseTag: "THE LIBRARY", browse: "A space for stories.", browseText: "Film titles and artwork will appear here only after licensing, classification, and publication review.",
    card1: "Featured films", card2: "New additions", card3: "Curated collections", pending: "Coming after review",
    tiersTag: "MEMBERSHIPS", tiers: "Choose how you watch.", tiersText: "Three levels of access, with individual purchases available later. Pricing is not active.",
    basic: "Essential selection", plus: "Expanded selection", premium: "Full member catalogue",
    soon: "Not available yet", access: "Coming soon", aboutTitle: "Built around the viewer.", aboutText: "English and Amharic interface, a clean viewing experience, and access designed around your membership. We're building it responsibly.",
    footer: "A noncommercial prototype. No video playback, registrations, or sales are available.", badge: "18+ content notice"
  },
  am: {
    navDiscover: "ያስሱ", navMembership: "አባልነት", navAbout: "ስለ እኛ",
    limited: "አዲስ የፊልም መድረክ", titleA: "ልዩ ታሪኮች።", titleB: "አዲስ የመመልከቻ መንገድ።",
    intro: "ፍም አዲስ በዝግጅት ላይ ነው። ለአዋቂዎች የተመደቡ ፊልሞችና መዝናኛዎችን ለማቅረብ የታቀደ መድረክ ነው።",
    launch: "የሙከራ እይታ", cta: "ንድፉን ይመልከቱ", status: "የቪዲዮ ስርጭትና ክፍያ የለም።",
    browseTag: "የፊልም ስብስብ", browse: "የታሪኮች ቦታ።", browseText: "የፊልም ርዕሶችና ምስሎች የፈቃድና የሕግ ግምገማ ሲጠናቀቅ ይታያሉ።",
    card1: "ተመራጭ ፊልሞች", card2: "አዲስ የሚጨመሩ", card3: "የተመረጡ ስብስቦች", pending: "በቅርቡ",
    tiersTag: "አባልነት", tiers: "የመመልከቻ ምርጫዎ።", tiersText: "ሶስት የአባልነት ደረጃዎችና በተናጠል ግዢ ወደፊት ይኖራሉ። አሁን ክፍያ አይቻልም።",
    basic: "መሠረታዊ ስብስብ", plus: "የተስፋፋ ስብስብ", premium: "ሙሉ የአባላት ስብስብ",
    soon: "አሁን አይገኝም", access: "በቅርቡ", aboutTitle: "ለተመልካቾች የተዘጋጀ።", aboutText: "በአማርኛና በእንግሊዝኛ በቀላሉ የሚጠቀሙበት መድረክ እያዘጋጀን ነው።",
    footer: "ይህ የሙከራ ድረ-ገጽ ነው። ቪዲዮ ማየት፣ መመዝገብ ወይም ክፍያ መፈጸም አይቻልም።", badge: "18+ ማሳሰቢያ"
  }
} as const;
const memberships = [
  { name: "Basic", detail: "basic", rank: "01" },
  { name: "Plus", detail: "plus", rank: "02" },
  { name: "Premium", detail: "premium", rank: "03" }
] as const;
export default function PrototypeHome() {
  const [lang, setLang] = useState<Language>("en");
  const [manualTheme, setManualTheme] = useState<Theme | null>(null);
  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem("fim-lang");
      if (storedLanguage === "en" || storedLanguage === "am") setLang(storedLanguage);
      const storedTheme = localStorage.getItem("fim-theme");
      if (storedTheme === "light" || storedTheme === "dark") setManualTheme(storedTheme);
    } catch { /* storage can be unavailable */ }
  }, []);
  useEffect(() => {
    if (manualTheme) document.documentElement.setAttribute("data-theme", manualTheme);
    else document.documentElement.removeAttribute("data-theme");
  }, [manualTheme]);
  const t = copy[lang];
  function changeLang() {
    const next: Language = lang === "en" ? "am" : "en";
    setLang(next);
    try { localStorage.setItem("fim-lang", next); } catch {}
  }
  function changeTheme() {
    const current = manualTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next: Theme = current === "dark" ? "light" : "dark";
    setManualTheme(next);
    try { localStorage.setItem("fim-theme", next); } catch {}
  }
  return <div className="shell">
    <header className="top">
      <a href="#" className="brand" aria-label="Fim Addis home">
        <span className="brand-mark">ፍ</span>
        <span className="brand-words"><strong>ፍም አዲስ</strong><small>FIM ADDIS</small></span>
      </a>
      <nav className="nav" aria-label="Main navigation">
        <a href="#catalogue">{t.navDiscover}</a><a href="#membership">{t.navMembership}</a><a className="about-link" href="#about">{t.navAbout}</a>
      </nav>
      <div className="header-tools">
        <button type="button" aria-label="Switch language" onClick={changeLang}>{lang === "en" ? "አማ" : "EN"}</button>
        <button type="button" aria-label="Toggle dark and light theme" onClick={changeTheme} className="theme-switch">◐</button>
      </div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow"><span className="red-line"></span>{t.limited}</p>
          <h1>{t.titleA}<br/><em>{t.titleB}</em></h1>
          <p className="hero-body">{t.intro}</p>
          <div className="hero-actions"><a className="btn" href="#catalogue">{t.cta} <span aria-hidden="true">↗</span></a><span className="muted tiny">{t.status}</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-frame"><div className="art-cross">F<br/>A</div><div className="art-side">ፍም አዲስ • FIM ADDIS</div></div><div className="corner-accent"/></div>
      </section>
      <div className="notice-strip"><span className="notice-dot"/>{t.launch} <span>—</span> {t.status}</div>
      <section className="section" id="catalogue">
        <div className="section-lead"><div><p className="eyebrow">{t.browseTag}</p><h2>{t.browse}</h2></div><p className="section-description">{t.browseText}</p></div>
        <div className="poster-grid">{[t.card1,t.card2,t.card3].map((name,i)=><article key={name} className="poster-card"><div className={"poster-art poster-"+(i+1)} aria-label={t.pending}><span className="poster-serial">0{i+1}</span><span className="poster-center">ፍ</span><span className="poster-bottom">FIM ADDIS</span></div><h3>{name}</h3><span className="caption">{t.pending}</span></article>)}</div>
      </section>
      <section className="section memberships" id="membership">
        <div className="section-lead"><div><p className="eyebrow">{t.tiersTag}</p><h2>{t.tiers}</h2></div><p className="section-description">{t.tiersText}</p></div>
        <div className="plan-grid">{memberships.map((plan)=><article className="plan" key={plan.name}><span className="plan-count">{plan.rank} / 03</span><h3>{plan.name}</h3><p className="muted">{t[plan.detail]}</p><div className="plan-foot">{t.soon}<span aria-hidden="true">↗</span></div></article>)}</div>
      </section>
      <section className="about-section" id="about"><p className="eyebrow">FIM ADDIS / ፍም አዲስ</p><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p></section>
    </main>
    <footer className="footer"><strong>ፍም አዲስ</strong><p>{t.footer}</p><small>© Fim Addis 2026 · Prototype only</small></footer>
  </div>;
}
