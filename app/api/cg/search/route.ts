import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") ?? ""
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, {
      cache: "no-store",
    })
    const j = await r.json()
    return NextResponse.json(j)
  } catch {
    return NextResponse.json({ coins: [] }, { status: 200 })
  }
}
