"use client"

import { Converter } from "@/components/converter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ConverterPage() {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
      <CardHeader>
        <CardTitle>Crypto Converter</CardTitle>
        <CardDescription className="text-white/70">Convert crypto to crypto or crypto to fiat (USD)</CardDescription>
      </CardHeader>
      <CardContent>
        <Converter />
      </CardContent>
    </Card>
  )
}
