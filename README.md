# Spotify Widget

Live now-playing widget for [milosss.com](https://milosss.com), built with Next.js and deployed on Vercel. Shows the current track or the last played song, updating every 30 seconds.

A separate Framer code component (`framer-spotify-widget.tsx`) fetches directly from the Vercel API — no iframe needed.

---

## How it works

- `/api/spotify` exchanges a refresh token for an access token, hits the Spotify Web API, and returns a normalised JSON response
- If nothing is playing, it falls back to recently played
- If the API is unavailable, it returns mock data so the widget never breaks
- The Framer component caches the last track in `localStorage` — returning visitors see content instantly while the fresh fetch runs silently in the background

---

## Setup

### 1. Spotify credentials

Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and add `http://localhost:3000/api/callback` as a redirect URI.

Get a refresh token:

```bash
# Step 1 — open this URL in your browser (replace CLIENT_ID)
https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/api/callback&scope=user-read-currently-playing%20user-read-recently-played

# Step 2 — after authorising, copy the code from /api/callback

# Step 3 — exchange the code for a refresh token
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u CLIENT_ID:CLIENT_SECRET \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=http://localhost:3000/api/callback"
```

### 2. Environment variables

```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

Add these to `.env.local` for local dev, and to your Vercel project settings for production.

### 3. Run locally

```bash
npm install
npm run dev
```

---

## Framer integration

1. In Framer, open the **Assets** panel → **Code** → **New code file**
2. Paste the contents of `framer-spotify-widget.tsx`
3. Update `API_URL` at the top to your deployed Vercel URL
4. Drop the component onto the canvas

The component handles its own data fetching, caching, and error states — no props required.

---

## Stack

- [Next.js](https://nextjs.org) — API routes + preview page
- [Vercel](https://vercel.com) — hosting
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) — now playing + recently played
- [SWR](https://swr.vercel.app) — polling on the Next.js preview page
- [Vercel Analytics](https://vercel.com/analytics) — page analytics
