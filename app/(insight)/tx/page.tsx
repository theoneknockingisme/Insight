"use client"

import { TxChecker } from "@/components/tx-checker"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function TxPage() {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
      <CardHeader>
        <CardTitle>Transaction Lookup</CardTitle>
        <CardDescription className="text-white/70">
          Inspect a transaction by hash (BTC, LTC, DOGE, DASH, BCH, ZEC)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TxChecker />
      </CardContent>
    </Card>
  )
}
