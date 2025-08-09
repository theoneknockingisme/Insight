"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Pair = {
  chainId: string
  dexId: string
  pairAddress: string
  baseToken: { address: string; name: string; symbol: string }
  quoteToken: { address: string; name: string; symbol: string }
  priceUsd?: string
  fdv?: number
  marketCap?: number
  liquidity?: { usd?: number }
  volume?: { h24?: number }
  txns?: { h24?: { buys: number; sells: number } }
  pairCreatedAt?: number
  priceChange?: { m5?: number; h1?: number; h24?: number }
}

export function MemecoinSearch() {
  const [q, setQ] = useState("")
  const [pairs, setPairs] = useState<Pair[]>([])
  const [latest, setLatest] = useState<Record<string, Pair[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  async function search() {
    if (!q.trim()) return
    try {
      setLoading(true)
      const res = await fetch(`/api/dex/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("dex")
      const d = await res.json()
      setPairs(Array.isArray(d?.pairs) ? d.pairs : [])
    } catch (e) {
      console.error(e)
      setPairs([])
      setError("Search failed.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadLatest() {
      try {
        const chains = ["solana", "base", "bsc", "ethereum"]
        const out: Record<string, Pair[]> = {}
        await Promise.all(
          chains.map(async (c) => {
            const r = await fetch(`/api/dex/pairs/${c}`)
            const d = await r.json()
            out[c] = Array.isArray(d?.pairs) ? d.pairs.slice(0, 12) : []
          }),
        )
        setLatest(out)
      } catch (e) {
        console.error(e)
      }
    }
    loadLatest()
  }, [])

  return (
    <div className="grid gap-6">
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search memecoin by name or address"
          className="bg-zinc-900/60 border-white/10 text-zinc-50 placeholder:text-zinc-400"
        />
        <Button onClick={search} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      {pairs.length > 0 && (
        <div className="grid gap-2">
          <div className="text-sm text-zinc-400">Results</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pairs.map((p, i) => (
              <PairCard key={`${p.pairAddress}-${i}`} p={p} />
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-3">
        <div className="text-sm text-zinc-400">Recently Created Pairs</div>
        {Object.entries(latest).map(([chain, items]) => (
          <div key={chain} className="grid gap-2">
            <div className="text-xs uppercase text-zinc-500">{chain}</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p, i) => (
                <PairCard key={`${p.pairAddress}-${i}`} p={p} />
              ))}
              {items.length === 0 && <div className="text-zinc-400 text-sm">No recent pairs.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PairCard({ p }: { p: Pair }) {
  const created = p.pairCreatedAt ? new Date(p.pairCreatedAt) : null
  const price = p.priceUsd ? Number.parseFloat(p.priceUsd) : null
  return (
    <div className="rounded-lg border border-white/10 p-3 hover:bg-white/5">
      <div className="text-sm font-medium">
        {p.baseToken?.name} <span className="text-zinc-400">({p.baseToken?.symbol})</span>
      </div>
      <div className="text-xs text-zinc-400 break-all">
        Address {p.baseToken?.address?.slice(0, 10)}..{p.baseToken?.address?.slice(-6)}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
        <KV
          label="Price"
          value={price !== null ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })} USD` : "-"}
        />
        <KV
          label="MarketCap"
          value={
            p.fdv
              ? `$${Number(p.fdv).toLocaleString()}`
              : p.marketCap
                ? `$${Number(p.marketCap).toLocaleString()}`
                : "-"
          }
        />
        <KV label="Liquidity" value={p.liquidity?.usd ? `$${p.liquidity.usd.toLocaleString()}` : "-"} />
        <KV label="Volume (24h)" value={p.volume?.h24 ? `$${p.volume.h24.toLocaleString()}` : "-"} />
        <KV
          label="Changes"
          value={`5m: ${fmtPct(p.priceChange?.m5)}, 1h: ${fmtPct(p.priceChange?.h1)}, 24h: ${fmtPct(
            p.priceChange?.h24,
          )}`}
        />
        <KV label="Pair Created" value={created ? created.toLocaleString() : "-"} />
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  )
}

function fmtPct(v?: number) {
  if (typeof v !== "number") return "-"
  const s = v >= 0 ? "+" : ""
  return `${s}${v.toFixed(2)}%`
}
