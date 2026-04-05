"use client"

// Framer Spotify Widget — Native Code Component
// Copy this entire file into Framer as a Code Component.
// It fetches live data from the Vercel API; no iFrame needed.

import { useEffect, useState, useCallback } from "react"

// ─── Config ────────────────────────────────────────────────
const API_URL = "https://v0-spotify-widget-gray.vercel.app/api/spotify"
const POLL_INTERVAL = 30_000 // 30 seconds

// ─── Types ─────────────────────────────────────────────────
interface SpotifyTrack {
  isPlaying: boolean
  name: string
  artist: string
  albumArt: string
  spotifyUrl: string
  playedAt: string | null
}

// ─── Helpers ───────────────────────────────────────────────
function formatLastPlayed(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "recently"
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate()
    const hours = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    return `${month} ${day} at ${hours}`
  } catch {
    return "recently"
  }
}

// ─── Component ─────────────────────────────────────────────
export default function SpotifyWidget() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  const [error, setError] = useState(false)

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch(API_URL)
      if (!res.ok) {
        setError(true)
        return
      }
      const data: SpotifyTrack = await res.json()
      setTrack(data)
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    fetchTrack()
    const id = setInterval(fetchTrack, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchTrack])

  // ── Loading state ──────────────────────────────────────
  if (!track && !error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ ...styles.artPlaceholder, animation: "pulse 2s ease-in-out infinite" }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.textPlaceholder, width: "75%" }} />
              <div style={{ ...styles.textPlaceholder, width: "50%", marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error / no data — hide widget ──────────────────────
  if (error || !track) return null

  // ── Status indicator ───────────────────────────────────
  const statusDotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: track.isPlaying ? "#22c55e" : "#a3a3a3",
    ...(track.isPlaying && { animation: "pulse 2s ease-in-out infinite" }),
  }

  const statusText = track.isPlaying
    ? "Now playing"
    : track.playedAt
      ? `Last played ${formatLastPlayed(track.playedAt)}`
      : "Recently played"

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={styles.wrapper} role="region" aria-label="Spotify listening activity">
      {/* Pulse keyframes — injected once */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Album Art */}
          <img
            src={track.albumArt}
            alt={`${track.name} album art`}
            width={56}
            height={56}
            style={styles.albumArt}
          />

          {/* Track Info */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.trackName}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline" }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none" }}
            >
              {track.name}
            </a>
            <p style={styles.artist}>{track.artist}</p>
          </div>
        </div>

        {/* Status */}
        <div style={styles.statusRow} role="status" aria-live="polite">
          <span style={statusDotStyle} aria-hidden="true" />
          <span style={styles.statusText}>{statusText}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    width: "100%",
    maxWidth: 384,
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #e5e5e5",
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 6,
    objectFit: "cover" as const,
    flexShrink: 0,
    background: "#f1f5f9",
  },
  trackName: {
    display: "block",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: "20px",
    color: "#171717",
    textDecoration: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  artist: {
    fontSize: 14,
    lineHeight: "20px",
    color: "#737373",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  statusText: {
    fontSize: 13,
    color: "#a3a3a3",
  },
  artPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 6,
    background: "#e5e7eb",
    flexShrink: 0,
  },
  textPlaceholder: {
    height: 14,
    borderRadius: 4,
    background: "#e5e7eb",
  },
}
