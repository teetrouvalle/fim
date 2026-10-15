"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";

/**
 * Refresh server-authenticated navigation after history restoration.
 * Browsers may restore an older snapshot of the homepage showing "Sign in"
 * even though the session cookie is still valid. This does not change tokens,
 * cookies, or membership tiers.
 */
export default function SessionPageSync(){
 const router=useRouter();
 useEffect(()=>{
  let hidden=false;
  const onPageShow=(event:PageTransitionEvent)=>{
   if(event.persisted)router.refresh();
  };
  const onPopState=()=>{router.refresh()};
  const onVisibilityChange=()=>{
   if(document.visibilityState==="hidden"){hidden=true;return;}
   if(hidden&&document.visibilityState==="visible"){hidden=false;router.refresh();}
  };
  window.addEventListener("pageshow",onPageShow);
  window.addEventListener("popstate",onPopState);
  document.addEventListener("visibilitychange",onVisibilityChange);
  return ()=>{
   window.removeEventListener("pageshow",onPageShow);
   window.removeEventListener("popstate",onPopState);
   document.removeEventListener("visibilitychange",onVisibilityChange);
  };
 },[router]);
 return null;
}
