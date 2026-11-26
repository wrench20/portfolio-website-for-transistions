/**
 * The motion breakpoints, in one place.
 *
 * Every `gsap.matchMedia()` gate on the site reads from here. Before this existed the
 * same conceptual boundary was written four different ways — 768, 769, 900 and 1024 —
 * so a 780px tablet got the boxes curtain but not the text reveals, and at exactly
 * 768px the curtain pinned while `index.css` was already applying its phone overrides.
 *
 * These cover *motion* only. The 900 / 1400 / 1600px queries scattered through the
 * stylesheets are typographic layout breakpoints and are deliberately left alone.
 */
export const MQ = {
  phone: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",

  /** Everything at tablet width and up. */
  tabletUp: "(min-width: 768px)",
  /** Everything at tablet width and down. */
  tabletDown: "(max-width: 1023px)",

  /** AND this into any gate whose effect should not run for reduced-motion users. */
  motion: "(prefers-reduced-motion: no-preference)",
} as const;

/** `and`-joins queries: `all(MQ.phone, MQ.motion)`. */
export function all(...queries: string[]) {
  return queries.join(" and ");
}
