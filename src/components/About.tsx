import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/About.css";
import { config } from "../config";

gsap.registerPlugin(ScrollTrigger);

/*
 * Text only. The pinned portrait that used to sit beside this — and slide sideways and
 * then up as you scrolled — is gone; the photos now lead the hero instead. What is left
 * is a statement set large, and the facts as a ruled list beside it.
 */
const About = () => {
  useEffect(() => {
    const tween = gsap.from(".about-fact", {
      autoAlpha: 0,
      y: 16,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".about-facts",
        start: "top 80%",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.revert();
    };
  }, []);

  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <div className="about-statement">
          <h3 className="title" data-sweep>
            {config.about.title}
          </h3>
          <p className="para" data-sweep>
            {config.about.description}
          </p>
        </div>

        <dl className="about-facts">
          {config.about.facts.map((fact) => (
            <div className="about-fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default About;
