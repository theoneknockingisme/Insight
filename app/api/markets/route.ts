import { NextResponse } from "next/server"

type Coin = {
  id: string
  symbol: string
  name: string
  image?: string
  current_price: number
  market_cap: number
  total_volume: number
  price_change_percentage_24h: number
}

async function fromCoinGecko(per_page: string, page: string, order: string): Promise<Coin[]> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${order}&per_page=${per_page}&page=${page}&sparkline=false&price_change_percentage=24h`
  const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
  const j = await r.json()
  if (!Array.isArray(j)) throw new Error("CG shape")
  return j
}

async function fromPaprika(limit: number): Promise<Coin[]> {
  const url = `https://api.coinpaprika.com/v1/tickers`
  const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
  const j = await r.json()
  if (!Array.isArray(j)) throw new Error("Paprika shape")
  return j.slice(0, limit).map((c: any) => ({
    id: c.id,
    symbol: String(c.symbol || "").toLowerCase(),
    name: c.name,
    image: undefined,
    current_price: c.quotes?.USD?.price ?? 0,
    market_cap: c.quotes?.USD?.market_cap ?? 0,
    total_volume: c.quotes?.USD?.volume_24h ?? 0,
    price_change_percentage_24h: c.quotes?.USD?.percent_change_24h ?? 0,
  }))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const per_page = searchParams.get("per_page") ?? "100"
  const page = searchParams.get("page") ?? "1"
  const order = searchParams.get("order") ?? "market_cap_desc"
  try {
    const arr = await fromCoinGecko(per_page, page, order)
    return NextResponse.json(arr, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch {
    try {
      const limit = Number.parseInt(per_page) || 100
      const arr = await fromPaprika(limit)
      return NextResponse.json(arr, { headers: { "Cache-Control": "s-maxage=60" } })
    } catch {
      return NextResponse.json([], { status: 500 })
    }
  }
}
