import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
}

interface SpotifyTrack {
  name: string;
  artists?: SpotifyArtist[];
  album?: {
    name?: string;
    images?: SpotifyImage[];
  };
  external_urls?: {
    spotify?: string;
  };
}

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN ?? "",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

function normalizeTrack(track: SpotifyTrack | null | undefined) {
  if (!track) return null;
  return {
    name: track.name,
    artists: (track.artists || []).map((a) => a.name).join(", "),
    album: track.album?.name ?? null,
    albumArt: track.album?.images?.[track.album.images.length - 1]?.url ?? track.album?.images?.[0]?.url ?? null,
    url: track.external_urls?.spotify ?? null,
  };
}

export async function GET() {
  const headers = { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" };

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json(
      { isPlaying: false, track: null, playedAt: null, configured: false },
      { headers }
    );
  }

  try {
    const accessToken = await getAccessToken();
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const nowPlayingRes = await fetch(NOW_PLAYING_URL, { headers: authHeaders });

    if (nowPlayingRes.status === 200) {
      const data = await nowPlayingRes.json();
      if (data && data.is_playing === true && data.item) {
        return NextResponse.json(
          {
            isPlaying: true,
            track: normalizeTrack(data.item),
            playedAt: null,
            configured: true,
          },
          { headers }
        );
      }
    } else if (nowPlayingRes.status !== 204) {
      console.error("Spotify currently-playing error:", nowPlayingRes.status);
    }

    // Nothing currently playing (paused, ad, or no active session) — fall back to last played.
    const recentRes = await fetch(RECENTLY_PLAYED_URL, { headers: authHeaders });
    if (!recentRes.ok) {
      throw new Error(`Recently-played failed: ${recentRes.status}`);
    }
    const recentData = await recentRes.json();
    const lastItem = recentData.items?.[0];

    if (!lastItem) {
      return NextResponse.json(
        { isPlaying: false, track: null, playedAt: null, configured: true },
        { headers }
      );
    }

    return NextResponse.json(
      {
        isPlaying: false,
        track: normalizeTrack(lastItem.track),
        playedAt: lastItem.played_at,
        configured: true,
      },
      { headers }
    );
  } catch (err) {
    console.error("now-playing error:", err);
    return NextResponse.json(
      {
        isPlaying: false,
        track: null,
        playedAt: null,
        configured: true,
        error: "spotify_unavailable",
      },
      { headers }
    );
  }
}
