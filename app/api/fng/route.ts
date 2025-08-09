import { NextResponse } from "next/server"

export async function GET() {
  try {
    const r = await fetch("https://api.alternative.me/fng/?limit=1", { cache: "no-store" })
    const j = await r.json()
    const item = j?.data?.[0]
    return NextResponse.json({ value: item?.value, classification: item?.value_classification })
  } catch {
    return NextResponse.json({ value: null, classification: null }, { status: 500 })
  }
}
