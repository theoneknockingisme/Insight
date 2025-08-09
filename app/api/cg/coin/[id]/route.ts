import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
  try {
    const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
    const j = await r.json()
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
