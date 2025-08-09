import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const per_page = searchParams.get("per_page") ?? "100"
  const page = searchParams.get("page") ?? "1"
  const order = searchParams.get("order") ?? "market_cap_desc"
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${order}&per_page=${per_page}&page=${page}&sparkline=false&price_change_percentage=24h`
  try {
    const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
    const j = await r.json()
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch (e) {
    return NextResponse.json([], { status: 500 })
  }
}
