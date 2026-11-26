import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { branches, treeLayout, TREE_W, TREE_H } from "../data/skillTree";
import { MQ } from "./utils/breakpoints";
import "./utils/eases";
import "./styles/SkillTree.css";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const totalSkills = branches.reduce((n, b) => n + b.skills.length, 0);

/** Above this the drawn tree; at or below it the vertical boughs (the tree at 500px wide
 *  would shrink every label below legibility). Matches the CSS in SkillTree.css. */
const TREE_MQ = "(min-width: 901px)";

/*
 * The skill tree, drawn as a tree: a tapered trunk, five limbs (one per category), and
 * every skill a leaf on its own twig off its limb. Geometry comes from data/skillTree.ts.
 *
 * Wood (trunk, limbs, spines) is a filled, tapered shape, which DrawSVG cannot draw on —
 * so it sits under a mask of plain centreline strokes, and it is the mask that draws.
 * Twigs are ordinary strokes and draw directly. Once grown, the mask is removed so the
 * crowns can sway without their wood being clipped by a mask that does not sway.
 */
const SkillTree = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { trunk, flare, trunkLine, tree } = treeLayout;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const svg = section.querySelector<SVGSVGElement>(".st-svg");
    const list = section.querySelector<HTMLElement>(".st-list");
    if (!svg || !list) return;

    // ---- Branch highlight: hover or focus anything on a branch, the rest dims. --------
    const parts = gsap.utils.toArray<SVGElement>("[data-branch]", svg);
    const setActive = (id: string | null) => {
      parts.forEach((el) => {
        el.classList.toggle("is-hot", id !== null && el.dataset.branch === id);
        el.classList.toggle("is-dim", id !== null && el.dataset.branch !== id);
      });
    };
    const handlers = parts
      .filter((el) => el.classList.contains("st-crown") || el.classList.contains("st-branch-label"))
      .map((el) => {
        const enter = () => setActive(el.dataset.branch ?? null);
        const leave = () => setActive(null);
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        el.addEventListener("focusin", enter);
        el.addEventListener("focusout", leave);
        return { el, enter, leave };
      });

    const mm = gsap.matchMedia();

    // ---- Desktop: grow the tree --------------------------------------------------------
    mm.add(`${TREE_MQ} and ${MQ.motion}`, () => {
      const grow = (sel: string) => gsap.utils.toArray<SVGPathElement>(sel, svg);
      const masked = gsap.utils.toArray<SVGGElement>("[data-grow-mask]", svg);
      const leaves = gsap.utils.toArray<SVGGElement>(".st-leaf-in", svg);
      const names = gsap.utils.toArray<SVGTextElement>(".st-leaf-name", svg);
      const labels = gsap.utils.toArray<SVGGElement>(".st-branch-label", svg);

      // Mask on only while growing; see the note at the top.
      masked.forEach((g) => g.setAttribute("mask", "url(#st-grow)"));
      svg.classList.remove("is-grown");

      const tl = gsap.timeline({
        defaults: { ease: "treeDraw" },
        scrollTrigger: { trigger: svg, start: "top 75%", once: true },
        onComplete: () => {
          masked.forEach((g) => g.removeAttribute("mask"));
          svg.classList.add("is-grown");
        },
      });

      tl.fromTo(grow(".st-grow-trunk"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1 })
        .fromTo(
          grow(".st-grow-limb"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.9, stagger: 0.08 },
          "-=0.45"
        )
        .fromTo(
          grow(".st-grow-spine"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.8, stagger: 0.08 },
          "-=0.55"
        )
        .fromTo(
          grow(".st-twig"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.5, stagger: { each: 0.012, from: "start" } },
          "-=0.5"
        )
        // Leaves open on their twigs, like buds.
        .fromTo(
          leaves,
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.55, ease: "back.out(2.2)", stagger: 0.018 },
          "-=0.6"
        )
        .fromTo(names, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.012 }, "<0.15")
        .fromTo(labels, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, "<");

      return () => {
        masked.forEach((g) => g.removeAttribute("mask"));
        svg.classList.add("is-grown");
      };
    });

    // ---- Narrow: the boughs grow down the trunk, leaves fanning in --------------------
    mm.add(`(max-width: 900px) and ${MQ.motion}`, () => {
      const boughs = gsap.utils.toArray<HTMLElement>(".st-bough", list);
      const tweens = boughs.map((bough) =>
        gsap
          .timeline({ scrollTrigger: { trigger: bough, start: "top 85%", once: true } })
          .fromTo(bough.querySelector(".st-bough-label"), { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" })
          .fromTo(
            bough.querySelectorAll(".st-bough-leaf"),
            { autoAlpha: 0, scale: 0.7 },
            { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.04 },
            "-=0.2"
          )
      );
      return () => tweens.forEach((t) => t.scrollTrigger?.kill());
    });

    return () => {
      mm.revert();
      handlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focusin", enter);
        el.removeEventListener("focusout", leave);
      });
      setActive(null);
    };
  }, []);

  return (
    <section className="skilltree-section" id="skills" ref={sectionRef}>
      <div className="skilltree-head" data-sweep>
        <p className="skilltree-eyebrow ff-cursive">the toolbox, honestly</p>
        <h2>
          Skill <span>Tree</span>
        </h2>
        <p className="skilltree-sub">
          {totalSkills} things I reach for, growing off five branches. Pick one, I won&rsquo;t mind.
        </p>
      </div>

      {/* ---- The drawn tree (wider screens) ---- */}
      <svg
        className="st-svg is-grown"
        viewBox={`0 0 ${TREE_W} ${TREE_H}`}
        role="group"
        aria-label={`Skill tree: ${totalSkills} tools on ${branches.length} branches`}
      >
        <defs>
          <mask id="st-grow" maskUnits="userSpaceOnUse" x="0" y="0" width={TREE_W} height={TREE_H}>
            <path className="st-grow-trunk" d={trunkLine} />
            {tree.map((b) =>
              b.limbLine ? <path key={b.id} className="st-grow-limb" d={b.limbLine} /> : null
            )}
            {tree.map((b) => (
              <path key={b.id} className="st-grow-spine" d={b.spineLine} />
            ))}
          </mask>
        </defs>

        <g className="st-wood" data-grow-mask>
          <path className="st-trunk" d={flare} />
          <path className="st-trunk" d={trunk} />
          {tree.map((b) =>
            b.limb ? <path key={b.id} className="st-limb" data-branch={b.id} d={b.limb} /> : null
          )}
        </g>

        {tree.map((b) => (
          <g
            key={b.id}
            className="st-crown"
            data-branch={b.id}
            style={{ transformOrigin: `${b.pivot[0]}px ${b.pivot[1]}px` }}
          >
            <g data-grow-mask>
              <path className="st-limb st-spine" d={b.spine} />
            </g>
            {b.leaves.map((leaf) => (
              <path key={leaf.skill.name} className="st-twig" d={leaf.twig} />
            ))}
            {b.leaves.map((leaf) => (
              <a
                key={leaf.skill.name}
                className="st-leaf"
                href={leaf.skill.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={leaf.skill.name}
                data-cursor="disable"
              >
                <g transform={`translate(${leaf.x} ${leaf.y})`}>
                  <g className="st-leaf-in">
                    <circle r="26" />
                    <image href={leaf.skill.icon} x="-15" y="-15" width="30" height="30" />
                  </g>
                  <text className="st-leaf-name" y="47">
                    {leaf.skill.name}
                  </text>
                </g>
              </a>
            ))}
          </g>
        ))}

        {tree.map((b) => (
          <g key={b.id} className="st-branch-label" data-branch={b.id} tabIndex={0}>
            <text
              x={b.labelAt[0]}
              y={b.labelAt[1]}
              textAnchor={b.labelAnchor}
              transform={b.labelAngle ? `rotate(${b.labelAngle.toFixed(1)} ${b.labelAt[0].toFixed(1)} ${b.labelAt[1].toFixed(1)})` : undefined}
            >
              {b.label}
              <tspan className="st-branch-count" dx="8">
                {b.leaves.length}
              </tspan>
            </text>
          </g>
        ))}
      </svg>

      {/* ---- Boughs (narrow screens): trunk down the side, each branch a limb ---- */}
      <div className="st-list">
        {branches.map((b) => (
          <div className="st-bough" key={b.id}>
            <h3 className="st-bough-label">
              {b.label}
              <span>{b.skills.length}</span>
            </h3>
            <ul className="st-bough-leaves">
              {b.skills.map((s) => (
                <li className="st-bough-leaf" key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" data-cursor="disable">
                    <span className="st-bough-icon">
                      <img src={s.icon} alt="" loading="lazy" decoding="async" />
                    </span>
                    <span>{s.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillTree;
