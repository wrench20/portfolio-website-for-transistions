import { useEffect, useRef, useState } from "react";
import { FaSpotify } from "react-icons/fa6";
import "./styles/NowPlayingWidget.css";

interface Track {
  name: string;
  artists: string;
  album: string | null;
  albumArt: string | null;
  url: string | null;
}

interface NowPlayingData {
  isPlaying: boolean;
  track: Track | null;
  playedAt: string | null;
  configured: boolean;
}

const POLL_INTERVAL = 30000;

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const NowPlayingWidget = () => {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchNowPlaying = async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/now-playing", { signal: controller.signal });
        if (!res.ok) return;
        const json = (await res.json()) as NowPlayingData;
        if (!cancelled) setData(json);
      } catch {
        // network hiccup or aborted — keep showing the last known state
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, []);

  const track = data?.track ?? null;
  const isPlaying = Boolean(data?.isPlaying && track);
  const hasFallback = Boolean(!isPlaying && track);

  let content: React.ReactNode;

  if (data === null) {
    content = (
      <>
        <div className="now-playing-icon now-playing-icon-loading">
          <FaSpotify />
        </div>
        <div className="now-playing-text">
          <span className="now-playing-skeleton" />
          <span className="now-playing-skeleton now-playing-skeleton-short" />
        </div>
      </>
    );
  } else if (isPlaying && track) {
    content = (
      <>
        {track.albumArt ? (
          <img className="now-playing-art" src={track.albumArt} alt="" />
        ) : (
          <div className="now-playing-icon">
            <FaSpotify />
          </div>
        )}
        <div className="now-playing-text">
          <span className="now-playing-status">
            <span className="now-playing-eq">
              <i />
              <i />
              <i />
            </span>
            Now playing
          </span>
          <span className="now-playing-title">{track.name}</span>
          <span className="now-playing-artist">{track.artists}</span>
        </div>
      </>
    );
  } else if (hasFallback && track) {
    content = (
      <>
        {track.albumArt ? (
          <img className="now-playing-art now-playing-art-muted" src={track.albumArt} alt="" />
        ) : (
          <div className="now-playing-icon">
            <FaSpotify />
          </div>
        )}
        <div className="now-playing-text">
          <span className="now-playing-status">
            Last played{data?.playedAt ? ` · ${relativeTime(data.playedAt)}` : ""}
          </span>
          <span className="now-playing-title">{track.name}</span>
          <span className="now-playing-artist">{track.artists}</span>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className="now-playing-icon">
          <FaSpotify />
        </div>
        <div className="now-playing-text">
          <span className="now-playing-status">Not listening right now</span>
        </div>
      </>
    );
  }

  const isClickable = Boolean(track?.url);

  return (
    <a
      className="now-playing-widget"
      href={track?.url ?? undefined}
      target={isClickable ? "_blank" : undefined}
      rel={isClickable ? "noopener noreferrer" : undefined}
      data-cursor="disable"
      aria-label="Spotify now playing"
      onClick={(e) => {
        if (!isClickable) e.preventDefault();
      }}
    >
      {content}
    </a>
  );
};

export default NowPlayingWidget;
