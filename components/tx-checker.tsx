"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Net = "BTC" | "ETH" | "LTC" | "DOGE" | "DASH" | "BCH" | "ZEC"

export function TxChecker() {
  const [net, setNet] = useState<Net>("LTC")
  const [hash, setHash] = useState("")
  const [tx, setTx] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function lookup() {
    if (!hash) return
    setLoading(true)
    setError("")
    setTx(null)
    try {
      const res = await fetch(`/api/tx?chain=${net.toLowerCase()}&hash=${encodeURIComponent(hash)}`)
      if (!res.ok) throw new Error("Lookup failed")
      const d = await res.json()
      setTx(d)
    } catch (e) {
      console.error(e)
      setError("Failed to fetch transaction.")
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
              {(["BTC", "ETH", "LTC", "DOGE", "DASH", "BCH", "ZEC"] as Net[]).map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-zinc-300">Tx Hash</Label>
          <Input
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Enter transaction hash"
            className="bg-zinc-900/60 border-white/10 text-zinc-50 placeholder:text-zinc-400"
          />
        </div>
        <div className="self-end">
          <Button onClick={lookup} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      {tx && <TxDetails tx={tx} />}
    </div>
  )
}

function TxDetails({ tx }: { tx: any }) {
  const time = tx.time ? new Date(tx.time * 1000) : null
  const totalAmount = (tx.outputs ?? []).reduce((sum: number, o: any) => sum + Number(o.value ?? 0), 0)
  return (
    <div className="grid gap-3 rounded-lg border border-white/10 p-4">
      <div className="text-sm font-mono break-all">{tx.txid}</div>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        <KV label="Confirmations" value={String(tx.confirmations ?? 0)} />
        <KV label="Time" value={time ? `${time.toLocaleString()} (${timeAgo(time.getTime())})` : "-"} />
        <KV label="Size" value={`${tx.size ?? "-"} bytes (${tx.vsize ?? "-"} vb)`} />
        <KV label="Fee" value={`${tx.fees ?? tx.fee ?? "-"} ${tx.network ?? ""}`} />
        <KV label="Total Amount" value={`${totalAmount} ${tx.network ?? ""}`} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-semibold mb-2">Inputs</div>
          <div className="grid gap-2">
            {(tx.inputs ?? []).map((i: any, idx: number) => (
              <div key={idx} className="rounded-md border border-white/10 p-2">
                <div className="text-xs text-zinc-400 break-all">{i.address}</div>
                <div className="text-sm">
                  {i.value} {tx.network ?? ""}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Outputs</div>
          <div className="grid gap-2">
            {(tx.outputs ?? []).map((o: any, idx: number) => (
              <div key={idx} className="rounded-md border border-white/10 p-2">
                <div className="text-xs text-zinc-400 break-all">{o.address}</div>
                <div className="text-sm">
                  {o.value} {tx.network ?? ""}
                </div>
              </div>
            ))}
          </div>
        </div>
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

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const mins = Math.floor(diff / (1000 * 60))
  return `${mins} minute${mins > 1 ? "s" : ""} ago`
}
