import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { config } from "../config";
import { MQ } from "./utils/breakpoints";
import "./utils/eases";
import "./styles/Menu.css";

type MenuItem = { label: string; href: string };

/** Five, to match the five section ids that already exist in the page. */
const ITEMS: MenuItem[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const SOCIALS = [
  { label: "GitHub", href: config.contact.github },
  { label: "WhatsApp", href: config.contact.whatsapp },
  { label: "Instagram", href: config.contact.instagram },
];

/**
 * The site's only navigation: a panel that wipes in from the right on three staggered
 * layers, ported from the Osmo side-menu reference.
 *
 * The panel is light on a dark site — the same inversion the boxes curtain uses — so the
 * headings are dark type, and hovering one wipes a dark block up behind it while a light
 * duplicate of the word (drawn as a text-shadow one em below) slides into its place.
 *
 * Button and panel are returned separately rather than as one subtree: `.header` carries
 * a `transform` for its own centering, which makes it the containing block for any
 * `position: fixed` descendant — a panel nested inside it would be trapped in the
 * header's box instead of covering the viewport.
 */
export function useSiteMenu() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  /** Mirrors `open` for the document-level Escape handler, which binds once. */
  const openRef = useRef(false);

  useEffect(() => {
    timeline.current = gsap.timeline();
    return () => {
      timeline.current?.kill();
      timeline.current = null;
    };
  }, []);

  const play = useCallback((toOpen: boolean) => {
    const nav = navRef.current;
    const button = buttonRef.current;
    const tl = timeline.current;
    if (!nav || !button || !tl) return;

    const overlay = nav.querySelector(".nav-overlay");
    const menu = nav.querySelector(".menu");
    const panels = nav.querySelectorAll(".bg-panel");
    const links = nav.querySelectorAll(".menu-link");
    const fades = nav.querySelectorAll("[data-menu-fade]");
    const buttonTexts = button.querySelectorAll("p");

    // Scoped to this timeline. The reference applies these with a global gsap.defaults(),
    // which here would silently retune every other animation on the site.
    const d = { ease: "main", duration: 0.7 };
    const reduced = !window.matchMedia(MQ.motion).matches;

    nav.setAttribute("data-nav", toOpen ? "open" : "closed");
    tl.clear();

    if (reduced) {
      // Still opens and closes, it just arrives instead of travelling. A menu that can't
      // be opened is not an accessibility win.
      if (toOpen) {
        tl.set(nav, { display: "block" })
          .set(menu, { xPercent: 0 })
          .set(panels, { xPercent: 0 })
          .set([overlay, ...links, ...fades], { autoAlpha: 1, yPercent: 0, rotate: 0 })
          .set(buttonTexts, { yPercent: -100 });
      } else {
        tl.set(buttonTexts, { yPercent: 0 })
          .set(nav, { display: "none" });
      }
      return;
    }

    if (toOpen) {
      tl.set(nav, { display: "block" })
        .set(menu, { xPercent: 0 }, "<")
        .fromTo(buttonTexts, { yPercent: 0 }, { ...d, yPercent: -100, stagger: 0.2 })
        .fromTo(overlay, { autoAlpha: 0 }, { ...d, autoAlpha: 1 }, "<")
        .fromTo(
          panels,
          { xPercent: 101 },
          { ...d, xPercent: 0, stagger: 0.12, duration: 0.575 },
          "<"
        )
        .fromTo(
          links,
          { yPercent: 140, rotate: 10 },
          { ...d, yPercent: 0, rotate: 0, stagger: 0.05 },
          "<+=0.35"
        )
        .fromTo(
          fades,
          { autoAlpha: 0, yPercent: 50 },
          { ...d, autoAlpha: 1, yPercent: 0, stagger: 0.04 },
          "<+=0.2"
        );
    } else {
      tl.to(overlay, { ...d, autoAlpha: 0 })
        .to(menu, { ...d, xPercent: 120 }, "<")
        .to(buttonTexts, { ...d, yPercent: 0 }, "<")
        .set(nav, { display: "none" });
    }
  }, []);

  const toggle = useCallback(
    (next: boolean) => {
      openRef.current = next;
      setOpen(next);

      // Half of the scroll lock. The other half is Lenis, which Navbar stops and starts
      // off `open` — Lenis lives there, and importing it here would make Navbar and Menu
      // a circular pair. Neither half is sufficient alone: Lenis runs with syncTouch off
      // so it never owns touch scrolling, and this class alone leaves Lenis mid-glide.
      //
      // Both elements: <html> is the scrolling element, and <body> already has
      // `overflow: hidden` on desktop, so locking body by itself does nothing.
      document.documentElement.classList.toggle("menu-open", next);
      document.body.classList.toggle("menu-open", next);

      play(next);

      if (next) {
        // Let the panel exist before moving focus into it.
        requestAnimationFrame(() =>
          navRef.current?.querySelector<HTMLAnchorElement>(".menu-link")?.focus()
        );
      } else {
        buttonRef.current?.focus();
      }
    },
    [play]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openRef.current) toggle(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Never leave the page locked behind an unmounted menu.
      document.documentElement.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
    };
  }, [toggle]);

  return { open, toggle, navRef, buttonRef };
}

export function MenuButton({
  open,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  onToggle: (next: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="menu-button"
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      data-cursor="icons"
      data-cursor-inset="8"
      onClick={() => onToggle(!open)}
    >
      <span className="menu-button-text" aria-hidden="true">
        <p>Menu</p>
        <p>Close</p>
      </span>
      {/* Three bars that spin into an X. Pure CSS off the button's own aria-expanded —
          no checkbox needed, and it keeps working even when GSAP's ticker is stalled. */}
      <span className="menu-toggle" aria-hidden="true">
        <span className="bar bar--top" />
        <span className="bar bar--middle" />
        <span className="bar bar--bottom" />
      </span>
    </button>
  );
}

export function MenuPanel({
  navRef,
  onToggle,
  onNavigate,
}: {
  navRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (next: boolean) => void;
  /** Handed the target selector; Navbar owns the Lenis scroll. */
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="nav" data-nav="closed" ref={navRef}>
      <div className="nav-overlay" onClick={() => onToggle(false)} aria-hidden="true" />
      <nav
        className="menu"
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="menu-bg" aria-hidden="true">
          <div className="bg-panel first" />
          <div className="bg-panel second" />
          <div className="bg-panel" />
        </div>

        <div className="menu-inner">
          <ul className="menu-list ">
            {ITEMS.map((item, i) => (
              <li className="menu-list-item" key={item.href}>
                <a
                  href={item.href}
                  className="menu-link"
                  data-cursor="disable"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggle(false);
                    onNavigate(item.href);
                  }}
                >
                  <span className="menu-link-heading">{item.label}</span>
                  <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                  <span className="menu-link-bg" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div className="menu-details">
            <p data-menu-fade className="menu-details-label">
              Elsewhere
            </p>
            <div className="socials-row">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  data-menu-fade
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                  data-cursor="disable"
                >
                  {s.label}
                </a>
              ))}
              <a
                data-menu-fade
                href={`mailto:${config.contact.email}`}
                className="text-link"
                data-cursor="disable"
              >
                {config.contact.email}
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
