// Framer Spotify Widget — Native Code Component
// Copy this entire file into Framer as a Code Component.
// It fetches live data from the Vercel API; no iFrame needed.

import * as React from "react"
const { useState, useEffect, useCallback } = React

// ─── Config ────────────────────────────────────────────────
const API_URL       = "https://v0-spotify-widget-gray.vercel.app/api/spotify"
const POLL_INTERVAL = 30_000 // 30 s
const CACHE_KEY     = "spotify-widget-track"

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
function readCache(): SpotifyTrack | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        return raw ? (JSON.parse(raw) as SpotifyTrack) : null
    } catch {
        return null
    }
}

function writeCache(track: SpotifyTrack) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(track)) } catch {}
}

function formatLastPlayed(dateString: string): string {
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "recently"
        const month = date.toLocaleString("en-US", { month: "short" })
        const day   = date.getDate()
        const time  = date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        return `${month} ${day} at ${time}`
    } catch {
        return "recently"
    }
}

// ─── Component ─────────────────────────────────────────────
export default function SpotifyWidget() {
    // Seed from cache so returning visitors see content instantly
    const [track, setTrack]             = useState<SpotifyTrack | null>(readCache)
    const [error, setError]             = useState(false)
    const [visible, setVisible]         = useState(() => readCache() !== null)
    const [linkHovered, setLinkHovered] = useState(false)

    const fetchTrack = useCallback(async () => {
        try {
            const res = await fetch(API_URL)
            if (!res.ok) { setError(true); return }
            const data: SpotifyTrack = await res.json()
            writeCache(data)
            setTrack(data)
            setError(false)
            // Fade in only on first load (when there was no cache)
            setVisible(true)
        } catch {
            setError(true)
        }
    }, [])

    useEffect(() => {
        fetchTrack()
        const id = setInterval(fetchTrack, POLL_INTERVAL)
        return () => clearInterval(id)
    }, [fetchTrack])

    // ── Error with no cached fallback ──────────────────────
    if (error && !track) return null

    // ── No data yet (first visit, fetch still in flight) ───
    if (!track) return null

    // ── Status ─────────────────────────────────────────────
    const statusDotStyle: React.CSSProperties = {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: track.isPlaying ? "#22c55e" : "#545B65",
        flexShrink: 0,
        ...(track.isPlaying && { animation: "pulse 2s ease-in-out infinite" }),
    }

    const statusText = track.isPlaying
        ? "Now playing"
        : track.playedAt
            ? `Last played ${formatLastPlayed(track.playedAt)}`
            : "Recently played"

    // ── Render ─────────────────────────────────────────────
    return (
        <div
            style={styles.wrapper}
            role="region"
            aria-label="Spotify listening activity"
        >
            <style>{`
                @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.4 } }
            `}</style>

            <div
                style={{
                    ...styles.outerShell,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 320ms ease, transform 320ms ease",
                }}
            >
                {/* Inner card */}
                <div style={styles.innerCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                        {/* Album Art */}
                        <img
                            src={track.albumArt || "https://via.placeholder.com/56x56/23202B/545B65?text=%E2%99%AA"}
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
                                aria-label={`${track.name} by ${track.artist} — open in Spotify`}
                                style={{
                                    ...styles.trackName,
                                    textDecoration:      linkHovered ? "underline" : "none",
                                    textDecorationColor: "rgba(242,241,245,0.4)",
                                }}
                                onMouseEnter={() => setLinkHovered(true)}
                                onMouseLeave={() => setLinkHovered(false)}
                            >
                                {track.name}
                            </a>
                            <p style={styles.artist}>{track.artist}</p>
                        </div>
                    </div>
                </div>

                {/* Status row */}
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
        width:      "100%",
        minWidth:   220,
        maxWidth:   384,
    },
    outerShell: {
        background:   "#0E0C14",
        borderRadius: 9,
        padding:      4,
        border:       "1px solid #1D1B24",
    },
    innerCard: {
        background:   "#1D1B24",
        borderRadius: 4,
        padding:      4,
        border:       "1px solid #23202B",
        boxShadow:    "0 1px 2px rgba(0,0,0,0.04)",
    },
    albumArt: {
        width:      56,
        height:     56,
        borderRadius: 2,
        objectFit:  "cover" as const,
        flexShrink: 0,
        background: "#23202B",
    },
    trackName: {
        display:       "block",
        fontWeight:    600,
        fontSize:      14,
        lineHeight:    "20px",
        color:         "#F2F1F5",
        overflow:      "hidden",
        textOverflow:  "ellipsis",
        whiteSpace:    "nowrap" as const,
        cursor:        "pointer",
    },
    artist: {
        fontSize:     14,
        lineHeight:   "20px",
        color:        "#8A8F98",
        margin:       0,
        overflow:     "hidden",
        textOverflow: "ellipsis",
        whiteSpace:   "nowrap" as const,
    },
    statusRow: {
        display:      "flex",
        alignItems:   "center",
        gap:          6,
        marginTop:    4,
        marginLeft:   4,
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
        color:    "#6E747D",
    },
}
