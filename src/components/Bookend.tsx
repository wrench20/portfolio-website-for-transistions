import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdArrowOutward } from "react-icons/md";
import LogoWall from "./LogoWall";
import { config } from "../config";
import { MQ } from "./utils/breakpoints";
import { diveTransform, toMatrix } from "./utils/logoWindow";
import "./styles/Bookend.css";

gsap.registerPlugin(ScrollTrigger);

/** Where the finished logo sits, as a fraction of the stage height — higher than the
 *  loader's, to leave room for the closing line underneath. */
const HERO_Y = 0.36;

/**
 * The page ends the way it began, run backwards — GTA VI's hero and outro.
 *
 * The section arrives as the logo window at full zoom: the wall is entirely off-screen and
 * the "window" shows only the page's own background, so it reads as the Contact section
 * simply continuing. The pull-back starts the moment the section's top enters the screen
 * — while Contact is still in view — so there is no dead frame between the two: the wall
 * closes in around the monogram, the window fills in solid, and the closing line is
 * uncovered by the same rising light as every heading on the page.
 *
 * On tablet and desktop the section then pins for a little over a screen so the pull-back
 * can finish.
 * Not pinned on a phone, where pinning takes the scroll away from the thumb that is
 * driving it: there the same timeline is scrubbed by the section rising into view, and
 * finishes exactly as it comes to rest at the bottom of the page.
 */
const Bookend = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const holeRef = useRef<SVGGElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const hole = holeRef.current;
    const fill = fillRef.current;
    const message = messageRef.current;
    if (!section || !hole || !fill || !message) return;

    /** z = 1 is the window filling the stage, z = 0 the finished logo. */
    const place = (z: number) => {
      const m = toMatrix(diveTransform(z, section.clientWidth, section.clientHeight, HERO_Y));
      hole.setAttribute("transform", m);
      fill.setAttribute("transform", m);
    };

    // Drop the header's backing gradient while this section is under the header.
    // This section is the last thing on the page, so only its start matters: hide the
    // gradient on the way in, bring it back on the way out above it. (An `end` was
    // measured before the pin below added its scroll, and fell short of the real end.)
    const setNavFade = (visible: boolean) =>
      gsap.to(".nav-fade", { autoAlpha: visible ? 1 : 0, duration: 0.4, overwrite: "auto" });
    const navFade = ScrollTrigger.create({
      trigger: section,
      start: "top 130px",
      onEnter: () => setNavFade(false),
      onLeaveBack: () => setNavFade(true),
    });

    const mm = gsap.matchMedia();

    mm.add(
      // `still` is here only so that something always matches: with the object form,
      // GSAP runs the callback when at least one condition does, and on a reduced-motion
      // desktop neither `motion` nor `phone` would — the held last frame would never set.
      { motion: MQ.motion, phone: MQ.phone, still: "(prefers-reduced-motion: reduce)" },
      (context) => {
        const { motion, phone } = context.conditions as { motion: boolean; phone: boolean };

        if (!motion) {
          // Reduced motion: the last frame, held. No pin, no zoom.
          place(0);
          gsap.set(fill, { opacity: 1 });
          const onResize = () => place(0);
          window.addEventListener("resize", onResize);
          return () => window.removeEventListener("resize", onResize);
        }

        const zoom = { z: 1 };
        place(1);

        // Desktop/tablet: a separate pin, so the animation's own trigger can start well
        // before the pin does — as the section comes up under Contact.
        const pin = phone
          ? null
          : ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "+=110%",
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              id: "bookend",
            });

        const tl = gsap.timeline({
          defaults: { ease: "power1.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            // Phone: done as it settles at the foot of the page. Desktop: one screen to
            // reach the top, plus the pin's 110%.
            end: phone ? "bottom bottom" : "+=210%",
            scrub: phone ? true : 1.5,
            invalidateOnRefresh: true,
            // The geometry is a function of the stage size, so a resize has to re-place
            // the hole at whatever point the scrub is sitting on.
            onRefresh: () => place(zoom.z),
          },
        });

        tl.to(zoom, { z: 0, duration: 5.5, onUpdate: () => place(zoom.z) }, 0)
          // The window becomes a mark.
          .fromTo(fill, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 5)
          // And the last line comes up on the light.
          .fromTo(
            message,
            { "--sweep-y": "150%", "--sweep-core": "-60%" },
            { "--sweep-y": "0%", "--sweep-core": "115%", duration: 3.6, ease: "none" },
            6.4
          );

        return () => {
          pin?.kill(true);
          place(1);
        };
      }
    );

    return () => {
      navFade.kill();
      mm.revert();
    };
  }, []);

  return (
    <section className="bookend" ref={sectionRef} aria-labelledby="bookend-title">
      <LogoWall ref={holeRef} fillRef={fillRef} />

      <div className="bookend-message" ref={messageRef}>
        <p className="bookend-kicker ff-cursive">that&rsquo;s the whole tour</p>
        <h2 id="bookend-title" className="bookend-title">
          Let&rsquo;s build
          <br />
          something.
        </h2>
        <a className="bookend-cta" href={`mailto:${config.contact.email}`} data-cursor="disable">
          say hello <MdArrowOutward aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default Bookend;
