"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopCoinsMini } from "@/components/top-coins-mini"
import { PriceChart } from "@/components/price-chart"
import { FearGreedMini } from "@/components/fear-greed-mini"
import { Converter } from "@/components/converter"
import { Newspaper, ArrowRightLeft } from "lucide-react"
import { NewsMini } from "@/components/news-mini"

export default function InsightDashboard() {
  return (
    <div className="grid gap-6">
      {/* 1) BTC chart at top */}
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardDescription className="text-zinc-400">Live Price</CardDescription>
            <CardTitle className="text-2xl">Bitcoin (BTC)</CardTitle>
          </div>
          <Link href="/coin/bitcoin">
            <Button variant="secondary">Details</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <PriceChart coinId="bitcoin" days={1} />
        </CardContent>
      </Card>

      {/* 2) Other coins without charts */}
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Top Movers</CardTitle>
          <CardDescription className="text-zinc-400">Snapshot of the market leaders by market cap</CardDescription>
        </CardHeader>
        <CardContent>
          <TopCoinsMini />
        </CardContent>
      </Card>

      {/* 3) Fear & Greed widget below */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-zinc-400" />
              <CardTitle className="text-lg">Quick Convert</CardTitle>
            </div>
            <Link href="/converter" className="text-sm text-zinc-400 hover:text-zinc-100">
              Full converter
            </Link>
          </CardHeader>
          <CardContent>
            <Converter compact />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Fear & Greed</CardTitle>
            </div>
            <Link href="/fear-greed" className="text-sm text-zinc-400 hover:text-zinc-100">
              Details
            </Link>
          </CardHeader>
          <CardContent className="grid place-items-center">
            <FearGreedMini />
          </CardContent>
        </Card>
      </div>

      {/* 4) News */}
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-zinc-400" />
            <CardTitle className="text-lg">Latest News</CardTitle>
          </div>
          <Link href="/news" className="text-sm text-zinc-400 hover:text-zinc-100">
            All news
          </Link>
        </CardHeader>
        <CardContent>
          <NewsMini />
        </CardContent>
      </Card>
    </div>
  )
}
