"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function FearGreedMini({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [value, setValue] = useState<number | null>(null)
  const [classification, setClassification] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/fng")
        if (!res.ok) throw new Error("fng")
        const d = await res.json()
        const v = Number.parseInt(d?.value ?? "0", 10)
        setValue(Number.isFinite(v) ? v : null)
        setClassification(d?.classification ?? "")
      } catch (e) {
        console.error(e)
        setError("Failed to load index.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-zinc-400">Loading...</div>
  if (error || value === null) return <div className="text-red-400">{error || "Failed to load index."}</div>

  const data = [
    { name: "Greed", value: value },
    { name: "Fear", value: 100 - value },
  ]
  const COLORS = ["#22c55e", "#ef4444"]
  const height = size === "lg" ? 280 : size === "sm" ? 140 : 200

  return (
    <div className="grid place-items-center gap-2">
      <div className="text-sm text-zinc-400">Current: {classification}</div>
      <ChartContainer config={{}} className="w-full">
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  )
}
