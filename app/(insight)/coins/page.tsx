"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

export default function TopCoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sort, setSort] = useState<"market_cap" | "price" | "volume">("market_cap")
  const [q, setQ] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/markets?per_page=100&page=1")
        if (!res.ok) throw new Error("load failed")
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error("unexpected shape")
        setCoins(data)
      } catch (e) {
        console.error(e)
        setError("Failed to load coins.")
        setCoins([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let rows = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.symbol.toLowerCase().includes(q.toLowerCase()) ||
        `${c.symbol}/${q}`.toLowerCase().includes("/") ||
        `${q}/${c.symbol}`.toLowerCase().includes("/"),
    )
    if (sort === "market_cap") rows = rows.slice().sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0))
    if (sort === "price") rows = rows.slice().sort((a, b) => (b.current_price ?? 0) - (a.current_price ?? 0))
    if (sort === "volume") rows = rows.slice().sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
    return rows
  }, [coins, q, sort])

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search coin or pair (e.g., LTC, LTC/BTC)"
          className="w-72 bg-zinc-900/60 border-white/10 text-zinc-50 placeholder:text-zinc-400"
        />
        <Button
          variant={sort === "market_cap" ? "default" : "secondary"}
          onClick={() => setSort("market_cap")}
          className="gap-1"
        >
          <ArrowUpDown className="h-4 w-4" /> Market Cap
        </Button>
        <Button variant={sort === "price" ? "default" : "secondary"} onClick={() => setSort("price")} className="gap-1">
          <ArrowUpDown className="h-4 w-4" /> Price
        </Button>
        <Button
          variant={sort === "volume" ? "default" : "secondary"}
          onClick={() => setSort("volume")}
          className="gap-1"
        >
          <ArrowUpDown className="h-4 w-4" /> Volume
        </Button>
      </div>
      {loading && <div className="text-zinc-400">Loading top 100...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-zinc-200">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Name</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">24h</th>
                <th className="text-right p-3">Market Cap</th>
                <th className="text-right p-3">Volume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">
                    <Link href={`/coin/${c.id}`} className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image || "/placeholder.svg?height=20&width=20&query=coin%20logo"}
                        alt={`${c.name} logo`}
                        className="h-5 w-5 rounded-full"
                      />
                      <span className="font-medium">{c.name}</span>
                      <span className="text-zinc-400 uppercase">{c.symbol}</span>
                    </Link>
                  </td>
                  <td className="p-3 text-right">${(c.current_price ?? 0).toLocaleString()}</td>
                  <td
                    className={[
                      "p-3 text-right font-medium",
                      (c.price_change_percentage_24h ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                    ].join(" ")}
                  >
                    <div className="inline-flex items-center gap-1 justify-end">
                      {(c.price_change_percentage_24h ?? 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {(c.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-3 text-right">${(c.market_cap ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-right">${(c.total_volume ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
