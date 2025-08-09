"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function TopCoinsMini() {
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/markets?per_page=8&page=1")
        if (!res.ok) throw new Error("load failed")
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error("unexpected shape")
        setCoins(data)
      } catch (e) {
        console.error(e)
        setError("Failed to load.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-zinc-400">Loading...</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {coins.map((c) => (
        <Link href={`/coin/${c.id}`} key={c.id} className="rounded-lg border border-white/10 p-3 hover:bg-white/5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image || "/placeholder.svg?height=24&width=24&query=coin%20logo"}
              alt={`${c.name} logo`}
              className="h-6 w-6 rounded-full"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">
                {c.name} <span className="text-zinc-400 uppercase">{c.symbol}</span>
              </div>
              <div className="text-xs text-zinc-400">${(c.current_price ?? 0).toLocaleString()}</div>
            </div>
            <div
              className={`text-xs font-medium ${
                (c.price_change_percentage_24h ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {(c.price_change_percentage_24h ?? 0).toFixed(2)}%
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
