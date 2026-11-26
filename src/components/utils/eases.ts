import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

/**
 * Easing curves ported verbatim from the Zajno "Cicada" reference.
 *
 * They are registered by name once, at module load, so any tween on the page can ask
 * for them as a string (`ease: "clip"`) the way the reference does. Registering the
 * same name twice is harmless — CustomEase replaces the entry — but the module-level
 * guard keeps it to a single pass regardless of how many components import this.
 */
let registered = false;

export function registerEases() {
  if (registered) return;
  registered = true;

  // Symmetric in-out. The reference uses it for clip-path wipes, where an eased start
  // *and* finish keeps the moving edge from arriving with a visible stop.
  CustomEase.create("clip", ".57,0,.43,1");

  // Nearly all of the distance in the first third, then a long settle. This is what
  // makes a drawn line feel thrown rather than dragged.
  CustomEase.create("treeDraw", "M0,0 C0.08,0.72 0.2,1 1,1");

  // Soft entrance for text and small elements — gentler in than `clip`, so a line of
  // copy does not appear to start at speed.
  CustomEase.create("softIn", ".17,.17,.46,1");

  // From the Osmo side-menu reference. A hard, decisive in-out: it leaves quickly and
  // arrives almost without overshoot, which is what stops a full-height panel from feeling
  // heavy. Applied per-timeline, never as a gsap.defaults — the reference sets it
  // globally, which here would quietly retune every other animation on the site.
  CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
}

registerEases();
