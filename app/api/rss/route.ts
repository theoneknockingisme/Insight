import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"

async function fetchRss(url: string) {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("rss")
  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: false })
  const parsed = parser.parse(xml)
  const channel = parsed?.rss?.channel
  const itemsRaw = channel?.item
  const items = Array.isArray(itemsRaw) ? itemsRaw : itemsRaw ? [itemsRaw] : []
  return items.map((it: any) => ({
    title: it.title,
    link: it.link,
    pubDate: it.pubDate ?? it.pubdate ?? it["dc:date"] ?? new Date().toISOString(),
  }))
}

export async function GET() {
  // Try CoinDesk, fallback to CoinTelegraph
  const sources = ["https://www.coindesk.com/arc/outboundfeeds/rss/", "https://cointelegraph.com/rss"]
  for (const url of sources) {
    try {
      const items = await fetchRss(url)
      return NextResponse.json({ items }, { headers: { "Cache-Control": "s-maxage=300" } })
    } catch {
      // try next
    }
  }
  return NextResponse.json({ items: [] }, { status: 500 })
}
