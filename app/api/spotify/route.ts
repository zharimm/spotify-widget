import { NextResponse } from "next/server"

// ─── Config ────────────────────────────────────────────────
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1"

// Mock data for development — returned when API is not configured
const MOCK_DATA = {
  isPlaying: false,
  name: "WILDFLOWER",
  artist: "Billie Eilish",
  albumArt: "https://i.scdn.co/image/ab67616d0000b273aef0ee8e84a500b71bcf6b8e",
  spotifyUrl: "https://open.spotify.com/track/45zT4WLqNPvPqhNvfqZHnk",
  playedAt: new Date(Date.now() - 3600_000).toISOString(),
}

// ─── Helper: JSON response with CORS ───────────────────────
function corsJson(data: unknown, status = 200) {
  const res = NextResponse.json(data, { status })
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type")
  res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
  return res
}

// ─── Token refresh ─────────────────────────────────────────
async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "unknown")
    throw new Error(`Token refresh failed (${response.status}): ${errorBody}`)
  }

  const data = await response.json()

  if (!data.access_token) {
    throw new Error("Token refresh response missing access_token")
  }

  return data.access_token as string
}

// ─── Spotify fetchers ──────────────────────────────────────
async function fetchNowPlaying(accessToken: string) {
  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

async function fetchRecentlyPlayed(accessToken: string) {
  return fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// ─── CORS preflight ────────────────────────────────────────
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type")
  return res
}

// ─── Main handler ──────────────────────────────────────────
export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return corsJson(MOCK_DATA)
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken)

    // ── Try currently playing ────────────────────────────
    const nowRes = await fetchNowPlaying(accessToken)

    if (nowRes.status === 200) {
      const data = await nowRes.json()

      if (data.item) {
        // Return the track whether playing or paused — this is always
        // the most recent track in the user's player
        return corsJson({
          isPlaying: !!data.is_playing,
          name: data.item.name ?? "Unknown Track",
          artist: Array.isArray(data.item.artists)
            ? data.item.artists.map((a: { name: string }) => a.name).join(", ")
            : "Unknown Artist",
          albumArt: data.item.album?.images?.[0]?.url ?? "",
          spotifyUrl: data.item.external_urls?.spotify ?? "",
          playedAt: data.is_playing ? null : new Date().toISOString(),
        })
      }
    } else if (nowRes.status === 429) {
      console.warn("Spotify rate limited — returning mock data")
      return corsJson(MOCK_DATA, 429)
    }

    // ── Fallback: recently played (only if currently-playing returned nothing) ──
    const recentRes = await fetchRecentlyPlayed(accessToken)

    if (recentRes.status === 200) {
      const data = await recentRes.json()
      const track = data.items?.[0]

      if (track?.track) {
        return corsJson({
          isPlaying: false,
          name: track.track.name ?? "Unknown Track",
          artist: Array.isArray(track.track.artists)
            ? track.track.artists.map((a: { name: string }) => a.name).join(", ")
            : "Unknown Artist",
          albumArt: track.track.album?.images?.[0]?.url ?? "",
          spotifyUrl: track.track.external_urls?.spotify ?? "",
          playedAt: track.played_at ?? null,
        })
      }
    } else if (recentRes.status === 429) {
      console.warn("Spotify rate limited — returning mock data")
      return corsJson(MOCK_DATA, 429)
    }

    return corsJson(MOCK_DATA)
  } catch (error) {
    console.error("Spotify API error:", error)
    return corsJson(MOCK_DATA, 500)
  }
}
