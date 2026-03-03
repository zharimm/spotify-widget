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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatLastPlayed(dateString: string): string {
  const date = new Date(dateString)
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    })
    .replace(",", " at")
}

export function SpotifyWidget() {
  const { data: track, isLoading } = useSWR<SpotifyTrack>("/api/spotify", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading || !track) {
    return (
      <div className="w-full max-w-sm">
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
  return (
    <div className="w-full max-w-sm font-sans">
      <div className="p-1 rounded-lg bg-slate-200">
        <div className="flex items-center gap-3 bg-background px-1 py-1 rounded-sm shadow-xs border-solid border border-slate-200">
          {/* Album Art, Add in prod: track.albumArt || "/placeholder-album.png" */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
            <img
              src={track.albumArt || "/placeholder-album.png"}
              alt={`${track.name} album art`}
              className="w-full h-full object-cover rounded"
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
              >
                {track.name}
              </a>
            </h3>
            <p className="text-sm truncate text-slate-500">{track.artist}</p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground mr-1 ml-1 mb-0">
          <span
            className={`h-2 w-2 rounded-full text-slate-200 bg-slate-300 ${
              track.isPlaying ? "bg-green-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span className="text-slate-500">
            {track.isPlaying
              ? "Now playing"
              : track.playedAt
                ? `Last played on ${formatLastPlayed(track.playedAt)}`
                : "Recently played"}
          </span>
        </div>
      </div>
    </div>
  )
}
