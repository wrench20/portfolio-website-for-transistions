// One-time local helper: exchanges a Spotify authorization to get a long-lived refresh token.
//
// Usage:
//   1. Create an app at https://developer.spotify.com/dashboard
//   2. Add "http://127.0.0.1:8888/callback" as a Redirect URI on that app
//   3. Create a local .env with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET
//   4. Run: node --env-file=.env scripts/get-spotify-refresh-token.mjs
//   5. Approve access in the browser tab that opens
//   6. Copy the printed refresh token into SPOTIFY_REFRESH_TOKEN (locally and in Vercel)

import http from "node:http";
import { randomBytes } from "node:crypto";
import { exec } from "node:child_process";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.\n" +
      "Set them in a local .env and run with: node --env-file=.env scripts/get-spotify-refresh-token.mjs"
  );
  process.exit(1);
}

const state = randomBytes(16).toString("hex");

const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
authorizeUrl.searchParams.set("client_id", CLIENT_ID);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authorizeUrl.searchParams.set("scope", SCOPES);
authorizeUrl.searchParams.set("state", state);

console.log("\nOpen this URL and approve access (I'll try to open it for you too):\n");
console.log(authorizeUrl.toString());
console.log("");

const openCommand =
  process.platform === "win32"
    ? `start "" "${authorizeUrl.toString()}"`
    : process.platform === "darwin"
    ? `open "${authorizeUrl.toString()}"`
    : `xdg-open "${authorizeUrl.toString()}"`;
exec(openCommand, () => {});

const timeout = setTimeout(() => {
  console.error("\nTimed out waiting for the Spotify redirect (5 min). Run the script again.");
  process.exit(1);
}, 5 * 60 * 1000);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end();
    return;
  }

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (error) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<p>Access denied: ${error}. You can close this tab.</p>`);
    console.error(`\nSpotify returned an error: ${error}`);
    clearTimeout(timeout);
    server.close();
    process.exit(1);
  }

  if (!code || returnedState !== state) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<p>Invalid callback. You can close this tab.</p>");
    return;
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`);
    }

    const tokenData = await tokenRes.json();

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<p>Done! You can close this tab and go back to the terminal.</p>");

    console.log("\nSuccess! Add these to your local .env and to your Vercel project's Environment Variables:\n");
    console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
    console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}`);
    console.log("");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end("<p>Something went wrong — check the terminal.</p>");
    console.error("\nToken exchange error:", err.message);
  } finally {
    clearTimeout(timeout);
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Waiting for the Spotify redirect on ${REDIRECT_URI} ...`);
});
