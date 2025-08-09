"use client"

import { FearGreedMini } from "@/components/fear-greed-mini"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function FearGreedPage() {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
      <CardHeader>
        <CardTitle>Fear & Greed Index</CardTitle>
        <CardDescription className="text-white/70">Sentiment based on Alternative.me</CardDescription>
      </CardHeader>
      <CardContent className="grid place-items-center">
        <FearGreedMini size="lg" />
      </CardContent>
    </Card>
  )
}
