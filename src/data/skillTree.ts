/**
 * The skill tree: the taxonomy, and the geometry of the drawn tree it hangs on.
 *
 * The tree is generated here rather than hand-drawn so that every leaf is guaranteed a
 * twig back to its own branch. Leaves sit on one shared grid (rows below, the right
 * side mirrored from the left), so no two can overlap however the data is grouped.
 * Coordinates are in viewBox units (1200 x 900); the SVG scales to the section.
 */

export interface Skill {
  name: string;
  icon: string;
  url: string;
}

export interface Branch {
  id: string;
  label: string;
  skills: Skill[];
}


const devicon = (slug: string, variant = "original") =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-${variant}.svg`;

const simple = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

/**
 * All 44 tools from the old pyramid, regrouped by what they are *for* rather than by
 * how many fit on a row. Nothing was dropped and there is no "misc" bucket — every
 * tool belongs to exactly one branch.
 */
export const branches: Branch[] = [
  {
    id: "core",
    label: "Core",
    skills: [
      { name: "JavaScript", icon: devicon("javascript"), url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
      { name: "TypeScript", icon: devicon("typescript"), url: "https://typescriptlang.org" },
      { name: "Python", icon: devicon("python"), url: "https://python.org" },
      { name: "Node.js", icon: devicon("nodejs"), url: "https://nodejs.org" },
      { name: "HTML", icon: devicon("html5"), url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
      { name: "CSS", icon: devicon("css3"), url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    ],
  },
  {
    id: "interface",
    label: "Interface",
    skills: [
      { name: "React", icon: devicon("react"), url: "https://react.dev" },
      { name: "Next.js", icon: devicon("nextjs"), url: "https://nextjs.org" },
      { name: "Angular", icon: devicon("angular"), url: "https://angular.dev" },
      { name: "React Native", icon: devicon("reactnative"), url: "https://reactnative.dev" },
      { name: "Tailwind", icon: devicon("tailwindcss"), url: "https://tailwindcss.com" },
      { name: "Material UI", icon: devicon("materialui"), url: "https://mui.com" },
      { name: "DaisyUI", icon: simple("daisyui"), url: "https://daisyui.com" },
      { name: "GSAP", icon: simple("gsap"), url: "https://gsap.com" },
      { name: "Framer Motion", icon: simple("framer"), url: "https://www.framer.com/motion" },
      { name: "Redux", icon: devicon("redux"), url: "https://redux.js.org" },
      { name: "React Query", icon: simple("reactquery"), url: "https://tanstack.com/query" },
      { name: "Figma", icon: devicon("figma"), url: "https://figma.com" },
    ],
  },
  {
    id: "data",
    label: "Data",
    skills: [
      { name: "MongoDB", icon: devicon("mongodb"), url: "https://mongodb.com" },
      { name: "PostgreSQL", icon: devicon("postgresql"), url: "https://postgresql.org" },
      { name: "MySQL", icon: devicon("mysql"), url: "https://mysql.com" },
      { name: "SQLite", icon: devicon("sqlite"), url: "https://sqlite.org" },
      { name: "Prisma", icon: devicon("prisma"), url: "https://prisma.io" },
      { name: "Neon", icon: simple("neon"), url: "https://neon.tech" },
      { name: "Firebase", icon: devicon("firebase", "plain"), url: "https://firebase.google.com" },
    ],
  },
  {
    id: "integration",
    label: "Integration",
    skills: [
      { name: "Express", icon: devicon("express"), url: "https://expressjs.com" },
      { name: "Odoo", icon: simple("odoo"), url: "https://www.odoo.com" },
      { name: "Socket.io", icon: simple("socketdotio"), url: "https://socket.io" },
      { name: "Stripe", icon: simple("stripe"), url: "https://stripe.com" },
      { name: "Clerk", icon: simple("clerk"), url: "https://clerk.com" },
      { name: "Auth.js", icon: "/images/placeholder.webp", url: "https://authjs.dev" },
      { name: "Postman", icon: devicon("postman"), url: "https://postman.com" },
    ],
  },
  {
    id: "toolchain",
    label: "Toolchain",
    skills: [
      { name: "Git", icon: devicon("git"), url: "https://git-scm.com" },
      { name: "GitHub", icon: devicon("github"), url: "https://github.com" },
      { name: "GitHub Actions", icon: simple("githubactions"), url: "https://github.com/features/actions" },
      { name: "VS Code", icon: devicon("vscode"), url: "https://code.visualstudio.com" },
      { name: "npm", icon: devicon("npm", "original-wordmark"), url: "https://www.npmjs.com" },
      { name: "pnpm", icon: devicon("pnpm"), url: "https://pnpm.io" },
      { name: "Vite", icon: devicon("vitejs"), url: "https://vitejs.dev" },
      { name: "Webpack", icon: devicon("webpack"), url: "https://webpack.js.org" },
      { name: "Docker", icon: devicon("docker"), url: "https://docker.com" },
      { name: "Vercel", icon: devicon("vercel"), url: "https://vercel.com" },
      { name: "Netlify", icon: devicon("netlify"), url: "https://netlify.com" },
      { name: "Cloudflare", icon: devicon("cloudflare"), url: "https://cloudflare.com" },
    ],
  },
];

/* ---------------------------------------------------------------------------------- */
/*  Geometry                                                                           */
/* ---------------------------------------------------------------------------------- */

export const TREE_W = 1200;
export const TREE_H = 900;
const TX = 600; // trunk centre

type Pt = [number, number];

/** Where each limb leaves the trunk (fork y), where it enters its crown (B), and where
 *  the crown's spine ends (T). Core grows straight up out of the top of the trunk. */
const limbs: Record<string, { fork: number; B: Pt; T: Pt }> = {
  core: { fork: 360, B: [600, 330], T: [600, 30] },
  interface: { fork: 560, B: [455, 515], T: [215, 40] },
  toolchain: { fork: 560, B: [745, 515], T: [985, 40] },
  data: { fork: 715, B: [480, 690], T: [110, 660] },
  integration: { fork: 715, B: [720, 690], T: [1090, 660] },
};

/** Leaf rows, [y, ...x]. Spacing is 124 x 100 with alternate rows offset by half a
 *  column — a hex grid, which keeps neighbours apart diagonally as well. */
const crownRows: Record<string, number[][]> = {
  core: [[60, 538, 662], [160, 476, 600, 724], [260, 600]],
  interface: [[50, 166, 290], [150, 104, 228, 352], [250, 166, 290], [350, 104, 228, 352], [450, 166, 290]],
  data: [[560, 166, 290, 414], [660, 104, 228, 352], [760, 166]],
};
const mirror = (rows: number[][]) => rows.map(([y, ...xs]) => [y, ...xs.map((x) => TREE_W - x)]);
crownRows.toolchain = mirror(crownRows.interface);
crownRows.integration = mirror(crownRows.data);

const f = (n: number) => n.toFixed(1);

const cubicAt = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const m = 1 - t;
  return [
    m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
    m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
  ];
};

/** A filled shape along a cubic, tapering from w0 to w1 — so a limb is thick where it
 *  leaves the trunk and fine at its tip, the way a branch is. */
function ribbon(p0: Pt, p1: Pt, p2: Pt, p3: Pt, w0: number, w1: number) {
  const N = 28;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = cubicAt(p0, p1, p2, p3, t);
    const a = cubicAt(p0, p1, p2, p3, Math.min(1, t + 0.01));
    const b = cubicAt(p0, p1, p2, p3, Math.max(0, t - 0.01));
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const w = (w0 + (w1 - w0) * t) / 2;
    left.push([p[0] - dy * w, p[1] + dx * w]);
    right.push([p[0] + dy * w, p[1] - dx * w]);
  }
  const pts = [...left, ...right.reverse()];
  return "M" + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L") + "Z";
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const cubicD = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) =>
  `M ${f(p0[0])} ${f(p0[1])} C ${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])} ${f(p3[0])} ${f(p3[1])}`;

export interface TreeLeaf {
  skill: Skill;
  x: number;
  y: number;
  /** Twig from the branch's spine to this leaf. */
  twig: string;
}

export interface TreeBranch {
  id: string;
  label: string;
  /** The limb as a tapered fill, and its centreline (for the drawn-on reveal). */
  limb: string;
  limbLine: string;
  spine: string;
  spineLine: string;
  /** Point the crown sways about — where the limb meets its crown. */
  pivot: Pt;
  /** Where the branch's name sits, its rotation (to lie along its limb) and anchor. */
  labelAt: Pt;
  labelAngle: number;
  labelAnchor: "start" | "middle" | "end";
  leaves: TreeLeaf[];
}

function buildTree() {
  const trunkTop = limbs.core.B[1];
  const trunk = ribbon([TX, TREE_H], [TX - 6, 760], [TX + 4, 520], [TX, trunkTop], 46, 14);
  const flare = `M ${TX - 70} ${TREE_H} Q ${TX - 22} ${TREE_H - 14} ${TX - 20} ${TREE_H - 70} L ${TX + 20} ${TREE_H - 70} Q ${TX + 22} ${TREE_H - 14} ${TX + 70} ${TREE_H} Z`;
  const trunkLine = `M ${TX} ${TREE_H} L ${TX} ${trunkTop}`;

  const tree: TreeBranch[] = branches.map((branch) => {
    const { fork, B, T } = limbs[branch.id];
    const F: Pt = [TX, fork];
    const isCore = branch.id === "core";
    const c1: Pt = [TX + (B[0] - TX) * 0.25, fork - 25];
    const c2: Pt = [TX + (B[0] - TX) * 0.7, B[1] + 25];

    // Spine: B -> T, with leaves attached along it.
    const len = Math.hypot(T[0] - B[0], T[1] - B[1]);
    const u: Pt = [(T[0] - B[0]) / len, (T[1] - B[1]) / len];

    const coords = crownRows[branch.id].flatMap(([y, ...xs]) => xs.map((x) => [x, y] as Pt));
    const leaves: TreeLeaf[] = branch.skills.map((skill, i) => {
      const [x, y] = coords[i];
      const along = (x - B[0]) * u[0] + (y - B[1]) * u[1];
      const t = Math.max(len * 0.15, Math.min(len, along - 24));
      const A: Pt = [B[0] + u[0] * t, B[1] + u[1] * t];
      const twig = `M ${f(A[0])} ${f(A[1])} Q ${f((A[0] + x) / 2)} ${f(Math.min(A[1], y) - 18)} ${x} ${y}`;
      return { skill, x, y, twig };
    });

    // Branch names. The upper limbs are long enough to carry their name along them, so
    // it lies on the wood, rotated to the limb, just above it. The lower limbs are too
    // short for that, so their names sit just under the limb on the outside of the fork.
    const mid = cubicAt(F, c1, c2, B, 0.5);
    const right = B[0] > TX;
    const dir: Pt = right ? [B[0] - F[0], B[1] - F[1]] : [F[0] - B[0], F[1] - B[1]];
    const angle = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
    const isLower = branch.id === "data" || branch.id === "integration";
    const label = isCore
      ? { at: [TX, trunkTop + 58] as Pt, angle: 0, anchor: "middle" as const }
      : isLower
        ? { at: [B[0] + (right ? 10 : -10), B[1] + 44] as Pt, angle: 0, anchor: right ? ("start" as const) : ("end" as const) }
        : { at: [mid[0], mid[1] - 14] as Pt, angle, anchor: "middle" as const };
    return {
      id: branch.id,
      label: branch.label,
      limb: isCore ? "" : ribbon(F, c1, c2, B, 16, 7),
      limbLine: isCore ? "" : cubicD(F, c1, c2, B),
      spine: ribbon(B, lerp(B, T, 0.33), lerp(B, T, 0.66), T, 7, 2),
      spineLine: `M ${f(B[0])} ${f(B[1])} L ${f(T[0])} ${f(T[1])}`,
      pivot: B,
      labelAt: label.at,
      labelAngle: label.angle,
      labelAnchor: label.anchor,
      leaves,
    };
  });

  return { trunk, flare, trunkLine, tree };
}

export const treeLayout = buildTree();
