"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type NewsItem = {
  title: string
  link: string
  pubDate: string
  source?: string
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/rss")
        if (!res.ok) throw new Error("rss")
        const data = await res.json()
        setItems(Array.isArray(data.items) ? data.items : [])
      } catch (e) {
        console.error(e)
        setError("Failed to load news.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
      <CardHeader>
        <CardTitle>Crypto News</CardTitle>
        <CardDescription className="text-zinc-400">Latest headlines</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-zinc-400">Loading news...</div>}
        {error && <div className="text-red-400">{error}</div>}
        <div className="grid gap-4">
          {items.map((it, idx) => (
            <Link
              key={idx}
              href={it.link}
              target="_blank"
              className="rounded-lg border border-white/10 p-3 hover:bg-white/5"
            >
              <div className="text-base font-medium">{it.title}</div>
              <div className="text-xs text-zinc-400">{new Date(it.pubDate).toLocaleString()}</div>
            </Link>
          ))}
          {(!items || items.length === 0) && !loading && !error && (
            <div className="text-zinc-400 text-sm">No news available.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
