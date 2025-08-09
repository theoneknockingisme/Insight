import { NextResponse } from "next/server"

export async function GET() {
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/search/trending", {
      cache: "no-store",
      headers: { accept: "application/json" },
    })
    const j = await r.json()
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=120" } })
  } catch {
    return NextResponse.json({ coins: [] }, { status: 500 })
  }
}
