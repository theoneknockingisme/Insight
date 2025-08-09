"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Eye, Search } from "lucide-react"
import { type PropsWithChildren, useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

function useIsActive(href: string) {
  const pathname = usePathname()
  return useMemo(() => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }, [href, pathname])
}

function GlobalSearch({ defaultQuery = "" }: { defaultQuery?: string }) {
  const [q, setQ] = useState(defaultQuery)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    try {
      setLoading(true)
      const res = await fetch(`/api/cg/search?query=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("search failed")
      const data = await res.json()
      const id = data?.coins?.[0]?.id
      if (id) {
        router.push(`/coin/${id}`)
      } else {
        alert("No coin found for your search.")
      }
    } catch (e) {
      console.error(e)
      alert("Search failed. Try a different query.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" aria-hidden />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search any coin (e.g., bitcoin, eth, ltc)"
        className="pl-9 bg-zinc-900/60 border-white/10 text-zinc-50 placeholder:text-zinc-400"
      />
      <Button disabled={loading} type="submit" className="absolute right-1 top-1 h-8">
        {loading ? "Searching..." : "Go"}
      </Button>
    </form>
  )
}

function LoadingOverlay() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [])
  if (!visible) return null
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-gradient-to-b from-[#0a0a0a] via-[#111] to-black"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="size-16 rounded-full bg-white flex items-center justify-center shadow-2xl">
          <Eye className="h-8 w-8 text-white animate-pulse" />
        </div>
        <div className="text-zinc-300 text-sm">Loading Insight...</div>
      </div>
    </div>
  )
}

export default function InsightLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111] to-black text-zinc-50">
      <LoadingOverlay />
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Insight Home">
            <div className="size-9 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center shadow-md">
              <Eye className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="text-lg font-semibold tracking-wide">Insight</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-2 text-sm">
            <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/coins">Top 100</NavLink>
              <NavLink href="/converter">Convert</NavLink>
              <NavLink href="/fear-greed">Fear & Greed</NavLink>
              <NavLink href="/memecoins">Memecoins</NavLink>
              <NavLink href="/address">Address</NavLink>
              <NavLink href="/tx">Transaction</NavLink>
              <NavLink href="/roi">ROI</NavLink>
              <NavLink href="/news">News</NavLink>
            </Suspense>
          </nav>
          <div className="ml-auto w-full md:w-auto">
            <GlobalSearch />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="border-t border-white/10 py-6 text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Insight © {new Date().getFullYear()}</div>
          <div className="flex items-center gap-4">
            <Link href="/news" className="hover:text-zinc-100">
              News
            </Link>
            <Link href="/coins" className="hover:text-zinc-100">
              Markets
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = useIsActive(href)
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-md hover:bg-white/5 text-zinc-300 hover:text-zinc-100",
        active && "bg-white/10 text-zinc-50",
      )}
    >
      {children}
    </Link>
  )
}
