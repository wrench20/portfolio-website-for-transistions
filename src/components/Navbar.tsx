import { useCallback, useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import { MenuButton, MenuPanel, useSiteMenu } from "./Menu";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./styles/Navbar.css";
import ThemeToggle from "./ThemeToggle";

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;

const Navbar = () => {
  const { open, toggle, navRef, buttonRef } = useSiteMenu();

  // The Lenis half of the menu's scroll lock. It lives here rather than in Menu because
  // Lenis is created here, and importing it the other way would make the two modules a
  // circular pair. Menu handles the `body.menu-open` half.
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open]);

  /** Owned here because Lenis lives here. Handed to Menu, which calls it on link click.
   *  No width gate: Lenis runs with syncTouch off, which only changes how it handles
   *  *user* gestures — a programmatic scrollTo animates fine on touch. */
  const scrollToSection = useCallback((href: string) => {
    const target = document.querySelector(href) as HTMLElement | null;
    if (!target || !lenis) return;

    // Lenis guards scrollTo with `(isStopped || isLocked) && !force) return`, and a menu
    // link calls this immediately after asking the menu to close — while Lenis is still
    // stopped, because the restart rides a React state update that has not committed yet.
    // That made every nav link a silent no-op. Restarting here closes the gap; the effect
    // above runs again on the next commit, which is idempotent. Deliberately not
    // `force: true`, which would also override isLocked and hide the ordering rather than
    // fix it.
    lenis.start();
    lenis.scrollTo(target, {
      offset: 0,
      duration: window.innerWidth > 1024 ? 1.5 : 1,
    });
  }, []);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    lenis = new Lenis({
      duration: 1.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.7,
      touchMultiplier: 2,
      infinite: false,
    });

    // Start paused
    lenis.stop();

    // Drive Lenis from GSAP's ticker and feed its scroll position straight into
    // ScrollTrigger. Without this the two run on independent RAF loops with no
    // ordering guarantee and ScrollTrigger never learns when Lenis scrolls —
    // which is what makes pinned sections jitter.
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => lenis?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      window.removeEventListener("resize", onResize);
      lenis?.off("scroll", onLenisScroll);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          <Logo className="navbar-logo" color="currentColor" />
        </a>
        <a
          href="mailto:tebi@njeik.dev"
          className="navbar-connect"
          data-cursor="disable"
        >
          tebi@njeik.dev
        </a>
        {/* The three inline links that used to live here are now the side menu. Below
            500px they collapsed into a stack of 11px links in the corner, and the email
            and socials beside them were hidden outright under 900px — so a phone had a
            cramped nav and no way to reach either. */}
        <div className="header-actions">
          <ThemeToggle />
          <MenuButton open={open} onToggle={toggle} buttonRef={buttonRef} />
        </div>
      </div>

      {/* Outside .header on purpose: .header carries a transform for its own centering,
          which would make it the containing block for the panel's position: fixed. */}
      <MenuPanel navRef={navRef} onToggle={toggle} onNavigate={scrollToSection} />

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
