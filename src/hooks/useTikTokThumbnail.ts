import { useEffect, useState } from 'react'

const CACHE_PREFIX = 'tiktok_thumb_'
const TTL_MS = 24 * 60 * 60 * 1000 // TikTok's signed thumbnail URLs expire in ~48h — refresh well before that

type CacheEntry = { url: string; fetchedAt: number }

function readCache(id: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.fetchedAt > TTL_MS) return null
    return entry.url
  } catch {
    return null
  }
}

function writeCache(id: string, url: string) {
  try {
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify({ url, fetchedAt: Date.now() } satisfies CacheEntry))
  } catch { /* noop */ }
}

/** Fetches a video's thumbnail via TikTok's public oEmbed API, caching the (short-lived, signed) URL. */
export function useTikTokThumbnail(videoId: string, author = 'malikadegaldoruwa') {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => readCache(videoId))

  useEffect(() => {
    if (readCache(videoId)) return

    let cancelled = false
    const videoUrl = `https://www.tiktok.com/@${author}/video/${videoId}`

    fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: { thumbnail_url?: string } | null) => {
        if (cancelled || !data?.thumbnail_url) return
        writeCache(videoId, data.thumbnail_url)
        setThumbnailUrl(data.thumbnail_url)
      })
      .catch(() => { /* falls back to decorative gradient */ })

    return () => { cancelled = true }
  }, [videoId, author])

  return thumbnailUrl
}
