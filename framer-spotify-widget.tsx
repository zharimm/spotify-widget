'use client';

// Framer Spotify Widget - Copy this entire file into Framer as a Code Component

export default function SpotifyWidget() {
  // Mock data - replace with real Spotify API data later
  const track = {
    name: "WILDFLOWER",
    artist: "Billie Eilish",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273aef0ee8e84a500b71bcf6b8e",
    spotifyUrl: "https://open.spotify.com/track/45zT4WLqNPvPqhNvfqZHnk",
    lastPlayed: "Jan 30, 7:03 PM EST",
  }

  return (
    <div
      style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        width: "100%",
        maxWidth: 400,
        background: "#ffffff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* Album Art */}
        <img
          src={track.albumArt || "/placeholder.svg"}
          alt={`${track.name} album cover`}
          style={{
            width: 56,
            height: 56,
            borderRadius: 4,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        {/* Track Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: 14,
              color: "#171717",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none"
            }}
          >
            {track.name}
          </a>
          <p
            style={{
              fontSize: 14,
              color: "#737373",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {track.artist}
          </p>
        </div>
      </div>

      {/* Last Played */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#a3a3a3",
          }}
        />
        <span
          style={{
            fontSize: 13,
            color: "#a3a3a3",
          }}
        >
          Last played on {track.lastPlayed}
        </span>
      </div>
    </div>
  )
}
