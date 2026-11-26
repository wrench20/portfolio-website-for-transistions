import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MQ } from "./breakpoints";

gsap.registerPlugin(ScrollTrigger);

/**
 * GTA VI's section handoff: nothing scrolls off the page with a hard edge. A section
 * dissolves as it leaves through the top of the screen and the next one rises out of
 * the dark as it arrives, so the page reads as one continuous shot rather than a stack
 * of panels. On Rockstar's site it is the `.to(previous, { opacity: 0 })` that runs
 * while each new section is pulled up underneath.
 *
 * Opacity only, on the section roots. Every root already carries a parallax `y`, and
 * GSAP keeps transform components separately, so this cannot fight those — but a second
 * tween on opacity could, which is why tl2's old About fade-out has been removed.
 *
 * One live function of the section's position rather than enter/exit tweens: a section
 * that is shorter than the two fade bands would otherwise have two scrubbed tweens on
 * the same property overlapping, and whichever was created last wins on the way back up.
 * Here it is just min(arriving, leaving), smoothed by quickTo for the heavy lag.
 *
 * The two set-pieces — the slat curtain and the pinned Work rail — are left out. They
 * have their own entrances and exits, and the sections either side of them dissolving
 * is what carries the GTA feel into and out of them.
 */
const SECTIONS = [
  ".about-section",
  ".whatIDO",
  ".services-section",
  ".career-section",
  ".skilltree-section",
  ".contact-section",
];

/** Fully lit once the top is 40% of the way up the screen... */
const ARRIVE_BAND = 0.4;
/** ...and fully dark once the bottom has climbed into the top 5%. The band is narrow and
 *  high so the last lines of a section are still at full strength while being read. */
const LEAVE_EDGE = 0.05;
const LEAVE_BAND = 0.4;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function setHandoffs() {
  const mm = gsap.matchMedia();

  mm.add(MQ.motion, () => {
    const triggers = SECTIONS.flatMap((selector) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return [];

      const fade = gsap.quickTo(el, "opacity", { duration: 0.9, ease: "power2.out" });

      const target = () => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const arriving = clamp01((vh - r.top) / (vh * ARRIVE_BAND));
        const leaving = clamp01((r.bottom - vh * LEAVE_EDGE) / (vh * LEAVE_BAND));
        return Math.min(arriving, leaving);
      };

      return [
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: () => fade(target()),
          // Snap on refresh instead of easing. At mount every section below the fold
          // has to start dark; easing there would show each one dimming as it arrives.
          onRefresh: () => gsap.set(el, { opacity: target() }),
        }),
      ];
    });

    return () => {
      triggers.forEach((t) => t.kill());
      // onRefresh's set runs outside this matchMedia context, so revert() cannot see it,
      // and a quickTo can still be mid-flight.
      const roots = SECTIONS.join(",");
      gsap.killTweensOf(roots, "opacity");
      gsap.set(roots, { clearProps: "opacity" });
    };
  });

  return () => mm.revert();
}
