import { NextResponse } from "next/server"

async function cgSimple(ids: string, vs: string) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(
    vs,
  )}`
  const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } })
  if (!r.ok) throw new Error("cg")
  return r.json()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = (searchParams.get("from") ?? "").toLowerCase()
  const to = (searchParams.get("to") ?? "").toLowerCase()
  if (!from || !to) return NextResponse.json({ value: null }, { status: 400 })
  try {
    if (to === "usd") {
      const j = await cgSimple(from, "usd")
      return NextResponse.json({ value: j?.[from]?.usd ?? null })
    }
    // Try direct fiat or crypto vs
    const j1 = await cgSimple(from, to)
    if (j1?.[from]?.[to] != null) return NextResponse.json({ value: j1[from][to] })
    // Crypto -> Crypto via USD cross
    const j2 = await cgSimple(`${from},${to}`, "usd")
    const fu = j2?.[from]?.usd
    const tu = j2?.[to]?.usd
    if (fu && tu) return NextResponse.json({ value: fu / tu })
  } catch {
    // continue to fallback
  }
  // CoinPaprika fallback (via USD cross only)
  try {
    const map: Record<string, string> = {
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
    const fid = map[from]
    const tid = map[to]
    if (to === "usd" && fid) {
      const r = await fetch(`https://api.coinpaprika.com/v1/tickers/${fid}`, { cache: "no-store" })
      const j = await r.json()
      return NextResponse.json({ value: j?.quotes?.USD?.price ?? null })
    }
    if (fid && tid) {
      const [fr, tr] = await Promise.all([
        fetch(`https://api.coinpaprika.com/v1/tickers/${fid}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`https://api.coinpaprika.com/v1/tickers/${tid}`, { cache: "no-store" }).then((r) => r.json()),
      ])
      const fu = fr?.quotes?.USD?.price
      const tu = tr?.quotes?.USD?.price
      if (fu && tu) return NextResponse.json({ value: fu / tu })
    }
  } catch {}
  return NextResponse.json({ value: null }, { status: 200 })
}
