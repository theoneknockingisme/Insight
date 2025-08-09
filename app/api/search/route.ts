import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  let query = (searchParams.get("query") ?? "").trim()
  if (!query) return NextResponse.json({ coins: [] })
  // Support "LTC/BTC" or "ltc-btc" formats: prefer first symbol
  if (query.includes("/") || query.includes("-")) {
    const parts = query
      .split(/[/-]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length > 0) query = parts[0]
  }
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    })
    const j = await r.json()
    return NextResponse.json(j)
  } catch {
    // Fallback minimal: return as symbol-only
    return NextResponse.json({ coins: [] }, { status: 200 })
  }
}
