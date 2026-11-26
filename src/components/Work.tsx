import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { config } from "../config";
import { MQ, all } from "./utils/breakpoints";
import "./utils/eases";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  useEffect(() => {
    // Measured lazily on every refresh. Previously this was captured once at
    // mount and interpolated into `end: "+=1234"` — a literal string that
    // re-parses to the same number forever, so invalidateOnRefresh could never
    // actually re-evaluate it and the pin length went stale on resize.
    function getTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (box.length === 0) return 0;
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      const padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      return rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    // matchMedia rather than a one-off `innerWidth` check: the old guard only ran at
    // mount, so crossing the breakpoint later left the pin in place — on a narrow
    // viewport that means a section stuck at `position: fixed`, which the mobile
    // escape hatches in index.css target different selectors and cannot override.
    // It also tears the pin down properly on unmount, spacer and inline styles and
    // all, which a bare timeline.kill() does not.
    const mm = gsap.matchMedia();

    mm.add(MQ.tabletUp, () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".work-section",
          start: "top top",
          end: () => "+=" + getTranslateX(),
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          id: "work",
          // Below the curtain's 2 — descending by document position, so the pin
          // above this one re-measures first on every refresh.
          refreshPriority: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(".work-flex", {
        x: () => -getTranslateX(),
        ease: "none",
      });

      // GTA VI's depth, carried inside the rail: each project image drifts against its
      // caption as the card crosses the screen, the way their image stacks move at a
      // different speed from the copy beside them. containerAnimation maps the card's
      // horizontal journey (driven by the timeline above) onto this vertical drift.
      if (window.matchMedia(MQ.motion).matches) {
        gsap.utils.toArray<HTMLElement>(".work-image").forEach((image) => {
          gsap.fromTo(
            image,
            { y: 36 },
            {
              y: -36,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest(".work-box") ?? image,
                containerAnimation: timeline,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      }
    });

    // The pin stays desktop/tablet-only — pinned horizontal scroll fights native touch
    // scrolling, and the stacked mobile layout is the right call. But stacked is not the
    // same as static: each card gets its own entrance as it arrives.
    mm.add(all(MQ.phone, MQ.motion), () => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-box");
      const tweens = cards.map((card) =>
        gsap.from(card, {
          autoAlpha: 0,
          y: 40,
          duration: 0.6,
          ease: "softIn",
          scrollTrigger: { trigger: card, start: "top 88%" },
        })
      );
      return () => tweens.forEach((t) => t.scrollTrigger?.kill());
    });

    return () => mm.revert();
  }, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2 data-sweep>
          My <span>Work</span>
        </h2>
        {/* Every project, not a capped slice: the "see all" card that used to justify
            the cap is gone, so a cap here would just hide work with no way to reach it. */}
        <div className="work-flex">
          {config.projects.map((project) => (
            <div className="work-box" key={project.id}>
              <div className="work-info">
                <div className="work-title">
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <p className="work-desc">{project.description}</p>
                <h4>Tools and features</h4>
                <p>{project.technologies}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} link={project.link} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
