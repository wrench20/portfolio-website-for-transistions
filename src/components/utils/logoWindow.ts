/**
 * Geometry for the monogram "window" — the GTA VI move where the logo is a hole in a
 * wall and the camera either dives through it (the loader) or pulls back out of it
 * (the bookend at the end of the page).
 *
 * Everything here is in two spaces:
 *  - logo units: the monogram's own path coordinates (see LOGO_PATH_N / LOGO_PATH_J)
 *  - screen px:  the SVG the wall is drawn in, which has no viewBox, so 1 unit = 1 CSS px
 *
 * A transform is just a uniform scale plus a translation, `screen = t + s * logo`.
 */

import { LOGO_PATH_N, LOGO_PATH_J } from "../Logo";

/** Bounds of the two monogram paths, in logo units. */
export const LOGO_BOUNDS = { minX: -10, minY: -1, width: 27.216, height: 19.195 };

const CENTER = {
  x: LOGO_BOUNDS.minX + LOGO_BOUNDS.width / 2,
  y: LOGO_BOUNDS.minY + LOGO_BOUNDS.height / 2,
};

/**
 * Where the camera dives in. This has to be *inside a stroke*, because the strokes are
 * the hole the site shows through: zoom about a point between the letters and the wall
 * fills the screen instead of the window. Solved numerically for the largest circle that
 * fits inside the monogram — it is the junction where the two diagonals of the second
 * letter meet, radius 2.33 units. RADIUS is shaded below that for antialiasing slack.
 */
const DIVE = { x: 8.82, y: 13.34 };
const RADIUS = 2.15;

export type WindowTransform = { s: number; tx: number; ty: number };

export function toMatrix({ s, tx, ty }: WindowTransform) {
  return `matrix(${s} 0 0 ${s} ${tx} ${ty})`;
}

/** The logo at scale `s` with its visual centre at (cx, cy). */
function centredAt(s: number, cx: number, cy: number): WindowTransform {
  return { s, tx: cx - s * CENTER.x, ty: cy - s * CENTER.y };
}

/** The resting "hero" size — big enough to read as a window, with room for a prompt. */
export function heroTransform(w: number, h: number, centreY = 0.44): WindowTransform {
  const s = Math.min(
    (h * 0.42) / LOGO_BOUNDS.height,
    (w * 0.78) / LOGO_BOUNDS.width
  );
  return centredAt(s, w / 2, h * centreY);
}

/** Matches an <svg viewBox="-10 -1 27.22 …"> that the browser laid out at `rect`. */
export function transformFromRect(rect: DOMRect): WindowTransform {
  const s = rect.width / 27.22;
  return { s, tx: rect.left - s * LOGO_BOUNDS.minX, ty: rect.top - s * LOGO_BOUNDS.minY };
}

/**
 * The scale at which the window swallows the whole screen: the circle around DIVE,
 * centred on the screen, has to reach the corners.
 */
function coverScale(w: number, h: number) {
  return (Math.hypot(w, h) / 2 / RADIUS) * 1.04;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * p = 0 is the hero window, p = 1 the window filling the screen.
 *
 * Scale is interpolated exponentially, not linearly. Zoom is perceived as a ratio, so a
 * linear ramp from 20x to 600x spends almost all of its visible change in the first few
 * percent and then crawls; the exponential gives the constant "flying in" rate.
 *
 * The dive point drifts from where it sits in the hero layout to the centre of the
 * screen, so the final frame fills evenly instead of from one corner.
 */
export function diveTransform(
  p: number,
  w: number,
  h: number,
  centreY?: number
): WindowTransform {
  const hero = heroTransform(w, h, centreY);
  const s1 = coverScale(w, h);
  const s = hero.s * Math.pow(s1 / hero.s, p);

  const startX = hero.tx + hero.s * DIVE.x;
  const startY = hero.ty + hero.s * DIVE.y;
  const k = smoothstep(Math.min(1, Math.max(0, p)));
  const qx = startX + (w / 2 - startX) * k;
  const qy = startY + (h / 2 - startY) * k;

  return { s, tx: qx - s * DIVE.x, ty: qy - s * DIVE.y };
}

/** Straight interpolation between two transforms, scale again on a log curve. */
export function lerpTransform(a: WindowTransform, b: WindowTransform, t: number): WindowTransform {
  const s = a.s * Math.pow(b.s / a.s, t);
  // Interpolate the logo centre, then re-derive the translation from it, so the mark
  // travels in a straight line rather than swinging around its own origin.
  const ax = a.tx + a.s * CENTER.x;
  const ay = a.ty + a.s * CENTER.y;
  const bx = b.tx + b.s * CENTER.x;
  const by = b.ty + b.s * CENTER.y;
  return centredAt(s, ax + (bx - ax) * t, ay + (by - ay) * t);
}

// ---- Exact "has the wall left the screen?" test ----------------------------------

type Pt = [number, number];

/** The monogram paths are straight-edged polygons written as one absolute M…Z run. */
function polygon(d: string): Pt[] {
  const nums = d
    .replace(/^M/i, "")
    .replace(/Z$/i, "")
    .replace(/(\d)-/g, "$1 -")
    .trim()
    .split(/\s+/)
    .map(Number);
  const pts: Pt[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  // The paths close back onto their start explicitly; a zero-length last edge would
  // only add noise to the intersection test.
  const [a, b] = [pts[0], pts[pts.length - 1]];
  if (a[0] === b[0] && a[1] === b[1]) pts.pop();
  return pts;
}

const POLYGONS = [polygon(LOGO_PATH_N), polygon(LOGO_PATH_J)];

function inside([x, y]: Pt, poly: Pt[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Liang–Barsky: does any part of segment a-b lie inside the rectangle? */
function segmentTouchesRect(a: Pt, b: Pt, minX: number, minY: number, maxX: number, maxY: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  return (
    clip(-dx, a[0] - minX) &&
    clip(dx, maxX - a[0]) &&
    clip(-dy, a[1] - minY) &&
    clip(dy, maxY - a[1])
  );
}

/**
 * True once no part of the wall is on screen at dive progress p: the screen rectangle,
 * taken back into logo units, sits wholly inside one of the two letters — its centre is
 * inside the letter and none of the letter's edges cross it.
 *
 * This is what lets the loader hand scroll back the moment the wall is gone. Waiting for
 * p = 1 instead leaves a stretch where the page looks finished but cannot be scrolled,
 * because the strokes around the dive point are much wider than the circle that
 * coverScale() has to guarantee.
 */
export function wallOffscreen(p: number, w: number, h: number) {
  const { s, tx, ty } = diveTransform(p, w, h);
  const minX = -tx / s;
  const minY = -ty / s;
  const maxX = (w - tx) / s;
  const maxY = (h - ty) / s;
  const centre: Pt = [(minX + maxX) / 2, (minY + maxY) / 2];

  return POLYGONS.some(
    (poly) =>
      inside(centre, poly) &&
      poly.every((a, i) => !segmentTouchesRect(a, poly[(i + 1) % poly.length], minX, minY, maxX, maxY))
  );
}
