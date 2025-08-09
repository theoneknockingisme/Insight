import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  if (!from || !to) return NextResponse.json({ value: null }, { status: 400 })
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    `${from},${to}`,
  )}&vs_currencies=usd`
  try {
    const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
    const j = await r.json()
    const fu = j?.[from]?.usd
    const tu = j?.[to]?.usd
    const value = fu && tu ? fu / tu : null
    return NextResponse.json({ value })
  } catch {
    return NextResponse.json({ value: null }, { status: 500 })
  }
}
