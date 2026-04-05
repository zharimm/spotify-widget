// Framer Spotify Widget — Native Code Component
// Copy this entire file into Framer as a Code Component.
// It fetches live data from the Vercel API; no iFrame needed.

import * as React from "react"
const { useState, useEffect, useCallback } = React

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
                <div style={styles.outerShell}>
                    <div style={styles.innerCard}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    ...styles.artPlaceholder,
                                    animation: "pulse 2s ease-in-out infinite",
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        ...styles.textPlaceholder,
                                        width: "75%",
                                    }}
                                />
                                <div
                                    style={{
                                        ...styles.textPlaceholder,
                                        width: "50%",
                                        marginTop: 8,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Error / no data — show debug in preview, hide in prod ──
    if (error || !track) {
        return (
            <div style={styles.wrapper}>
                <div
                    style={{
                        ...styles.outerShell,
                        color: "#94a3b8",
                        fontSize: 13,
                        textAlign: "center" as const,
                        padding: 14,
                    }}
                >
                    {error
                        ? "Could not load Spotify data — check API / CORS"
                        : "No track data"}
                </div>
            </div>
        )
    }

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
        <div
            style={styles.wrapper}
            role="region"
            aria-label="Spotify listening activity"
        >
            {/* Pulse keyframes — injected once */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

            <div style={styles.outerShell}>
                {/* Inner white card */}
                <div style={styles.innerCard}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration =
                                        "underline"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration =
                                        "none"
                                }}
                            >
                                {track.name}
                            </a>
                            <p style={styles.artist}>{track.artist}</p>
                        </div>
                    </div>
                </div>

                {/* Status — sits in the gray area */}
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
    outerShell: {
        background: "#e2e8f0",
        borderRadius: 10,
        padding: 4,
    },
    innerCard: {
        background: "#ffffff",
        borderRadius: 4,
        padding: 4,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    },
    albumArt: {
        width: 56,
        height: 56,
        borderRadius: 2,
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
        marginTop: 4,
        marginLeft: 4,
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
        color: "#64748b",
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
