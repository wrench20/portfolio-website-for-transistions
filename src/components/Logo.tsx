export const LOGO_PATH_N =
  "M-10-1-5.592 5.452-3.635 2.217-.519 2.297-3.995 8.608-1.957 12.003 3.675 2.337 7.15 2.257 9.067 5.452 12-1-10-1Z";
export const LOGO_PATH_J =
  "M15-1 17.216 2.181 8.947 18.195 5.352 12.003 1.638 18.195-.24 14.999 5.352 5.492 9 11 15-1Z";

interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
}

/** Tebi's hand-drawn monogram — a static, already-filled mark (see Loader.tsx for the animated stroke-draw variant). */
const Logo = ({ size = 28, color = "currentColor", className }: LogoProps) => {
  const width = size;
  const height = size * (19.19 / 27.22);
  return (
    <svg
      width={width}
      height={height}
      viewBox="-10 -1 27.22 19.19"
      className={className}
      aria-label="Tebi Njeik"
    >
      <path d={LOGO_PATH_N} fill={color} />
      <path d={LOGO_PATH_J} fill={color} />
    </svg>
  );
};

export default Logo;
