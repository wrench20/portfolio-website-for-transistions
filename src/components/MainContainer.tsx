import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import NowPlayingWidget from "./NowPlayingWidget";
import ScrollToTop from "./ScrollToTop";
import Services from "./Services";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import BoxesCurtain from "./BoxesCurtain";
import SkillTree from "./SkillTree";
import Bookend from "./Bookend";
import { setSweepReveals, revertSweepReveals } from "./utils/sweep";
import { setHandoffs } from "./utils/handoff";
import { setFloats } from "./utils/floats";
import { setSectionTimelines, setAllTimeline } from "./utils/GsapScroll";

type SectionTimeline = ReturnType<typeof setAllTimeline>;

// timeline.kill() does not touch the ScrollTrigger declared in its vars — the
// trigger stays alive, bound to a dead timeline, and the next call layers a second
// one on top of it. Kill both, reverting so nothing is left behind in the DOM.
function killTimelines(timelines: SectionTimeline[]) {
  timelines.forEach((tl) => {
    tl.scrollTrigger?.kill(true);
    tl.kill();
  });
}

const MainContainer = () => {
  // A ref, not state: this only decides when to rebuild the section timelines on crossing
  // the desktop breakpoint. It used to be state because it also gated the pinned About
  // photo, which no longer exists, and re-rendering the whole page for it bought nothing.
  const isDesktopRef = useRef(window.innerWidth > 1024);
  const timelinesRef = useRef<SectionTimeline[]>([]);

  useEffect(() => {
    timelinesRef.current = [...setSectionTimelines(), setAllTimeline()];

    // The GTA VI layer: light-sweep reveals on every [data-sweep] heading/paragraph,
    // and the dissolve handoff between sections.
    setSweepReveals();
    const revertHandoffs = setHandoffs();
    const revertFloats = setFloats();

    // One refresh once every child has registered its own triggers. Work.tsx
    // used to call this synchronously inside its own effect — before these
    // timelines existed and while body overflow was still locked.
    ScrollTrigger.refresh();

    return () => {
      killTimelines(timelinesRef.current);
      timelinesRef.current = [];
      revertSweepReveals();
      revertHandoffs();
      revertFloats();
    };
  }, []);

  useEffect(() => {
    const resizeHandler = () => {
      // Nothing to redo for the sweeps on resize: they are percentages of each
      // element's own box, and their triggers use invalidateOnRefresh.
      const nowDesktop = window.innerWidth > 1024;
      if (nowDesktop !== isDesktopRef.current) {
        isDesktopRef.current = nowDesktop;
        killTimelines(timelinesRef.current);
        timelinesRef.current = [...setSectionTimelines(), setAllTimeline()];
      }
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      <NowPlayingWidget />
      <ScrollToTop />
      <div className="container-main">
        <Landing />
        <About />
        <WhatIDo />
        <Services />
        <Career />
        <BoxesCurtain />
        <Work />
        <SkillTree />
        <Contact />
        <Bookend />
      </div>
    </div>
  );
};

export default MainContainer;
