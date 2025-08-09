import { NextResponse } from "next/server"

export async function GET() {
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/simple/supported_vs_currencies", {
      cache: "no-store",
      headers: { accept: "application/json" },
    })
    const j = await r.json()
    return NextResponse.json(j)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
