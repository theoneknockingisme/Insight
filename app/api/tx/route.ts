import { NextResponse } from "next/server"

type UTXOChain = "btc" | "ltc" | "doge" | "dash" | "bch" | "zec"

async function sochainTx(chain: UTXOChain, hash: string) {
  const r = await fetch(`https://sochain.com/api/v2/get_tx/${chain.toUpperCase()}/${hash}`, { cache: "no-store" })
  const j = await r.json()
  if (j.status !== "success") throw new Error("sochain")
  const d = j.data
  return {
    txid: d.txid,
    confirmations: d.confirmations,
    time: d.time,
    size: d.size,
    vsize: d.vsize ?? d.size,
    network: chain.toUpperCase(),
    fees: d.fees,
    inputs: (d.inputs ?? []).map((i: any) => ({ address: i.address, value: Number(i.value) })),
    outputs: (d.outputs ?? []).map((o: any) => ({ address: o.address, value: Number(o.value) })),
  }
}

async function blockcypherTx(chain: UTXOChain, hash: string) {
  const netMap: Record<UTXOChain, string> = {
    btc: "btc/main",
    ltc: "ltc/main",
    doge: "doge/main",
    dash: "dash/main",
    bch: "bcy/test",
    zec: "zec/main",
  }
  const url = `https://api.blockcypher.com/v1/${netMap[chain]}/txs/${hash}`
  const r = await fetch(url, { cache: "no-store" })
  if (!r.ok) throw new Error("blockcypher")
  const d = await r.json()
  return {
    txid: d.hash,
    confirmations: d.confirmations,
    time: d.confirmed ? Math.floor(new Date(d.confirmed).getTime() / 1000) : undefined,
    size: d.size,
    vsize: d.vsize ?? d.size,
    network: chain.toUpperCase(),
    fees: (d.fees ?? 0) / 1e8,
    inputs: (d.inputs ?? []).flatMap((i: any) =>
      (i.addresses ?? []).map((a: string) => ({ address: a, value: (i.output_value ?? 0) / 1e8 })),
    ),
    outputs: (d.outputs ?? []).flatMap((o: any) =>
      (o.addresses ?? []).map((a: string) => ({ address: a, value: (o.value ?? 0) / 1e8 })),
    ),
  }
}

async function ethBlockscoutTx(hash: string) {
  const r = await fetch(`https://eth.blockscout.com/api?module=transaction&action=gettxinfo&txhash=${hash}`, {
    cache: "no-store",
  })
  if (!r.ok) throw new Error("blockscout")
  const j = await r.json()
  const d = j?.result ?? {}
  const value = Number(d.value ?? 0) / 1e18
  const gasPrice = Number(d.gasPrice ?? 0) / 1e9 // Gwei
  const gasUsed = Number(d.gasUsed ?? 0)
  const feeEth = (Number(d.gasPrice ?? 0) * gasUsed) / 1e18
  return {
    txid: d.hash,
    confirmations: Number(d.confirmations ?? 0),
    time: d.timeStamp ? Number(d.timeStamp) : undefined,
    size: undefined,
    vsize: undefined,
    network: "ETH",
    fees: feeEth,
    inputs: [{ address: d.from, value }],
    outputs: [{ address: d.to, value }],
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chain = (searchParams.get("chain") ?? "").toLowerCase()
  const hash = searchParams.get("hash") ?? ""
  if (!chain || !hash) return NextResponse.json({}, { status: 400 })

  if (chain === "eth") {
    try {
      const out = await ethBlockscoutTx(hash)
      return NextResponse.json(out)
    } catch {
      return NextResponse.json({}, { status: 500 })
    }
  }

  const utxo = chain as UTXOChain
  try {
    const out = await sochainTx(utxo, hash)
    return NextResponse.json(out)
  } catch {
    try {
      const out = await blockcypherTx(utxo, hash)
      return NextResponse.json(out)
    } catch {
      return NextResponse.json({}, { status: 500 })
    }
  }
}
