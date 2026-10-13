import { NextResponse } from "next/server";
import { getBunnyLibraryHealth } from "../../../lib/bunny";
export const dynamic = "force-dynamic";
export async function GET(){
 const status=await getBunnyLibraryHealth();
 return NextResponse.json(status,{headers:{"Cache-Control":"public, max-age=0, s-maxage=60"}});
}
