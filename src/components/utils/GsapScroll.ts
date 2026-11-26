import gsap from "gsap";

export function setSectionTimelines() {
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      // GTA VI's weight: the scene trails the wheel by a couple of seconds instead of
      // being bolted to it.
      scrub: 2,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      // GTA VI's weight: the scene trails the wheel by a couple of seconds instead of
      // being bolted to it.
      scrub: 2,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      // GTA VI's weight: the scene trails the wheel by a couple of seconds instead of
      // being bolted to it.
      scrub: 2,
      invalidateOnRefresh: true,
    },
  });

  // The What-I-Do panels. This reveal used to be a `.what-box-in` display flip buried on
  // tl2 at `delay: 6` of a 7-unit timeline keyed to the *About* section — so the panels
  // sat at `display: none` until About had scrolled 86% of the way past, which is why they
  // appeared broken. On its own trigger keyed to WhatIDo arriving, they are present and
  // interactive the moment you reach them, and the flicker/bracket/border entry animations
  // (which only start once the element is first displayed) finally play in view.
  // A class, not a `display` flip. Toggling display would restart the CSS entry
  // animations for free, but it also means the panels are absent from layout until the
  // trigger fires and the column jumps when they appear. The class carries the animations
  // instead: the panels stay in flow and readable at all times, and only the decorative
  // frame waits to be drawn.
  const tlWhatBox = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top 70%",
      once: true,
      onEnter: () =>
        document.querySelector(".what-box-in")?.classList.add("what-in"),
      invalidateOnRefresh: true,
    },
  });

  if (window.innerWidth > 1024) {
    tl1
      .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
      .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
      // The name parts drift apart and the fan lifts as the hero leaves, so it opens up
      // on the way out instead of sliding off as one flat plate. These move the *outer*
      // name masks and the fan wrapper; the entrance animated the inner spans and card
      // layers, so the two never share a transform.
      .to(".hero-name-first", { x: "-8vw", duration: 0.6 }, 0)
      .to(".hero-name-last", { x: "8vw", duration: 0.6 }, 0)
      .to(".hero-fan", { y: "-18%", scale: 0.92, duration: 0.6 }, 0);
    // No `.about-me` offset any more. It started About 50% above its resting place to
    // choreograph with the pinned About photo; with the photo gone it only pushed the copy
    // up into the hero's cards. About arrives through the shared handoff and light sweep.

    // Parallax travel is deliberately small now. At the old amplitudes each section slid
    // far enough down to land on top of the next one — measured at full travel: About
    // over WhatIDo by 135px, WhatIDo over Services by 135px, Career over the curtain by
    // 239px. Nothing has an opaque background, so that read as text colliding with text.
    // Each of these is now paired with matching bottom clearance in its stylesheet.
    tl2
      // No opacity here any more — the About fade-out is the GTA handoff in
      // utils/handoff.ts, which every section shares. Two tweens on one section's
      // opacity would multiply and fight on the way back up.
      .to(".about-section", { y: "12%", duration: 6 }, 0);

    tl3.fromTo(".whatIDO", { y: 0 }, { y: "6%", duration: 2 }, 0);
  } else {
    // Phone and tablet used to get *only* the display toggle below, which is why the
    // first three sections had no scroll transition at all on a narrow screen. This is the
    // same beat as desktop, rebuilt from what a narrow layout actually has.
    //
    // (This works at all only because the four `transform: none !important` rules in
    // Landing.css's mobile block are gone; !important outranks GSAP's inline style.)
    tl1
      .to(".landing-container", { opacity: 0, duration: 0.5 }, 0)
      .to(".landing-container", { y: "12%", duration: 1 }, 0)
      // Moves against the container it sits in, so the photos lag the text slightly
      // rather than the whole block sliding as one flat plane.
      .fromTo(".hero-fan", { y: "0%" }, { y: "-14%", duration: 1, ease: "none" }, 0);

    // Deliberately nothing on tl2/tl3: their desktop counterparts fade .about-section
    // to opacity 0 and shift .whatIDO, which on a single-column layout risks leaving
    // real content invisible if a trigger mismeasures. Not worth it for the gain.
    //
    // The What-I-Do panel reveal is no longer duplicated here — tlWhatBox above now
    // serves both branches, so there is one code path instead of two that could drift.
  }

  return [tl1, tl2, tl3, tlWhatBox];
}

export function setAllTimeline() {
  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 50%",
      end: "bottom 30%",
      scrub: 2,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "0%" },
      { maxHeight: "100%", duration: 1, ease: "none" },
      0
    )

    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
      0
    )
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "6%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    // Was `y: 0 -> y: 0` — a literal no-op that read as if mobile had been considered.
    // A smaller drift than desktop's 20%, which is too much travel on a tall column.
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "4%", duration: 0.5, delay: 0.2 },
      0
    );
  }

  return careerTimeline;
}
