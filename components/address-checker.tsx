"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Net = "BTC" | "ETH" | "LTC" | "DOGE" | "DASH" | "BCH" | "ZEC"
const networks: Net[] = ["BTC", "ETH", "LTC", "DOGE", "DASH", "BCH", "ZEC"]

export function AddressChecker() {
  const [net, setNet] = useState<Net>("LTC")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<any>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [usd, setUsd] = useState<number>(0)

  useEffect(() => {
    const map: Record<Net, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      LTC: "litecoin",
      DOGE: "dogecoin",
      DASH: "dash",
      BCH: "bitcoin-cash",
      ZEC: "zcash",
    }
    const id = map[net]
    fetch(`/api/cg/simple-price?ids=${id}&vs=usd`)
      .then((r) => r.json())
      .then((d) => setUsd(d?.value ?? 0))
      .catch(() => setUsd(0))
  }, [net])

  async function lookup() {
    if (!address) return
    setLoading(true)
    setError("")
    setData(null)
    setTxs([])
    try {
      const res = await fetch(`/api/address?chain=${net.toLowerCase()}&address=${encodeURIComponent(address)}`)
      if (!res.ok) throw new Error("Lookup failed")
      const d = await res.json()
      setData(d.summary)
      setTxs(d.txs ?? [])
    } catch (e) {
      console.error(e)
      setError("Failed to fetch address data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-[160px_1fr_auto] gap-3">
        <div className="grid gap-2">
          <Label className="text-zinc-300">Network</Label>
          <Select value={net} onValueChange={(v: Net) => setNet(v)}>
            <SelectTrigger className="bg-zinc-900/60 border-white/10 text-zinc-50">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-zinc-300">Address</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            className="bg-zinc-900/60 border-white/10 text-zinc-50 placeholder:text-zinc-400"
          />
        </div>
        <div className="self-end">
          <Button onClick={lookup} disabled={loading}>
            {loading ? "Checking..." : "Check"}
          </Button>
        </div>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      {data && (
        <div className="grid gap-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KV label="Balance" value={`${data.balance} ${net} | $${(data.balance * usd).toFixed(2)} USD`} />
            <KV
              label="Total Received"
              value={`${data.total_received} ${net} | $${(data.total_received * usd).toFixed(2)} USD`}
            />
            <KV label="Total Sent" value={`${data.total_sent} ${net} | $${(data.total_sent * usd).toFixed(2)} USD`} />
            <KV
              label="Unconfirmed Balance"
              value={`${data.unconfirmed} ${net} | $${(data.unconfirmed * usd).toFixed(2)} USD`}
            />
          </div>
          <div className="text-sm font-medium mt-2">Recent Transactions</div>
          <div className="grid gap-2">
            {txs.map((t) => (
              <div key={t.txid} className="rounded-lg border border-white/10 p-3">
                <div className="text-xs text-zinc-400">{timeAgo((t.time ?? 0) * 1000)}</div>
                <div className="text-sm font-mono break-all">
                  {t.txid.slice(0, 12)}..{t.txid.slice(-12)}
                </div>
                {"value" in t ? (
                  <div className={`text-sm font-medium ${t.incoming ? "text-emerald-400" : "text-red-400"}`}>
                    {t.incoming ? "+" : "-"}${Math.abs(Number(t.value) * usd).toFixed(2)} USD
                  </div>
                ) : null}
              </div>
            ))}
            {txs.length === 0 && <div className="text-zinc-400 text-sm">No recent transactions.</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}

function timeAgo(ts: number) {
  if (!ts) return "-"
  const diff = Date.now() - ts
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const mins = Math.floor(diff / (1000 * 60))
  return `${mins} minute${mins > 1 ? "s" : ""} ago`
}
