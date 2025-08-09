import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get("ids") ?? ""
  const vs = searchParams.get("vs") ?? "usd"
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(
    vs,
  )}`
  try {
    const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
    const j = await r.json()
    const idKey = ids.split(",")[0]
    const value = j?.[idKey]?.[vs] ?? null
    return NextResponse.json({ value })
  } catch {
    return NextResponse.json({ value: null }, { status: 500 })
  }
}
