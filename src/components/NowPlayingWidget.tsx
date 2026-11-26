import { MdArrowOutward } from "react-icons/md";
import { config } from "../config";
import "./styles/NowPlayingWidget.css";

/**
 * "Now spinning": the song on repeat, as a vinyl record turning beside its title.
 * The cover is printed on the record's centre label. There is no Spotify API
 * connection; the track comes from config.nowPlaying. To change the song, edit that
 * entry and swap /public/images/now-playing.webp for its cover.
 *
 * Record and text are two separately fixed elements, not one fixed box. The text blends
 * with the page (difference, like the header) and a blend only mixes with whatever is in
 * its own stacking context: inside one fixed wrapper it would blend with the wrapper's
 * empty box and do nothing. The wrapper is `display: contents`, so it takes no box of
 * its own but still gets :hover, which ties the two halves' hover states together.
 */
const NowPlayingWidget = () => {
  const { title, artists, cover, url } = config.nowPlaying;

  return (
    <div className="now-playing">
      <a
        className="np-record"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="disable"
        aria-label={`Now spinning: ${title} by ${artists}. Opens in Spotify.`}
      >
        <span className="np-disc" aria-hidden="true">
          <img className="np-label" src={cover} alt="" />
        </span>
      </a>
      {/* Same link for a bigger click target; out of the tab order and hidden from
          screen readers, since the record link above already says all of this. */}
      <a
        className="np-text"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="disable"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className="np-status">
          <MdArrowOutward className="np-arrow" />
          Now spinning
        </span>
        <span className="np-title">{title}</span>
        <span className="np-artist">{artists}</span>
      </a>
    </div>
  );
};

export default NowPlayingWidget;
