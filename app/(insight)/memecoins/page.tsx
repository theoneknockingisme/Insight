"use client"

import { MemecoinSearch } from "@/components/memecoin-search"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function MemecoinsPage() {
  return (
    <div className="grid gap-6">
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
        <CardHeader>
          <CardTitle>Memecoin Explorer</CardTitle>
          <CardDescription className="text-white/70">
            Search by name or address and see recently created pairs via Dexscreener
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemecoinSearch />
        </CardContent>
      </Card>
    </div>
  )
}
