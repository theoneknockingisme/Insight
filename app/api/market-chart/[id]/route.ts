import { NextResponse } from "next/server"

const cgToPaprika: Record<string, string> = {
  bitcoin: "btc-bitcoin",
  ethereum: "eth-ethereum",
  litecoin: "ltc-litecoin",
  dogecoin: "doge-dogecoin",
  ripple: "xrp-xrp",
  cardano: "ada-cardano",
  solana: "sol-solana",
  binancecoin: "bnb-binance-coin",
  tron: "trx-tron",
  polkadot: "dot-polkadot",
}

async function fromCG(id: string, days: string) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
  if (!r.ok) throw new Error("cg")
  return r.json()
}

async function fromPaprika(id: string, days: number) {
  const pid = cgToPaprika[id]
  if (!pid) throw new Error("no map")
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  const url = `https://api.coinpaprika.com/v1/tickers/${pid}/historical?start=${start.toISOString()}&end=${end.toISOString()}&interval=${days > 1 ? "1d" : "1h"}`
  const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
  if (!r.ok) throw new Error("paprika")
  const j = await r.json()
  const prices = (Array.isArray(j) ? j : []).map((p: any) => [new Date(p.timestamp).getTime(), p.price])
  return { prices }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const days = Number(searchParams.get("days") ?? "1")
  try {
    const j = await fromCG(params.id, String(days))
    return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
  } catch {
    try {
      const j = await fromPaprika(params.id, days)
      return NextResponse.json(j, { headers: { "Cache-Control": "s-maxage=60" } })
    } catch {
      return NextResponse.json({ prices: [] }, { status: 500 })
    }
  }
}
