import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Landing.css";
import Float3D from "./Float3D";
import { config } from "../config";
import { MQ } from "./utils/breakpoints";

/*
 * The hero, laid out after an editorial portfolio reference: the role set huge and
 * centred, a two-column line under it, then a fanned hand of photos with the first name
 * on one side and the surname on the other.
 *
 * The name is the <h1>, split across the fan. Both halves are absolutely positioned
 * against .hero-stage, so the <h1> itself takes no space — it exists so the document
 * still reads "Tebi Njeik" as its top heading, in that order.
 *
 * Each name half and each headline line is a mask around an inner span, which is what
 * the entrance in initialFX.ts slides. Scroll parallax (GsapScroll.ts) moves the
 * *outer* elements, so the two never fight over the same transform.
 */

/** The earliest year in the experience list, so this line can never go stale on its own. */
const sinceYear = Math.min(
  ...config.experiences.map((exp) => parseInt(exp.period, 10)).filter(Number.isFinite)
);

/** Back to front. CSS owns the resting fan (`--x`, `--y`, `--r` per card); the entrance
 *  animates only each card's inner layer, so the layout holds even if JS never runs. */
const cards = [
  { src: "/images/hero-back.webp", alt: "" },
  { src: "/images/hero-mid.webp", alt: "" },
  { src: "/images/hero-front.webp", alt: "Tebi Njeik smiling" },
];

const Landing = () => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ");

  const sectionRef = useRef<HTMLDivElement>(null);

  // The two hero objects lean toward the pointer, each by a different amount, so they read
  // as sitting at different depths. quickTo on x/y composes with the scroll parallax
  // (yPercent) and the entrance (scale) GSAP already runs on the same wrappers.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();
    mm.add(`(hover: hover) and ${MQ.motion}`, () => {
      const floats = gsap.utils.toArray<HTMLElement>(".float3d", section).map((el, i) => ({
        x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
        depth: i === 0 ? 34 : -22,
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        floats.forEach((f) => {
          f.x(nx * f.depth);
          f.y(ny * f.depth);
        });
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="landing-section" id="landingDiv" ref={sectionRef}>
      <div className="landing-container">
        {/* Flank the headline, clear of the names and the fan. Eager: above the fold. */}
        <Float3D name="glass-infinity" className="hero-float-left float3d-spin" speed={22} eager />
        <Float3D name="glass-torus" className="hero-float-torus" speed={30} eager />

        <p className="hero-role">
          <span className="hero-role-line"><span>Full-Stack</span></span>
          <span className="hero-role-line"><span>&amp; ERP</span></span>
          <span className="hero-role-line"><span>Developer.</span></span>
        </p>

        <div className="hero-sub">
          <p>
            Making websites, apps and business software
            
            that people don&rsquo;t hate using
          </p>
          <p className="hero-sub-years">({sinceYear} &ndash; Present)</p>
        </div>

        <div className="hero-stage">
          <div className="hero-fan">
            {cards.map((card, i) => (
              <div className={`hero-card hero-card-${i + 1}`} key={i}>
                <div className="hero-card-inner">
                  <img
                    src={card.src}
                    alt={card.alt}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>

          <h1 className="hero-name">
            <span className="hero-name-first">
              <span>{firstName}</span>
            </span>{" "}
            <span className="hero-name-last">
              <span>{lastName}</span>
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Landing;
