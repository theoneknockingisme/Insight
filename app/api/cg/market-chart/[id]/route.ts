import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const days = searchParams.get("days") ?? "1"
  const url = `https://api.coingecko.com/api/v3/coins/${params.id}/market_chart?vs_currency=usd&days=${days}`
  try {
    const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
    const j = await r.json()
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
