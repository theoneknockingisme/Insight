import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    })
    const j = await r.json()
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch {
    return NextResponse.json({ pairs: [] }, { status: 500 })
  }
}
