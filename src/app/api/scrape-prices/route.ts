// src/app/api/scrape-prices/route.ts
import { NextResponse } from "next/server";
import { fetchAllPrices } from "@/scrapers/sony_wh1000xm5";

export const dynamic = "force-dynamic"; // always hit Bright Data live, never cache

export async function GET() {
  try {
    const prices = await fetchAllPrices();
    return NextResponse.json({ prices, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
