import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MQ } from "./breakpoints";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll parallax for every Float3D on the page: each one drifts against the scroll at
 * its own `data-speed`, so objects at different depths separate as you move. Animates
 * the wrapper only — the <img> inside owns the idle bob (see Float3D.tsx).
 */
export function setFloats() {
  const mm = gsap.matchMedia();

  mm.add(MQ.motion, () => {
    gsap.utils.toArray<HTMLElement>(".float3d").forEach((el) => {
      const speed = parseFloat(el.dataset.speed ?? "0");
      if (!speed) return;
      gsap.fromTo(
        el,
        { yPercent: speed },
        {
          yPercent: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  });

  return () => mm.revert();
}
