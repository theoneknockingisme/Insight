"use client"

import { AddressChecker } from "@/components/address-checker"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AddressPage() {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
      <CardHeader>
        <CardTitle>Address Balance</CardTitle>
        <CardDescription className="text-white/70">
          Check balances and recent transactions (BTC, LTC, DOGE, DASH, BCH, ZEC) via SoChain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddressChecker />
      </CardContent>
    </Card>
  )
}
