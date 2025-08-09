"use client"

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div role="alert" className="text-red-400">
      Failed to load. {error?.message}
    </div>
  )
}
