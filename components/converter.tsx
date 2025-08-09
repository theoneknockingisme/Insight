"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Option = { id: string; symbol: string; name: string }

export function Converter({ compact = false }: { compact?: boolean }) {
  const [amount, setAmount] = useState<number>(1)
  const [from, setFrom] = useState<string>("bitcoin")
  const [to, setTo] = useState<string>("usd")
  const [coins, setCoins] = useState<Option[]>([])
  const [vs, setVs] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/markets?per_page=100&page=1").then((r) => r.json()),
      fetch("/api/cg/supported_vs").then((r) => r.json()),
    ])
      .then(([coinData, vsData]) => {
        const list = Array.isArray(coinData) ? coinData : []
        setCoins(list.map((c: any) => ({ id: c.id, symbol: c.symbol, name: c.name })))
        setVs(Array.isArray(vsData) ? vsData : [])
      })
      .catch(console.error)
  }, [])

  const [rate, setRate] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        if (from === to) {
          if (alive) setRate(1)
          return
        }
        const res = await fetch(`/api/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
        const d = await res.json()
        if (alive) setRate(d?.value ?? null)
      } catch (e) {
        console.error(e)
        if (alive) setRate(null)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [from, to])

  const result = useMemo(() => {
    if (rate === null) return "-"
    return (amount * rate).toLocaleString(undefined, { maximumFractionDigits: 8 })
  }, [amount, rate])

  const coinOptions = coins.slice(0, 100)

  return (
    <div className="grid gap-4">
      <div className={`${compact ? "grid-cols-[1fr_1fr_1fr]" : "grid-cols-1 sm:grid-cols-3"} grid gap-3`}>
        <div className="grid gap-2">
          <Label className="text-zinc-300">Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number.parseFloat(e.target.value || "0"))}
            className="bg-zinc-900/60 border-white/10 text-zinc-50"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-zinc-300">From</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="bg-zinc-900/60 border-white/10 text-zinc-50">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {coinOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </SelectItem>
              ))}
              <SelectItem value="usd">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-zinc-300">To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="bg-zinc-900/60 border-white/10 text-zinc-50">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {coinOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </SelectItem>
              ))}
              <SelectItem value="usd">USD</SelectItem>
              {vs.slice(0, 40).map((v) => (
                <SelectItem key={v} value={v}>
                  {v.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-zinc-400">Result</div>
      <div className="text-xl font-semibold">
        {result} {to.toUpperCase()}
      </div>
    </div>
  )
}
