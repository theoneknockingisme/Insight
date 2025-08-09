"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PriceChart } from "@/components/price-chart"
import { Button } from "@/components/ui/button"

export default function CoinDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id || "bitcoin"

  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<1 | 7>(1) // 1D or 1W (7D)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/cg/coin/${id}`)
        if (!res.ok) throw new Error("load failed")
        const d = await res.json()
        setData(d)
      } catch (e) {
        console.error(e)
        setError("Failed to load coin.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const md = data?.market_data
  const price = md?.current_price?.usd ?? 0
  const change1h = md?.price_change_percentage_1h_in_currency?.usd ?? 0
  const change24h = md?.price_change_percentage_24h_in_currency?.usd ?? 0
  const high24 = md?.high_24h?.usd ?? 0
  const low24 = md?.low_24h?.usd ?? 0
  const cap = md?.market_cap?.usd ?? 0
  const image = data?.image?.large

  return (
    <div className="grid gap-6">
      {loading && <div className="text-zinc-400">Loading coin...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && data && (
        <>
          <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
            <CardHeader className="flex flex-row items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {image && (
                <img
                  src={image || "/placeholder.svg?height=40&width=40&query=coin%20logo"}
                  alt={`${data.name} logo`}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {data.name} <span className="text-zinc-400 uppercase text-base">{data.symbol}</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">Live stats and chart</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Stat label="Price" value={`$${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}`} />
                <Stat label="Hour Change" value={`${change1h.toFixed(2)}%`} tone={change1h >= 0 ? "up" : "down"} />
                <Stat label="24 Hour Change" value={`${change24h.toFixed(2)}%`} tone={change24h >= 0 ? "up" : "down"} />
                <Stat label="24 Hour High" value={`$${high24.toLocaleString()}`} />
                <Stat label="24 Hour Low" value={`$${low24.toLocaleString()}`} />
                <Stat label="Market Cap" value={`$${cap.toLocaleString()}`} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Range:</span>
                <Button size="sm" variant={range === 1 ? "default" : "secondary"} onClick={() => setRange(1)}>
                  1D
                </Button>
                <Button size="sm" variant={range === 7 ? "default" : "secondary"} onClick={() => setRange(7)}>
                  1W
                </Button>
              </div>
              <div className="mt-1">
                <PriceChart coinId={String(id)} days={range} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "up" | "down" | "neutral" }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div
        className={`text-lg font-semibold ${tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : ""}`}
      >
        {value}
      </div>
    </div>
  )
}
