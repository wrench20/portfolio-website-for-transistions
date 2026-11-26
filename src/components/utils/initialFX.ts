import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenis } from "../Navbar";
import { MQ } from "./breakpoints";
import "./eases";

/*
 * The two halves of "the site arrives", split so the loader can run them apart.
 *
 * The logo-window loader shows the live site *through* the monogram before the visitor
 * has finished scrolling into it, so the hero has to start arriving (main fades in, the
 * headline rises) while scroll is still locked for the dive. Unlocking waits until the
 * window has swallowed the screen.
 */

let revealed = false;

/** Make the page visible and play the hero entrance. Safe to call more than once. */
export function revealSite() {
  if (revealed) return;
  revealed = true;

  document.getElementsByTagName("main")[0].classList.add("main-active");
  document.documentElement.classList.add("is-revealed");
  gsap.to("body", {
    // Read the token rather than repeating the hex, so this can't drift out of
    // sync with --backgroundColor again.
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue("--backgroundColor")
      .trim(),
    duration: 0.5,
    delay: 1,
    // Then hand it back to the variable. Left as the literal it tweened to, the body
    // would keep this theme's colour after a switch to the other one.
    onComplete: () => {
      document.body.style.backgroundColor = "var(--backgroundColor)";
    },
  });
  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    { opacity: 1, duration: 1.2, ease: "power1.inOut", delay: 0.1 }
  );

  // Everything in the hero is visible by default in CSS, so reduced motion — and a
  // failed script — simply get the finished layout.
  if (!window.matchMedia(MQ.motion).matches) return;

  // Every `from` below writes its start state immediately, in this same tick, which is
  // the same tick the loader opens its window onto the hero — so nothing flashes.
  gsap
    .timeline({ defaults: { ease: "main" }, delay: 0.2 })
    // The headline rises line by line out of its own masks.
    .from(".hero-role-line > span", { yPercent: 110, duration: 1.15, stagger: 0.09 }, 0)
    // The photos are dealt from below the frame: each card starts upright (its inner
    // layer cancels the outer card's resting tilt) and swings into the fan as it lands.
    .from(
      ".hero-card-inner",
      {
        yPercent: 135,
        rotation: (_i: number, el: HTMLElement) =>
          -parseFloat(getComputedStyle(el.parentElement!).getPropertyValue("--r")) || 0,
        duration: 1.25,
        stagger: 0.11,
      },
      0.3
    )
    .from(
      ".hero-sub > *",
      { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.08, ease: "power2.out" },
      0.6
    )
    // The 3D objects swell into place around the headline. The wrapper, not the <img>:
    // the image owns its idle bob, and scroll parallax shares the wrapper on yPercent.
    .from(
      ".landing-container .float3d",
      { autoAlpha: 0, scale: 0.55, duration: 1.4, stagger: 0.15, ease: "expo.out" },
      0.45
    )
    // The name slides in from either side, each half out from behind its own edge.
    .from(".hero-name-first > span", { xPercent: -105, duration: 1.1 }, 0.75)
    .from(".hero-name-last > span", { xPercent: 105, duration: 1.1 }, 0.85);
}

/** Hand scrolling to the visitor. */
export function unlockScroll() {
  document.body.style.overflowY = "auto";
  if (lenis) {
    lenis.start();
  }

  // Scrolling was locked (body overflow hidden) until now, so every trigger measured
  // itself against a non-scrollable page. Re-measure now that the real scroll height
  // exists.
  ScrollTrigger.refresh();
}
