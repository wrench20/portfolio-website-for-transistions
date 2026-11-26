import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLoading } from "../context/LoadingProvider";
import { LOGO_PATH_N, LOGO_PATH_J } from "./Logo";
import LogoWall from "./LogoWall";
import { MQ } from "./utils/breakpoints";
import {
  diveTransform,
  heroTransform,
  lerpTransform,
  toMatrix,
  transformFromRect,
  wallOffscreen,
} from "./utils/logoWindow";
import "./styles/Loader.css";

/*
 * The GTA VI entrance, in three acts:
 *
 *  1. loading — the monogram draws itself stroke by stroke while the page loads.
 *  2. opening — the drawn logo turns into a hole in a wall. The live site is already
 *     playing behind it (the name rises inside the letters), the wall lights up blue
 *     around it, and the window grows to hero size.
 *  3. diving  — the visitor's own scroll drives the camera *into* the logo until the
 *     window swallows the screen, at which point the wall is simply gone and they are
 *     standing on the landing page with scroll handed back to them.
 *
 * The dive runs on a virtual scroll (wheel / touch / keys feeding a progress value)
 * rather than a pinned ScrollTrigger section. A pin would put a screen-and-a-half of
 * extra document above the landing and shift every trigger on the page, and it would
 * make the intro replay whenever someone scrolls back to the top. This is an entrance,
 * so it happens once, and the rest of the scroll architecture never knows it existed.
 */

type Phase = "loading" | "opening" | "ready";
type InitialFXModule = typeof import("./utils/initialFX");

/** Pale powder — the loader always draws on raven black. */
const INK_COLOR = "#dbe7f1";

/** How far the landing sits "behind" the wall before the dive, settling to 1 as you
 *  arrive — GTA's hero image does the same 1.25 -> 1 while the mask moves. */
const SITE_DEPTH = 0.1;

/** Seconds-based smoothing for the dive. Higher is snappier. ~3 gives the heavy,
 *  slightly-behind-your-hand feel of GTA's `scrub: 2.5` without making an entrance
 *  feel like it is ignoring you. */
const FOLLOW_RATE = 3.2;

/** Scroll distance for a full dive, as a multiple of the viewport height. */
const DIVE_DISTANCE = 1.8;

/** Slowest the dive will close on its target, in progress per second. */
const MIN_SPEED = 0.35;

/** Progress past which a dive heading for the end is snapped home regardless. */
const RELEASE_AT = 0.985;

/** Tebi's monogram, drawn in stroke-by-stroke then solidified — driven by an outer GSAP timeline. */
function AnimatedLogo({
  size = 84,
  wrapRef,
  pathRefs,
}: {
  size?: number;
  wrapRef: React.RefObject<SVGSVGElement | null>;
  pathRefs: React.RefObject<SVGPathElement[]>;
}) {
  const w = size;
  const h = size * (19.19 / 27.22);
  return (
    <svg
      ref={wrapRef}
      width={w}
      height={h}
      viewBox="-10 -1 27.22 19.19"
      style={{ display: "inline-block", overflow: "visible" }}
      aria-label="Tebi Njeik"
    >
      {[LOGO_PATH_N, LOGO_PATH_J].map((d, i) => (
        <path
          key={i}
          ref={(el) => {
            if (el) pathRefs.current[i] = el;
          }}
          d={d}
          fill="none"
          stroke={INK_COLOR}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}


const Loader = () => {
  const { setIsLoading } = useLoading();
  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLButtonElement>(null);
  const logoWrapRef = useRef<SVGSVGElement>(null);
  const logoPathsRef = useRef<SVGPathElement[]>([]);
  const holeRef = useRef<SVGGElement>(null);
  const veilRef = useRef<SVGRectElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  const initialFXModule = useRef<Promise<InitialFXModule> | null>(null);
  // Where the visitor's scrolling has asked the dive to go, 0..1. A ref, not effect-local,
  // because input is accepted while the window is still opening: a swipe made during
  // that second and a half is banked here and the dive starts from it the moment the
  // window is ready, instead of being dropped and leaving the visitor swiping at nothing.
  const diveTarget = useRef(0);
  // Same reason: the listeners are rebuilt when the window finishes opening, and a finger
  // can be mid-swipe across that moment. Reset to 0 it would read as a huge upward drag.
  const lastTouchY = useRef<number | null>(null);
  // Decided once. Flipping the OS setting mid-entrance is not worth a second code path.
  const reducedMotion = useRef(
    typeof window !== "undefined" && !window.matchMedia(MQ.motion).matches
  );
  const coarsePointer = useRef(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  const loadFX = () => (initialFXModule.current ??= import("./utils/initialFX"));

  useGSAP(
    () => {
      const paths = logoPathsRef.current;
      const logo = logoWrapRef.current;

      gsap.set(logo, { scale: 0.85, opacity: 0 });
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const breathe = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
      breathe.to(logo, { scale: 1.06, duration: 1.1, ease: "power1.inOut" });

      gsap
        .timeline()
        .to(logo, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" })
        .to(paths, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.18 }, "<")
        .to(paths, { fill: INK_COLOR, stroke: "transparent", duration: 0.35, ease: "power1.out" }, "-=0.15")
        .add(() => breathe.play());

      const minTime = new Promise<void>((r) => setTimeout(r, 1400));
      const pageReady = new Promise<void>((r) => {
        if (document.readyState === "complete") r();
        else window.addEventListener("load", () => r(), { once: true });
      });

      Promise.all([minTime, pageReady, loadFX()]).then(([, , fx]) => {
        breathe.kill();

        if (reducedMotion.current) {
          // No window, no dive: the logo settles, the prompt appears, and one input takes
          // you in (see the input effect below).
          gsap.to(logo, { scale: 1, duration: 0.2 });
          gsap.to(promptRef.current, { autoAlpha: 1, duration: 0.2 });
          setPhase("ready");
          return;
        }

        setPhase("opening");
        gsap.set(logo, { scale: 1 });

        // No progress bar to clear any more (removed by request) — straight into act 2.
        openWindow(fx);
      });

      /** Act 2 — the logo becomes a hole in the wall. */
      function openWindow(fx: InitialFXModule) {
        const outer = outerRef.current;
        const hole = holeRef.current;
        const veil = veilRef.current;
        if (!outer || !hole || !veil || !logo) return;

        // Line the hole up exactly under the drawn logo before anything moves, so the
        // swap from "ink logo" to "window" is invisible: at this instant the hole is
        // covered by the ink and the wall is covered by the veil, which is the same
        // colour the overlay was.
        const small = transformFromRect(logo.getBoundingClientRect());
        hole.setAttribute("transform", toMatrix(small));
        outer.classList.add("is-window");

        // The site starts arriving behind the wall now, so the visitor watches the name
        // rise inside the letters. Scroll stays locked until the dive is done.
        fx.revealSite();
        gsap.set(".landing-section", { scale: 1 + SITE_DEPTH, transformOrigin: "50% 50%" });

        const grow = { k: 0 };
        gsap
          .timeline({ onComplete: () => setPhase("ready") })
          // Ink lifts off, exposing the window it was covering...
          .to(logo, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, 0)
          // ...and the lights come up on the wall around it.
          .to(veil, { opacity: 0, duration: 1.2, ease: "power2.inOut" }, 0.15)
          .to(
            grow,
            {
              k: 1,
              duration: 1.6,
              ease: "expo.inOut",
              onUpdate: () => {
                const hero = heroTransform(window.innerWidth, window.innerHeight);
                hole.setAttribute("transform", toMatrix(lerpTransform(small, hero, grow.k)));
              },
            },
            0.15
          )
          .fromTo(
            promptRef.current,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
            1.35
          );
      }
    },
    { scope: outerRef }
  );

  // Act 3 — the dive. Input is taken from the moment the window starts opening, but the
  // camera only starts moving once it has finished (`live`).
  useEffect(() => {
    if (phase === "loading") return;
    const live = phase === "ready";

    const outer = outerRef.current;
    const hole = holeRef.current;
    let current = 0;
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      removeAll();

      loadFX().then((fx) => {
        gsap.set(".landing-section", { clearProps: "scale,transformOrigin" });
        fx.revealSite(); // guarded — it has already run by every route that gets here
        fx.unlockScroll();
        setIsLoading(false);
      });
    }

    /** Reduced motion: any intent to enter just dissolves the overlay. */
    function enterQuietly() {
      if (finished) return;
      removeAll();
      loadFX().then((fx) => fx.revealSite());
      gsap.to(outer, { autoAlpha: 0, duration: 0.4, onComplete: finish });
    }

    function render(p: number) {
      if (!hole) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      hole.setAttribute("transform", toMatrix(diveTransform(p, w, h)));
      gsap.set(".landing-section", { scale: 1 + SITE_DEPTH * (1 - p) });
      gsap.set(promptRef.current, { autoAlpha: Math.max(0, 1 - p * 5) });
    }

    function tick(_time: number, deltaMs: number) {
      const dt = Math.min(deltaMs, 64) / 1000;
      const target = diveTarget.current;
      const gap = target - current;
      // Exponential follow for the weight, with a floor on the closing speed. A pure
      // exponential only ever *approaches* its target, so the last few percent of the
      // dive would trickle in for a second after the screen already looked finished —
      // a page that appears ready while scroll is still locked.
      const step = Math.max(Math.abs(gap) * (1 - Math.exp(-dt * FOLLOW_RATE)), dt * MIN_SPEED);
      current = Math.abs(gap) <= step ? target : current + Math.sign(gap) * step;
      // Hand over the moment no wall is left on screen, even if the visitor stopped
      // scrolling short of the end — there is nothing left to see, so holding scroll
      // would only feel broken. RELEASE_AT is the fallback for a full-strength dive.
      if (
        wallOffscreen(current, window.innerWidth, window.innerHeight) ||
        (target >= 1 && current > RELEASE_AT)
      ) {
        current = 1;
      }
      render(current);
      if (current >= 1) finish();
    }

    function push(delta: number) {
      if (finished) return;
      if (reducedMotion.current) {
        if (delta > 0) enterQuietly();
        return;
      }
      diveTarget.current = Math.min(
        1,
        Math.max(0, diveTarget.current + delta / (window.innerHeight * DIVE_DISTANCE))
      );
    }

    /** Tap, click or Enter: take the visitor all the way in for them. */
    function dive() {
      if (reducedMotion.current) enterQuietly();
      else diveTarget.current = 1;
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      // Line- and page-mode wheels (Firefox, some mice) report in rows, not pixels.
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      push(e.deltaY * unit);
    }
    function onTouchStart(e: TouchEvent) {
      lastTouchY.current = e.touches[0]?.clientY ?? null;
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const y = e.touches[0]?.clientY;
      if (y === undefined) return;
      if (lastTouchY.current !== null) push((lastTouchY.current - y) * 1.6);
      lastTouchY.current = y;
    }
    function onKey(e: KeyboardEvent) {
      const step = window.innerHeight * DIVE_DISTANCE * 0.2;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        push(step);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        push(-step);
      } else if (e.key === "Enter") {
        e.preventDefault();
        dive();
      }
    }

    function removeAll() {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      outer?.removeEventListener("click", dive);
      gsap.ticker.remove(tick);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    outer?.addEventListener("click", dive);
    if (live) {
      if (!reducedMotion.current) gsap.ticker.add(tick);
      promptRef.current?.focus({ preventScroll: true });
    }

    return removeAll;
  }, [phase, setIsLoading]);

  return (
    <div
      ref={outerRef}
      className="loader-overlay"
      data-phase={phase}
      style={{ cursor: phase === "ready" ? "pointer" : "default" }}
    >
      <LogoWall ref={holeRef} veilRef={veilRef} />

      <div ref={contentRef} className="loader-content">
        <AnimatedLogo size={96} wrapRef={logoWrapRef} pathRefs={logoPathsRef} />
      </div>

      <button
        ref={promptRef}
        type="button"
        className="loader-prompt"
        tabIndex={phase === "ready" ? 0 : -1}
      >
        <span className="loader-prompt-text">
          {coarsePointer.current ? "swipe up to enter" : "scroll to enter"}
        </span>
        <span className="loader-chevrons" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
    </div>
  );
};

export default Loader;
