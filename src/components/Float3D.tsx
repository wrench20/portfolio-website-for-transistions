import "./styles/Float3D.css";

type Props = {
  /** File name in /public/images/3d, without extension. */
  name: string;
  /** Placement class; position, size (--size) and resting tilt (--tilt) live in CSS. */
  className?: string;
  /** Scroll parallax travel, in % of the object's own height each way. 0 = none. */
  speed?: number;
  /** Above the fold: load immediately instead of lazily. */
  eager?: boolean;
};

/**
 * A floating 3D object (renders from the "3D elements 800+" Figma community file).
 *
 * Two layers on purpose: the <img> carries the idle bob/tilt in CSS, the wrapper carries
 * GSAP's scroll parallax (utils/floats.ts) and any entrance. GSAP writes the whole
 * transform — and `translate: none` — inline on whatever it animates, so if both lived on
 * one element the scroll tween would silently cancel the idle motion.
 */
const Float3D = ({ name, className = "", speed = 14, eager = false }: Props) => (
  <div className={`float3d ${className}`} data-speed={speed} aria-hidden="true">
    <img
      src={`/images/3d/${name}.webp`}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  </div>
);

export default Float3D;
