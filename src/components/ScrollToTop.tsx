import { useEffect, useRef, useState } from "react";
import { TbArrowUp } from "react-icons/tb";
import { lenis } from "./Navbar";
import "./styles/ScrollToTop.css";

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScrollToTop = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setProgress(pct);
      setVisible(scrollTop > window.innerHeight * 0.5);
    };

    const onScroll = () => {
      // rAF-batched so we only touch React state once per frame, no matter how many
      // scroll events fire in between — keeps this tracking in real time, not just on stop.
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      className={`scroll-to-top${visible ? " scroll-to-top-visible" : ""}`}
      onClick={handleClick}
      aria-label="Scroll to top"
      data-cursor="disable"
    >
      <svg className="scroll-to-top-progress" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle className="scroll-to-top-track" cx="28" cy="28" r={RADIUS} />
        <circle
          className="scroll-to-top-ring"
          cx="28"
          cy="28"
          r={RADIUS}
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: CIRCUMFERENCE * (1 - progress),
          }}
        />
      </svg>
      <TbArrowUp className="scroll-to-top-icon" />
    </button>
  );
};

export default ScrollToTop;
