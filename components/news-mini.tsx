"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function NewsMini() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/rss")
        if (!r.ok) throw new Error("rss")
        const d = await r.json()
        setItems(Array.isArray(d.items) ? d.items.slice(0, 5) : [])
      } catch (e) {
        console.error(e)
        setError("Failed to load news.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-zinc-400">Loading...</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <Link key={i} href={it.link} target="_blank" className="rounded-md border border-white/10 p-2 hover:bg-white/5">
          <div className="text-sm font-medium line-clamp-2">{it.title}</div>
          <div className="text-xs text-zinc-400">{new Date(it.pubDate).toLocaleString()}</div>
        </Link>
      ))}
      {items.length === 0 && <div className="text-zinc-400 text-sm">No news available.</div>}
    </div>
  )
}
