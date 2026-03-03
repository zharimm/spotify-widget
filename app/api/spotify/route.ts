import { NextResponse } from "next/server"

// TODO: Add these environment variables when you have your Spotify API credentials
// SPOTIFY_CLIENT_ID - from Spotify Developer Dashboard
// SPOTIFY_CLIENT_SECRET - from Spotify Developer Dashboard  
// SPOTIFY_REFRESH_TOKEN - obtained through OAuth flow (one-time setup)

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64")
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing"
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1"

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token || "",
    }),
  })

  return response.json()
}

async function getNowPlaying() {
  const { access_token } = await getAccessToken()

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}

async function getRecentlyPlayed() {
  const { access_token } = await getAccessToken()

  return fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}

// Mock data for development - remove when API is connected
const MOCK_DATA = {
  isPlaying: false,
  name: "WILDFLOWER",
  artist: "Billie Eilish",
  albumArt: "https://i.scdn.co/image/ab67616d0000b273aef0ee8e84a500b71bcf6b8e",
  spotifyUrl: "https://open.spotify.com/track/45zT4WLqNPvPqhNvfqZHnk",
  playedAt: "2026-01-30T19:03:00-05:00",
}

export async function GET() {
  // Check if Spotify credentials are configured
  const isConfigured = client_id && client_secret && refresh_token

  if (!isConfigured) {
    // Return mock data when API is not configured
    return NextResponse.json(MOCK_DATA)
  }

  try {
    // Try to get currently playing track
    const nowPlayingResponse = await getNowPlaying()

    if (nowPlayingResponse.status === 200) {
      const data = await nowPlayingResponse.json()

      if (data.is_playing && data.item) {
        return NextResponse.json({
          isPlaying: true,
          name: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          albumArt: data.item.album.images[0]?.url,
          spotifyUrl: data.item.external_urls.spotify,
          playedAt: null,
        })
      }
    }

    // If not playing, get recently played
    const recentlyPlayedResponse = await getRecentlyPlayed()

    if (recentlyPlayedResponse.status === 200) {
      const data = await recentlyPlayedResponse.json()
      const track = data.items[0]

      if (track) {
        return NextResponse.json({
          isPlaying: false,
          name: track.track.name,
          artist: track.track.artists.map((a: { name: string }) => a.name).join(", "),
          albumArt: track.track.album.images[0]?.url,
          spotifyUrl: track.track.external_urls.spotify,
          playedAt: track.played_at,
        })
      }
    }

    // Fallback to mock data if no tracks found
    return NextResponse.json(MOCK_DATA)
  } catch (error) {
    console.error("Spotify API error:", error)
    return NextResponse.json(MOCK_DATA)
  }
}
