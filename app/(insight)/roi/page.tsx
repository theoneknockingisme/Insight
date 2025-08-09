"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMemo, useState } from "react"

export default function ROIPage() {
  const [invested, setInvested] = useState<number>(80)
  const [initialPrice, setInitialPrice] = useState<number>(20)
  const [targetPrice, setTargetPrice] = useState<number>(100)

  const coinsOwned = useMemo(() => {
    if (!initialPrice) return 0
    return invested / initialPrice
  }, [invested, initialPrice])

  const totalValue = useMemo(() => coinsOwned * targetPrice, [coinsOwned, targetPrice])
  const profit = useMemo(() => totalValue - invested, [totalValue, invested])
  const roi = useMemo(() => (invested ? (profit / invested) * 100 : 0), [profit, invested])

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
      <CardHeader>
        <CardTitle>Profit / ROI Calculator</CardTitle>
        <CardDescription className="text-white/70">Estimate potential returns</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Amount Invested ($)</Label>
            <Input
              type="number"
              value={invested}
              onChange={(e) => setInvested(Number.parseFloat(e.target.value || "0"))}
              className="bg-black/40 border-white/10"
            />
          </div>
          <div className="grid gap-2">
            <Label>Initial Price ($)</Label>
            <Input
              type="number"
              value={initialPrice}
              onChange={(e) => setInitialPrice(Number.parseFloat(e.target.value || "0"))}
              className="bg-black/40 border-white/10"
            />
          </div>
          <div className="grid gap-2">
            <Label>Target Price ($)</Label>
            <Input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number.parseFloat(e.target.value || "0"))}
              className="bg-black/40 border-white/10"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Stat label="Coins Owned" value={`${coinsOwned.toFixed(6)}`} />
          <Stat label="Total Value at Target" value={`$${totalValue.toFixed(2)}`} />
          <Stat label="Profit" value={`$${profit.toFixed(2)}`} />
        </div>
        <div className="grid">
          <div className="text-sm text-white/60">ROI</div>
          <div className="text-2xl font-semibold">{roi.toFixed(2)}%</div>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
