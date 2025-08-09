import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: { chain: string } }) {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${params.chain}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    })
    const j = await r.json()
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch {
    return NextResponse.json({ pairs: [] }, { status: 500 })
  }
}
