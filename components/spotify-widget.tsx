"use client"

import useSWR from "swr"

interface SpotifyTrack {
  isPlaying: boolean
  name: string
  artist: string
  albumArt: string
  spotifyUrl: string
  playedAt: string | null
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  })

function formatLastPlayed(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "recently"
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate()
    const time = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    return `${month} ${day} at ${time}`
  } catch {
    return "recently"
  }
}

export function SpotifyWidget() {
  const { data: track, isLoading, error } = useSWR<SpotifyTrack>("/api/spotify", fetcher, {
    refreshInterval: 30_000,
    dedupingInterval: 5_000,
    errorRetryCount: 3,
    revalidateOnFocus: false,
  })

  // Loading skeleton
  if (isLoading || (!track && !error)) {
    return (
      <div className="w-full max-w-sm" role="status" aria-label="Loading Spotify widget">
        <div className="bg-card border border-border rounded-xl p-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <div className="h-3 bg-muted rounded w-40" />
          </div>
        </div>
      </div>
    )
  }

  // Error or no data — hide widget gracefully
  if (error || !track) return null

  const statusText = track.isPlaying
    ? "Now playing"
    : track.playedAt
      ? `Last played ${formatLastPlayed(track.playedAt)}`
      : "Recently played"

  return (
    <article
      className="w-full max-w-sm font-sans"
      role="region"
      aria-label="Spotify listening activity"
    >
      <div className="p-1 rounded-lg bg-slate-200">
        <div className="flex items-center gap-3 bg-background px-1 py-1 rounded-sm shadow-xs border-solid border border-slate-200">
          {/* Album Art */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
            <img
              src={track.albumArt || "/placeholder-album.png"}
              alt={`${track.name} album art`}
              className="w-full h-full object-cover rounded"
              loading="lazy"
            />
          </div>

          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate text-sm text-slate-700">
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                aria-label={`${track.name} by ${track.artist} — open in Spotify`}
              >
                {track.name}
              </a>
            </h3>
            <p className="text-sm truncate text-slate-500">{track.artist}</p>
          </div>
        </div>

        {/* Status */}
        <div
          className="mt-1 flex items-center gap-2 text-xs mx-1 mb-0"
          role="status"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              track.isPlaying ? "bg-green-500 animate-pulse" : "bg-slate-400"
            }`}
            aria-hidden="true"
          />
          <span className="text-slate-500">{statusText}</span>
        </div>
      </div>
    </article>
  )
}
