"use client"

import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

function hashToHsl(str: string, s = 65, l = 60) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return `hsl(${Math.abs(h) % 360} ${s}% ${l}%)`
}

export function PriceChart({ coinId = "bitcoin", days = 1 }: { coinId?: string; days?: number }) {
  const [data, setData] = useState<{ t: number; price: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/market-chart/${coinId}?days=${days}`)
        if (!res.ok) throw new Error("chart load failed")
        const d = await res.json()
        const series = (d?.prices ?? []).map((p: [number, number]) => ({ t: p[0], price: p[1] }))
        if (alive) setData(series)
      } catch (e) {
        console.error(e)
        if (alive) {
          setError("Failed to load chart.")
          setData([])
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [coinId, days])

  const color = useMemo(() => hashToHsl(coinId, 70, 60), [coinId])

  if (loading) return <div className="text-zinc-400">Loading chart...</div>
  if (error) return <div className="text-red-400">{error}</div>
  if (!data.length) return <div className="text-zinc-400">No chart data.</div>

  const config = { price: { label: "Price", color: "hsl(var(--chart-1))" } }

  return (
    <ChartContainer config={config} className="w-full">
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`priceGradient-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={(t) =>
                (days ?? 1) > 1
                  ? new Date(t).toLocaleDateString()
                  : new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
              stroke="rgba(255,255,255,0.5)"
            />
            <YAxis
              dataKey="price"
              tickFormatter={(n) => "$" + (Math.abs(n) >= 1 ? n.toFixed(2) : n.toPrecision(2))}
              stroke="rgba(255,255,255,0.5)"
              domain={["auto", "auto"]}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              fill={`url(#priceGradient-${coinId})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}
