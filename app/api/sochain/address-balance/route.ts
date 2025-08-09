import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const network = searchParams.get("network")
  const address = searchParams.get("address")
  if (!network || !address) return NextResponse.json({}, { status: 400 })
  try {
    const r = await fetch(`https://sochain.com/api/v2/get_address_balance/${network}/${address}`, { cache: "no-store" })
    const j = await r.json()
    if (j.status !== "success") return NextResponse.json({}, { status: 500 })
    return NextResponse.json(j.data)
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
