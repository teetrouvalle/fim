"use client";
import { useEffect, useState } from "react";
import { plans, priceText } from "../lib/memberships";
import LibraryStatus from "./library-status";

type Language = "en" | "am";
type Theme = "dark" | "light";
const copy = {
  en: {
    navDiscover: "Discover", navMembership: "Memberships", navAbout: "About",
    limited: "A NEW HOME FOR FILM", titleA: "Bold stories.", titleB: "A different way to watch.",
    intro: "Discover mature-rated films, special member broadcasts, and exclusive experiences curated for adults.",
    launch: "MEMBERSHIPS", cta: "Explore videos", status: "Access begins after approval.",
    browseTag: "THE LIBRARY", browse: "A space for stories.", browseText: "Films appear after licensing and ratings review. Browse the library and discover upcoming titles.",
    card1: "Featured films", card2: "New additions", card3: "Curated collections", pending: "Coming after review",
    tiersTag: "MEMBERSHIPS", tiers: "Choose how you watch.", tiersText: "Choose your experience: films, live sessions when scheduled, and VIP events. Payments are activated after administrator verification.",
    basic: "Essential selection", plus: "Expanded selection", premium: "Full member catalogue",
    soon: "Not available yet", access: "Coming soon", aboutTitle: "Built around the viewer.", aboutText: "English and Amharic access, a distinctive film collection, and scheduled member experiences. Events and creator meetups depend on availability and are non-sexual fan gatherings.",
    footer: "Membership enrollment will open after video rights, secure payment review, and streaming access are configured.", badge: "18+ content notice"
  },
  am: {
    navDiscover: "ያስሱ", navMembership: "አባልነት", navAbout: "ስለ እኛ",
    limited: "አዲስ የፊልም መድረክ", titleA: "ልዩ ታሪኮች።", titleB: "አዲስ የመመልከቻ መንገድ።",
    intro: "ለአዋቂዎች የተዘጋጁ ፊልሞችን፣ የአባላት የቀጥታ ዝግጅቶችንና ልዩ ተሞክሮዎችን ያግኙ።",
    launch: "አባልነት", cta: "ቪዲዮዎችን ያስሱ", status: "ፈቃድ ከተረጋገጠ በኋላ መመልከት ይቻላል።",
    browseTag: "የፊልም ስብስብ", browse: "የታሪኮች ቦታ።", browseText: "ቪዲዮዎች የማሰራጨት ፈቃድና የዕድሜ ደረጃ ግምገማ ሲጠናቀቅ ይታያሉ።",
    card1: "ተመራጭ ፊልሞች", card2: "አዲስ የሚጨመሩ", card3: "የተመረጡ ስብስቦች", pending: "በቅርቡ",
    tiersTag: "አባልነት", tiers: "የመመልከቻ ምርጫዎ።", tiersText: "ከሶስት የአባልነት ደረጃዎች ይምረጡ። የፊልም ስብስብ፣ የቀጥታ ዝግጅቶችና ልዩ የአባላት ተሞክሮዎች።",
    basic: "መሠረታዊ ስብስብ", plus: "የተስፋፋ ስብስብ", premium: "ሙሉ የአባላት ስብስብ",
    soon: "አሁን አይገኝም", access: "በቅርቡ", aboutTitle: "ለተመልካቾች የተዘጋጀ።", aboutText: "በአማርኛና በእንግሊዝኛ በቀላሉ የሚጠቀሙበት መድረክ እያዘጋጀን ነው።",
    footer: "የአባልነት ክፍያና የቪዲዮ መመልከቻ አገልግሎት የተፈላጊ ፈቃዶችና የደህንነት ምርመራ ሲጠናቀቅ ይከፈታል።", badge: "18+ ማሳሰቢያ"
  }
} as const;
export default function FimAddisHome() {
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
        <a href="/videos">{t.navDiscover}</a><a href="/membership">{t.navMembership}</a><a className="about-link" href="#about">{t.navAbout}</a>
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
          <div className="hero-actions"><a className="btn" href="/videos">{t.cta} <span aria-hidden="true">↗</span></a><span className="muted tiny">{t.status}</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-frame"><div className="art-cross">F<br/>A</div><div className="art-side">ፍም አዲስ • FIM ADDIS</div></div><div className="corner-accent"/></div>
      </section>
      <div className="notice-strip"><span className="notice-dot"/> FIM ADDIS <span>—</span> {t.status}</div>
      <section className="section" id="catalogue">
        <div className="section-lead"><div><p className="eyebrow">{t.browseTag}</p><h2>{t.browse}</h2></div><p className="section-description">{t.browseText}</p></div>
        <div className="poster-grid">{[t.card1,t.card2,t.card3].map((name,i)=><article key={name} className="poster-card"><div className={"poster-art poster-"+(i+1)} aria-label={t.pending}><span className="poster-serial">0{i+1}</span><span className="poster-center">ፍ</span><span className="poster-bottom">FIM ADDIS</span></div><h3>{name}</h3><span className="caption">{t.pending}</span></article>)}</div><div className="catalog-status"><LibraryStatus language={lang}/><a href="/videos" className="subtle-link">{lang==="en"?"Open video library →":"የቪዲዮ ስብስቡን ይመልከቱ →"}</a></div>
      </section>
      <section className="section memberships" id="membership">
        <div className="section-lead"><div><p className="eyebrow">{t.tiersTag}</p><h2>{t.tiers}</h2></div><p className="section-description">{t.tiersText}</p></div>
        <div className="plan-grid">{plans.map((plan)=><article className={"plan "+(plan.featured?"highlight-plan":"")} key={plan.id}><span className="plan-count">0{plan.rank} / 03</span><h3>{plan.id.charAt(0).toUpperCase()+plan.id.slice(1)}</h3><p className="plan-price">{priceText(plan,lang)} {plan.priceEtb!==null?<small>{lang==="en"?"/ month":"/ ወር"}</small>:null}</p><ul className="feature-list">{plan.features.map((f,i)=><li key={i}>{f[lang]}</li>)}</ul><a href={"/checkout/"+plan.id} className="plan-foot">{lang==="en"?"View plan":"አባልነትን ይመልከቱ"}<span aria-hidden="true">↗</span></a></article>)}</div><p className="tiny muted" style={{marginTop:16}}>{lang==="en"?"Events and live sessions are offered when scheduled. In-person fan meetups require separate confirmation.":"የቀጥታ ዝግጅቶችና ስብሰባዎች በቀጠሮ ብቻ ይቀርባሉ።"}</p>
      </section>
      <section className="about-section" id="about"><p className="eyebrow">FIM ADDIS / ፍም አዲስ</p><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p></section>
    </main>
    <footer className="footer"><strong>ፍም አዲስ</strong><p>{t.footer}</p><small>© Fim Addis 2026</small></footer>
  </div>;
}
