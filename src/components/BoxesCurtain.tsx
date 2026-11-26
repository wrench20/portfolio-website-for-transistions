import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MQ, all } from "./utils/breakpoints";
import "./styles/BoxesCurtain.css";

gsap.registerPlugin(ScrollTrigger);

const MAX_BARS = 100;

/**
 * The act break between "where I've been" (Career) and "what I built" (Work).
 *
 * A curtain of thin horizontal slats covers the viewport and sweeps off to the right
 * on scrub, one after another. The slat container blends with `difference`, so the
 * headline underneath is knocked out dark wherever a slat still covers it and reads
 * light wherever the slats have gone — the copy never disappears, it flips polarity
 * line by line as the curtain passes over it. That is why the text itself is never
 * animated: the illusion is that the slats are uncovering something already there.
 *
 * The static, legible state is the CSS default and the curtain is opt-in via
 * `data-curtain="on"`, so if this effect never runs — mobile, reduced motion, a JS
 * failure — what is left is a plain readable section rather than a blank slab.
 */
const BoxesCurtain = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: all(MQ.desktop, MQ.motion),
        isTablet: all(MQ.tablet, MQ.motion),
        isPhone: all(MQ.phone, MQ.motion),
      },
      (context) => {
        const { isDesktop, isPhone } = context.conditions as {
          isDesktop: boolean;
          isPhone: boolean;
        };

        // The pitch lives in CSS (--bar-count) so a breakpoint can change the slat
        // density without touching this file; read it back rather than duplicating
        // the number here, and only animate the slats CSS is actually showing.
        const declared = parseInt(
          getComputedStyle(section).getPropertyValue("--bar-count"),
          10
        );
        const count = Number.isFinite(declared)
          ? Math.min(Math.max(declared, 1), MAX_BARS)
          : MAX_BARS;

        const bars = gsap.utils
          .toArray<HTMLElement>(".curtain-bar", section)
          .slice(0, count);
        if (bars.length === 0) return;

        section.dataset.curtain = "on";

        gsap.to(bars, {
          xPercent: 100,
          rotate: 2,
          ease: "none",
          force3D: true,
          stagger: { each: 0.5 / bars.length, from: "start" },
          scrollTrigger: isPhone
            ? {
                // No pin on a phone. Pinning takes over the scroll the reader is
                // actively dragging, which is the single thing that makes a site feel
                // broken on touch. Scrubbing the section's own travel through the
                // viewport instead costs nothing and still reads as a sweep — the
                // slats are absolutely positioned inside the section, so they keep
                // covering the copy and the polarity flip survives intact.
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                // `true`, not a number. A numeric scrub smooths the sweep over that
                // many seconds, which on desktop softens a wheel's discrete steps —
                // but a touch drag is already continuous, so the same smoothing just
                // reads as the curtain lagging behind the finger.
                scrub: true,
                id: "curtain",
                invalidateOnRefresh: true,
              }
            : {
                trigger: section,
                start: "top top",
                // Tablet gets a shorter sweep — the same choreography at half the
                // scroll cost, because there is less screen for it to pay off on.
                end: isDesktop ? "+=150%" : "+=100%",
                scrub: 1,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                id: "curtain",
                // Descending by document position: the curtain sits above Work, which
                // is priority 1. Note this switches ScrollTrigger's global sorting on
                // for every trigger on the page, not just these two.
                refreshPriority: 2,
                invalidateOnRefresh: true,
              },
        });

        return () => {
          delete section.dataset.curtain;
        };
      }
    );

    return () => mm.revert();
  }, []);

  // aria-label is "Section break", not "Selected work": the very next section is headed
  // "My Work", so a screen reader was announcing the same idea twice in a row.
  return (
    <section className="curtain-section" ref={sectionRef} aria-label="Section break">
      <div className="curtain-stage">
        <div className="curtain-copy">
          <p className="curtain-eyebrow ff-cursive">that&rsquo;s the story</p>
          <h2 className="curtain-headline">
            <span>Now the</span>
            <span>evidence.</span>
          </h2>
        </div>

        <div className="curtain-bars" aria-hidden="true">
          {Array.from({ length: MAX_BARS }, (_, i) => (
            <div
              key={i}
              className="curtain-bar"
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoxesCurtain;
