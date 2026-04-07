import { useEffect, useState } from "react";
import DrawCanvasApp from "../draw_canvas/src/App";
import NumberRankingsApp from "../number_rankings/src/App";

type View = "home" | "draw-canvas" | "number-rankings";

const HASH_TO_VIEW: Record<string, View> = {
  "#draw-canvas": "draw-canvas",
  "#number-rankings": "number-rankings",
};

function getViewFromHash(hash: string): View {
  return HASH_TO_VIEW[hash] ?? "home";
}

function ProjectCard({
  href,
  accentClass,
  icon,
  title,
  subtitle,
}: {
  href: string;
  accentClass: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      className={`group relative rounded-2xl border bg-slate-900/50 px-8 py-6 backdrop-blur-xl transition-all duration-300 ${accentClass}`}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-xl font-bold uppercase tracking-tight">{title}</div>
      <div className="mt-2 text-xs uppercase text-slate-500">{subtitle}</div>
    </a>
  );
}

function HomeScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#05050a] px-4 font-mono text-slate-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(26,26,46,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,46,1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="z-10 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-[#64daff] to-white bg-clip-text text-4xl font-black uppercase tracking-tighter text-transparent md:text-6xl">
          Topology Projects
        </h1>
        <p className="mb-12 text-sm uppercase tracking-widest text-slate-400">
          Select a sandbox to begin
        </p>

        <div className="flex flex-col justify-center gap-6 md:flex-row">
          <ProjectCard
            href="#number-rankings"
            accentClass="border-amber-500/20 hover:border-amber-500/50 hover:text-amber-400"
            icon="Rank"
            title="Objective Rankings"
            subtitle="Factually based Tier List"
          />
          <ProjectCard
            href="#draw-canvas"
            accentClass="border-[#64daff]/20 hover:border-[#64daff]/50 hover:text-[#64daff]"
            icon="Draw"
            title="Draw Canvas"
            subtitle="Topological Manifold Sandbox"
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>(() => getViewFromHash(window.location.hash));

  useEffect(() => {
    const syncView = () => setView(getViewFromHash(window.location.hash));
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  if (view === "draw-canvas") {
    return <DrawCanvasApp />;
  }

  if (view === "number-rankings") {
    return <NumberRankingsApp />;
  }

  return <HomeScreen />;
}
