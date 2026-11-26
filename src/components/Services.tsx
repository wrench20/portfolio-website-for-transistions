import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import "./utils/eases";
import { MQ, all } from "./utils/breakpoints";
import "./styles/Services.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

const services = [
  {
    title: "API & Systems Integration",
    description:
      "Making your apps, databases and payment systems talk to each other without arguing.",
    accent: "circle" as const,
    object: "glass-knot",
  },
  {
    title: "Interface Craft & Motion",
    description:
      "Interfaces that look sharp and move nicely, because buttons deserve a little personality.",
    accent: "wedge" as const,
    object: "powder-plunger",
    highlight: true,
  },
  {
    title: "Deployment & Reliability",
    description:
      "Getting it live and keeping it live, ideally without a 2am phone call.",
    accent: "blob" as const,
    object: "raven-blob",
  },
];

const Services = () => {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".services-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });
    // The heading is no longer in here: it has a data-sweep light reveal now, and a
    // fade-up on the same element would be a second entrance fighting the first.
    tl.fromTo(
      ".service-card",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" }
    );

    // The card copy rises line by line behind its own edge, slightly after the card
    // it sits in. mask: "lines" builds that overflow wrapper natively; without it the
    // lines would slide over the card's other content instead of out from under it.
    const copySplits = gsap.utils
      .toArray<HTMLElement>(".service-card p")
      .map((copy, i) =>
        SplitText.create(copy, {
          type: "lines",
          mask: "lines",
          // span, not the default div: these live inside <p> and heading elements, where a
          // div is not valid content.
          tag: "span",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              autoAlpha: 0,
              duration: 0.7,
              ease: "softIn",
              stagger: 0.06,
              scrollTrigger: {
                trigger: copy.closest(".service-card") ?? copy,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              delay: 0.15 + i * 0.15,
            }),
        })
      );

    // GTA VI's image stacks: neighbouring pieces travel at different speeds, so the row
    // has depth instead of moving as one flat plate. yPercent rather than y so it stacks
    // with the entrance rise above instead of overwriting it. Desktop only — below 900px
    // the cards are a single column and drifting them apart would close the gaps.
    const mm = gsap.matchMedia();
    mm.add(all(MQ.desktop, MQ.motion), () => {
      const speeds = [8, 18, 12];
      gsap.utils.toArray<HTMLElement>(".service-card").forEach((card, i) => {
        const travel = speeds[i % speeds.length];
        gsap.fromTo(
          card,
          { yPercent: travel },
          {
            yPercent: -travel,
            ease: "none",
            scrollTrigger: {
              trigger: ".services-section",
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });

    return () => {
      mm.revert();
      copySplits.forEach((split) => split.revert());
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div className="services-section section-container" id="services">
      <p className="services-eyebrow ff-cursive">a few more things I'm good at</p>
      <h2 data-sweep>
        What Else <span>I Bring</span>
      </h2>
      <div className="services-grid">
        {services.map((s) => (
          <div
            key={s.title}
            className={`service-card service-card-${s.accent}${
              s.highlight ? " service-card-highlight" : ""
            }`}
            data-cursor="disable"
          >
            <div className="service-card-accent" aria-hidden="true">
              <img src={`/images/3d/${s.object}.webp`} alt="" loading="lazy" decoding="async" draggable={false} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
