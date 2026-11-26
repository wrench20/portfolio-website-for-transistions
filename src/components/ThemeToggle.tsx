import { useEffect, useState } from "react";
import { TbMoon, TbSun } from "react-icons/tb";
import { MQ } from "./utils/breakpoints";

type Theme = "dark" | "light";

/** Browser chrome colour per theme — matches --backgroundColor in index.css. */
const CHROME: Record<Theme, string> = { dark: "#0e0f13", light: "#e3edf5" };

/** Whatever the pre-paint script in app/layout.tsx applied. Dark is the default. */
const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

/**
 * Dark / light switch.
 *
 * The theme itself is just `data-theme` on <html>: every colour on the site reads a
 * variable that index.css redefines under `[data-theme="light"]`, so switching is one
 * attribute write. The choice is stored, and app/layout.tsx re-applies it in an inline
 * script before first paint, so a returning visitor never sees the wrong theme flash.
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  // The pre-paint script can run before Next has inserted its theme-color <meta>, so
  // sync the browser chrome colour once more on mount.
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", CHROME[theme]);
  }, [theme]);

  const toggle = () => {
    const apply = () => {
      document.documentElement.dataset.theme = next;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", CHROME[next]);
      setTheme(next);
    };

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked (private mode, etc.): the switch still works for this visit.
    }

    // A crossfade between the two themes where the browser supports view transitions,
    // instead of every colour on the page snapping at once.
    if (document.startViewTransition && window.matchMedia(MQ.motion).matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      data-cursor="disable"
    >
      {theme === "dark" ? <TbSun aria-hidden="true" /> : <TbMoon aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
