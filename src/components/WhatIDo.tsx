import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { TbCode, TbServer2 } from "react-icons/tb";
import { config } from "../config";
import Float3D from "./Float3D";

const fact = (label: string) =>
  config.about.facts.find((f) => f.label === label)?.value;

/** The numbers strip under the heading. Experience and Languages come from about.facts so
 *  they cannot drift from the About section; the install count is the one new claim. */
const stats = [
  { value: fact("Experience"), label: "shipping web & mobile" },
  { value: config.skills.proof.value, label: config.skills.proof.label },
  { value: fact("Languages"), label: "working languages" },
].filter((stat): stat is { value: string; label: string } => Boolean(stat.value));

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    // This used to gate on `ScrollTrigger.isTouch`, which is 0 | 1 | 2 — and 2 means
    // "touch *and* mouse". On any Windows laptop with a touchscreen that is truthy, so
    // the touch branch ran and stripped `what-noTouch`, which every :hover expand rule in
    // WhatIDo.css depends on. Hovering a panel then did nothing at all.
    //
    // Hover capability is a media query question, so ask the media query. Clicks are
    // wired unconditionally: a hybrid device should answer to both.
    const canHover = window.matchMedia("(hover: hover)").matches;

    const bound = containerRef.current
      .filter((el): el is HTMLDivElement => el !== null)
      .map((container) => {
        if (!canHover) container.classList.remove("what-noTouch");
        // A named reference, so removeEventListener can actually find it — the previous
        // cleanup passed a freshly allocated arrow and never removed anything.
        const onClick = () => handleClick(container);
        container.addEventListener("click", onClick);
        return { container, onClick };
      });

    return () => {
      bound.forEach(({ container, onClick }) =>
        container.removeEventListener("click", onClick)
      );
    };
  }, []);
  return (
    <div className="whatIDO">
      <div className="whatIDO-glow" aria-hidden="true"></div>
      <div className="what-box what-box-lead">
        <Float3D name="pearl-knot" className="what-float" speed={18} />
        <h2 className="title" data-sweep>
          W<span className="hat-h2">HAT</span>
          <div>
            &nbsp;I<span className="do-h2"> DO</span>
          </div>
        </h2>
        <p className="what-intro ff-cursive">
          two hats, one dev: pick whichever fits your problem
        </p>
        <dl className="what-stats">
          {stats.map((stat) => (
            <div className="what-stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3><TbCode className="what-content-icon" />{config.skills.develop.title}</h3>
              <h4>{config.skills.develop.description}</h4>
              <p>
                {config.skills.develop.details}
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {config.skills.develop.tools.map((tool, index) => (
                  <div key={index} className="what-tags">{tool}</div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3><TbServer2 className="what-content-icon" />{config.skills.design.title}</h3>
              <h4>{config.skills.design.description}</h4>
              <p>
                {config.skills.design.details}
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {config.skills.design.tools.map((tool, index) => (
                  <div key={index} className="what-tags">{tool}</div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  const expanded = container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (!container.parentElement) return;

  // Only the panels. The previous version walked every child of .what-box-in, which also
  // contains the decorative .what-border2 element — so the dashed border div was getting
  // `what-sibling` toggled on and off with every click.
  const siblings = Array.from(
    container.parentElement.querySelectorAll<HTMLElement>(".what-content")
  ).filter((el) => el !== container);

  siblings.forEach((sibling) => {
    sibling.classList.remove("what-content-active");
    // Tied to whether this panel is open, rather than toggled blind — otherwise the
    // siblings' collapsed state drifts out of step after a few clicks.
    sibling.classList.toggle("what-sibling", expanded);
  });
}
