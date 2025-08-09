import { NextResponse } from "next/server"

type UTXOChain = "btc" | "ltc" | "doge" | "dash" | "bch" | "zec"

async function sochainAddress(chain: UTXOChain, address: string) {
  const [bal, addr] = await Promise.all([
    fetch(`https://sochain.com/api/v2/get_address_balance/${chain.toUpperCase()}/${address}`, {
      cache: "no-store",
    }).then((r) => r.json()),
    fetch(`https://sochain.com/api/v2/get_address/${chain.toUpperCase()}/${address}`, { cache: "no-store" }).then((r) =>
      r.json(),
    ),
  ])
  if (bal.status !== "success" || addr.status !== "success") throw new Error("sochain")
  const txs = Array.isArray(addr.data.txs) ? addr.data.txs.slice(0, 10) : []
  return {
    summary: {
      balance: Number.parseFloat(bal.data.confirmed_balance ?? "0"),
      unconfirmed: Number.parseFloat(bal.data.unconfirmed_balance ?? "0"),
      total_received: Number.parseFloat(addr.data.total_received ?? "0"),
      total_sent: Number.parseFloat(addr.data.total_sent ?? "0"),
    },
    txs: txs.map((t: any) => ({
      txid: t.txid,
      time: t.time,
      incoming: !!t.incoming,
      value: t.value ? Number.parseFloat(t.value) : undefined,
    })),
  }
}

async function blockcypherAddress(chain: UTXOChain, address: string) {
  const netMap: Record<UTXOChain, string> = {
    btc: "btc/main",
    ltc: "ltc/main",
    doge: "doge/main",
    dash: "dash/main",
    bch: "bcy/test", // BlockCypher has limited BCH support; fallback not guaranteed
    zec: "zec/main",
  }
  const net = netMap[chain]
  const url = `https://api.blockcypher.com/v1/${net}/addrs/${address}/full?limit=10`
  const r = await fetch(url, { cache: "no-store" })
  if (!r.ok) throw new Error("blockcypher")
  const j = await r.json()
  const balance = (j.balance ?? 0) / 1e8
  const unconfirmed = (j.unconfirmed_balance ?? 0) / 1e8
  const total_received = (j.total_received ?? 0) / 1e8
  const total_sent = (j.total_sent ?? 0) / 1e8
  const txs = Array.isArray(j.txs) ? j.txs.slice(0, 10) : []
  return {
    summary: { balance, unconfirmed, total_received, total_sent },
    txs: txs.map((t: any) => ({
      txid: t.hash,
      time: t.received ? Math.floor(new Date(t.received).getTime() / 1000) : undefined,
      incoming: undefined,
      value: undefined,
    })),
  }
}

async function ethBlockscoutAddress(address: string) {
  const balR = await fetch(`https://eth.blockscout.com/api?module=account&action=balance&address=${address}`, {
    cache: "no-store",
  })
  if (!balR.ok) throw new Error("blockscout-bal")
  const balJ = await balR.json()
  const wei = Number(balJ?.result ?? "0")
  const balance = wei / 1e18
  const listR = await fetch(
    `https://eth.blockscout.com/api?module=account&action=txlist&address=${address}&sort=desc`,
    { cache: "no-store" },
  )
  const listJ = await listR.json()
  const txs = Array.isArray(listJ?.result) ? listJ.result.slice(0, 10) : []
  return {
    summary: { balance, unconfirmed: 0, total_received: 0, total_sent: 0 },
    txs: txs.map((t: any) => ({
      txid: t.hash,
      time: t.timeStamp ? Number(t.timeStamp) : undefined,
      incoming: t.to?.toLowerCase() === address.toLowerCase(),
      value: Number(t.value) / 1e18,
    })),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chain = (searchParams.get("chain") ?? "").toLowerCase()
  const address = searchParams.get("address") ?? ""
  if (!chain || !address) return NextResponse.json({}, { status: 400 })

  if (chain === "eth") {
    try {
      const out = await ethBlockscoutAddress(address)
      return NextResponse.json(out)
    } catch {
      return NextResponse.json(
        { summary: { balance: 0, unconfirmed: 0, total_received: 0, total_sent: 0 }, txs: [] },
        { status: 500 },
      )
    }
  }

  const utxo = chain as UTXOChain
  try {
    const out = await sochainAddress(utxo, address)
    return NextResponse.json(out)
  } catch {
    try {
      const out = await blockcypherAddress(utxo, address)
      return NextResponse.json(out)
    } catch {
      return NextResponse.json(
        { summary: { balance: 0, unconfirmed: 0, total_received: 0, total_sent: 0 }, txs: [] },
        { status: 500 },
      )
    }
  }
}
