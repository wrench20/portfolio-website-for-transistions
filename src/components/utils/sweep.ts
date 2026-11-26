import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MQ } from "./breakpoints";

gsap.registerPlugin(ScrollTrigger);

/**
 * GTA VI's "light sweep": copy is uncovered by a soft circular light that rises from
 * below it, rather than sliding or fading in. On Rockstar's site it is the
 * `radial-gradient(circle at 50% 100vh …)` -> `at 50% 0vh` mask on the entrance message.
 *
 * Opt in with a `data-sweep` attribute. The mask itself lives in index.css (`.gta-sweep`)
 * and reads three custom properties, so all GSAP animates here is numbers:
 *   --sweep-y     where the light's centre sits, as a % of the element's height
 *   --sweep-core  the radius of the fully lit core
 * The soft edge is a fixed width beyond the core.
 *
 * Scrubbed, with a heavy lag, like everything on that site: scroll back up and the light
 * sinks again. This replaces the SplitText line rises — the two would be competing for
 * the same moment on the same element.
 */
let tweens: gsap.core.Tween[] = [];

export function revertSweepReveals() {
  // Kill the trigger *and* its tween — killing only the trigger leaves the tween alive
  // and detached, which is the leak MainContainer's killTimelines exists to avoid.
  tweens.forEach((t) => {
    t.scrollTrigger?.kill(true);
    t.kill();
  });
  tweens = [];
  document.querySelectorAll<HTMLElement>(".gta-sweep").forEach((el) => {
    el.classList.remove("gta-sweep");
    gsap.set(el, { clearProps: "--sweep-y,--sweep-core" });
  });
}

export function setSweepReveals() {
  revertSweepReveals();

  // Reduced motion gets the copy as-is: no class, so no mask at all.
  if (!window.matchMedia(MQ.motion).matches) return;

  const phone = window.matchMedia(MQ.phone).matches;

  document.querySelectorAll<HTMLElement>("[data-sweep]").forEach((el) => {
    el.classList.add("gta-sweep");
    const tween = gsap.fromTo(
      el,
      // Centre well below the element and a core that ends before the edge even
      // starts: nothing is lit.
      { "--sweep-y": "150%", "--sweep-core": "-60%" },
      {
        // Centre at the top edge with a core wider than the element: everything is.
        "--sweep-y": "0%",
        "--sweep-core": "115%",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: phone ? "top 95%" : "top 92%",
          // Finished by the time the element's middle reaches just past centre, so a
          // tall paragraph is fully lit while it is still being read.
          end: phone ? "center 62%" : "center 52%",
          scrub: phone ? 1 : 1.6,
          invalidateOnRefresh: true,
        },
      }
    );
    tweens.push(tween);
  });
}
