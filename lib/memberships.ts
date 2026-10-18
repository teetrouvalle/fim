export type PlanId = "basic" | "plus" | "premium";
export type Language = "en" | "am";
export interface Plan {
 id: PlanId;
 rank: number;
 priceEtb: number | null;
 priceCryptoUsd: number;
 features: { en: string; am: string }[];
 featured?: boolean;
}
export const plans: Plan[] = [
 { id:"basic",rank:1,priceEtb:599,priceCryptoUsd:5.99,features:[
  {en:"Access to the Basic film collection",am:"መሠረታዊ የፊልም ስብስብን መመልከት"},
  {en:"Member watch history and saved progress",am:"የታዩ ፊልሞችን ታሪክና የመመልከቻ ሂደት መከታተል"},
 ]},
 { id:"plus",rank:2,priceEtb:999,priceCryptoUsd:9.99,features:[
  {en:"Everything in Basic and an expanded library",am:"በመሠረታዊ አባልነት ውስጥ ያለው ሁሉና ተጨማሪ ፊልሞች"},
  {en:"Access to scheduled members-only live content",am:"ለአባላት ብቻ የሚቀርቡ የቀጥታ ዝግጅቶች"},
  {en:"Group creator Q&A sessions when scheduled",am:"በቀጠሮ የሚደረጉ የጋራ ጥያቄና መልስ ዝግጅቶች"},
  {en:"Community discussions and virtual watch parties",am:"የአባላት ውይይቶችና የጋራ የኦንላይን ፊልም እይታ"},
 ]},
 { id:"premium",rank:3,priceEtb:1499,priceCryptoUsd:14.99,featured:true,features:[
  {en:"Everything in Plus and all subscription videos",am:"በፕላስ አባልነት ውስጥ ያለው ሁሉና ሁሉም የአባላት ፊልሞች"},
  {en:"Premium-exclusive broadcasts and early releases",am:"ለፕሪሚየም ብቻ የቀጥታ ዝግጅቶችና ቅድሚያ ያላቸው ፊልሞች"},
  {en:"Priority access to small-group virtual meetups",am:"ለአነስተኛ ቡድን የኦንላይን ስብሰባዎች ቅድሚያ"},
  {en:"Priority invitations to occasional non-sexual fan events",am:"ለደጋፊዎች የሚዘጋጁ ልዩ ዝግጅቶች ቅድሚያ ግብዣ"},
  {en:"Priority fan questions and selected exclusive features",am:"ለደጋፊዎች ጥያቄዎች ቅድሚያና ልዩ አገልግሎቶች"},
 ]},
];
export const priceText=(p:Plan,language:Language="en")=>p.priceEtb===null?(language==="am"?"በቅርቡ":"To be announced"):new Intl.NumberFormat("en-US").format(p.priceEtb)+" ETB";
export const cryptoPriceText=(p:Plan)=>"$"+p.priceCryptoUsd.toFixed(2)+" crypto";
export const getPlan=(id:string)=>plans.find(p=>p.id===id);
