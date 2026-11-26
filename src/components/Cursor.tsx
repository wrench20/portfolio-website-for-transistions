import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Nothing here has any meaning without a pointing device. The blob was only ever
    // sized down by a `min-width: 600px` rule, so touch tablets between 600 and 1024px
    // rendered a 50px blob chasing a mouse that does not exist — and this rAF loop ran
    // forever on every phone and tablet regardless, since it never stopped calling
    // itself. CSS hides it under `pointer: coarse`; this keeps the loop from starting.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let hover = false;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    document.addEventListener("mousemove", (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    });
    requestAnimationFrame(function loop() {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
        // cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
      }
      requestAnimationFrame(loop);
    });
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      // mouseenter/mouseleave (not mouseover/mouseout) — they don't bubble, so moving the
      // real cursor between this element's own children doesn't repeatedly re-fire the
      // handler and cause the blob to flicker/re-snap as it crosses internal boundaries.
      element.addEventListener("mouseenter", (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");

          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          //   cursor.style.transform = `translate(${rect.left}px,${rect.top}px)`;
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          cursor.style.setProperty("--cursorW", `${rect.width}px`);
          // Inset defaults to 10px (tuned for the larger social-icons/service-card
          // targets); small targets like a single nav link opt into a tighter
          // inset via data-cursor-inset so the blob doesn't shrink to a sliver.
          const inset = element.dataset.cursorInset ?? "10";
          cursor.style.setProperty("--cursorInset", `${inset}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      });
      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      });
    });
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
