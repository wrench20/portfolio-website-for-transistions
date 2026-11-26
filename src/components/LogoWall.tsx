import { forwardRef, useId } from "react";
import { LOGO_PATH_N, LOGO_PATH_J } from "./Logo";
import "./styles/LogoWall.css";

/**
 * A screen-filling wall with the monogram cut out of it. Whatever sits behind this
 * element shows through the letters.
 *
 * The cut-out is a real SVG <mask> rather than an even-odd path with a hole in it: the
 * hole scales by a factor of several hundred during the dive, and with a cut-out path
 * the wall's gradient would scale right along with it and smear into a flat colour. A
 * mask keeps the gradient pinned to the screen while only the hole moves.
 *
 * The SVG has no viewBox, so its user units are CSS pixels and the caller positions the
 * hole with a plain `matrix()` (see utils/logoWindow.ts). The forwarded ref is that hole
 * group; `veilRef` is an optional flat layer over the gradient, used to fade the wall in;
 * `fillRef` is an optional solid copy of the logo drawn on top of the hole — GTA's
 * "overlay logo", the moment the window becomes a mark. Give it the hole's transform.
 */
type Props = {
  className?: string;
  veilRef?: React.Ref<SVGRectElement>;
  fillRef?: React.Ref<SVGGElement>;
};

const LogoWall = forwardRef<SVGGElement, Props>(function LogoWall(
  { className, veilRef, fillRef },
  holeRef
) {
  // Two walls can be mounted at once (loader + bookend), and mask/gradient ids are
  // document-global, so they must not collide.
  const id = useId().replace(/:/g, "");
  const maskId = `logo-hole-${id}`;
  const gradId = `logo-wall-grad-${id}`;
  const glowId = `logo-wall-glow-${id}`;
  const fillId = `logo-fill-${id}`;

  return (
    <svg className={`logo-wall ${className ?? ""}`} aria-hidden="true">
      <defs>
        {/* The wall is the opposite material to the page (light wall on the dark theme,
            dark wall on the light one), so the site seen through the monogram always
            contrasts with it. Colours come from --wall-* in index.css. */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--wall-a)" }} />
          <stop offset="55%" style={{ stopColor: "var(--wall-b)" }} />
          <stop offset="100%" style={{ stopColor: "var(--wall-c)" }} />
        </linearGradient>
        {/* A low glow rising from the bottom edge — --wall-glow, per theme. */}
        <radialGradient id={glowId} cx="50%" cy="100%" r="70%">
          <stop offset="0%" style={{ stopColor: "var(--wall-glow)" }} />
          <stop offset="100%" style={{ stopColor: "transparent" }} />
        </radialGradient>

        {/* The solid logo at the end of the page: the wall's ink, sheened towards the accent. */}
        <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--wall-fill-a)" }} />
          <stop offset="100%" style={{ stopColor: "var(--wall-fill-b)" }} />
        </linearGradient>

        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="#fff" />
          <g ref={holeRef}>
            <path d={LOGO_PATH_N} fill="#000" />
            <path d={LOGO_PATH_J} fill="#000" />
          </g>
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <rect width="100%" height="100%" fill={`url(#${gradId})`} />
        <rect width="100%" height="100%" fill={`url(#${glowId})`} />
        {veilRef && (
          <rect ref={veilRef} width="100%" height="100%" style={{ fill: "var(--backgroundColor)" }} />
        )}
      </g>

      {fillRef && (
        <g ref={fillRef} opacity="0">
          <path d={LOGO_PATH_N} fill={`url(#${fillId})`} />
          <path d={LOGO_PATH_J} fill={`url(#${fillId})`} />
        </g>
      )}
    </svg>
  );
});

export default LogoWall;
