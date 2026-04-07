import { useEffect, useRef, useState } from "react";
import Reveal from "reveal.js";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";
import {
  coffeeGlbUrl,
  cowToSphereGifUrl,
  kleinBottleGifUrl,
  mobiusStripGifUrl,
  mugToDonutGifUrl,
  pantsGlbUrl,
  shoeGlbUrl,
  thankYouGifUrl,
  tshirtGlbUrl,
  tubeTorusGifUrl,
} from "./assetPaths";
import ThreeScene, { type ThreeSceneSource } from "./components/ThreeScene";

interface TopologyInfo {
  tunnels: number;
  description: string;
  equivalent: string;
}

type SlideMedia =
  | {
      kind: "3d";
      source: ThreeSceneSource;
      cornerLabel: string;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      fit?: "contain" | "cover";
      cornerLabel: string;
    };

interface SlideConfig {
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  icon: string;
  topology: TopologyInfo;
  media: SlideMedia;
}

const slides: SlideConfig[] = [
  {
    title: "Cow to Sphere",
    subtitle: "Topology-Preserving Deformation",
    bgColor: "#0e1209",
    accentColor: "#84cc16",
    icon: "GIF",
    topology: {
      tunnels: 0,
      description:
        "A cow and a sphere both have zero tunnels. The animation works because all the legs, ears, and other geometric details can be smoothed away without cutting the surface or gluing new parts together.",
      equivalent: "Eq: Sphere-like closed surface with 0 tunnels",
    },
    media: {
      kind: "image",
      src: cowToSphereGifUrl,
      alt: "Cow morphing into a sphere",
      fit: "contain",
      cornerLabel: "Animated GIF",
    },
  },
  {
    title: "Mug to Donut",
    subtitle: "The Tunnel Is Preserved",
    bgColor: "#120d08",
    accentColor: "#fb923c",
    icon: "GIF",
    topology: {
      tunnels: 1,
      description:
        "A coffee mug and a donut each have exactly one tunnel. The animation is a classic example of topology preserving the count of holes even while the geometry changes dramatically.",
      equivalent: "Eq: Donut-like surface with 1 tunnel",
    },
    media: {
      kind: "image",
      src: mugToDonutGifUrl,
      alt: "Coffee mug morphing into a donut",
      fit: "contain",
      cornerLabel: "Animated GIF",
    },
  },
  {
    title: "Coffee Mug",
    subtitle: "The Classic Single-Tunnel Surface",
    bgColor: "#100e08",
    accentColor: "#f59e0b",
    icon: "Mug",
    topology: {
      tunnels: 1,
      description:
        "The handle contributes one genuine through-tunnel to the mug. That single handle is why the mug belongs in the same topological family as the donut.",
      equivalent: "Eq: Donut with a drinking opening",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: coffeeGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "Shoe",
    subtitle: "A Simple Pouch with No Tunnel",
    bgColor: "#080e1a",
    accentColor: "#6366f1",
    icon: "Shoe",
    topology: {
      tunnels: 0,
      description:
        "A shoe has one opening at the ankle but no through-tunnel piercing the surface. It is a useful everyday example of a shape with zero tunnels.",
      equivalent: "Eq: Disk-like surface with 1 boundary",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: shoeGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "Pants",
    subtitle: "Two Tunnels for Two Legs",
    bgColor: "#060d1f",
    accentColor: "#3b82f6",
    icon: "Pant",
    topology: {
      tunnels: 2,
      description:
        "Pants have two distinct through-tunnels, one for each leg. Topologically, that is what makes them different from a shirt or a shoe.",
      equivalent: "Eq: A flattened mask with two eye holes",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: pantsGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "T-Shirt",
    subtitle: "Three Tunnels for Torso and Sleeves",
    bgColor: "#150808",
    accentColor: "#ef4444",
    icon: "Shirt",
    topology: {
      tunnels: 3,
      description:
        "A t-shirt has one torso tunnel and two sleeve tunnels. Counting those through-paths gives it three tunnels overall.",
      equivalent: "Eq: A flat surface with three holes",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: tshirtGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "Tube to Torus",
    subtitle: "Closing a Boundary into a Tunnel",
    bgColor: "#101008",
    accentColor: "#a3e635",
    icon: "GIF",
    topology: {
      tunnels: 1,
      description:
        "When the two ends of the tube are joined, the open boundaries disappear and a single tunnel remains. This is the standard birth of a torus from a cylinder.",
      equivalent: "Eq: Torus with 1 tunnel",
    },
    media: {
      kind: "image",
      src: tubeTorusGifUrl,
      alt: "Tube to torus animation",
      fit: "contain",
      cornerLabel: "Animated GIF",
    },
  },
  {
    title: "Mobius Strip",
    subtitle: "One-Sided Surface",
    bgColor: "#0d0817",
    accentColor: "#c084fc",
    icon: "GIF",
    topology: {
      tunnels: 1,
      description:
        "The Mobius strip is famous because it has only one side and one edge. The half-twist changes orientability while preserving the basic single-band tunnel structure.",
      equivalent: "Eq: Non-orientable strip with 1 boundary",
    },
    media: {
      kind: "image",
      src: mobiusStripGifUrl,
      alt: "Mobius strip animation",
      fit: "contain",
      cornerLabel: "Animated GIF",
    },
  },
  {
    title: "Tube to Klein Bottle",
    subtitle: "A Non-Orientable Closure",
    bgColor: "#071019",
    accentColor: "#22d3ee",
    icon: "GIF",
    topology: {
      tunnels: 2,
      description:
        "The Klein bottle closes up in a way that forces the surface to pass through itself in 3D. The resulting object is closed and non-orientable, with a more exotic hole structure than the torus.",
      equivalent: "Eq: Closed non-orientable surface",
    },
    media: {
      kind: "image",
      src: kleinBottleGifUrl,
      alt: "Klein bottle animation",
      fit: "contain",
      cornerLabel: "Animated GIF",
    },
  },
];

function renderViewport(
  slide: SlideConfig,
  index: number,
  activeSlide: number
) {
  if (slide.media.kind === "3d") {
    return (
      <ThreeScene
        source={slide.media.source}
        isActive={activeSlide === index}
        bgColor={slide.bgColor}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black/20 p-6">
      <img
        src={slide.media.src}
        alt={slide.media.alt}
        className="max-h-full max-w-full rounded-xl object-contain"
        style={{ objectFit: slide.media.fit ?? "contain" }}
      />
    </div>
  );
}

function SlideFrame({
  slide,
  index,
  activeSlide,
}: {
  slide: SlideConfig;
  index: number;
  activeSlide: number;
}) {
  const slideNumber = String(index + 1).padStart(2, "0");
  const interactionText =
    slide.media.kind === "3d"
      ? "Drag to rotate 3D slides. Use arrow keys to navigate."
      : "Animated reference slide. Use arrow keys to navigate.";

  return (
    <section data-background-color={slide.bgColor} data-transition="slide">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
          padding: "2.5rem 3.5rem",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "30%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${slide.accentColor}12 0%, transparent 70%)`,
            transform: "translate(50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            flex: "0 0 370px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: slide.accentColor,
              fontFamily: "monospace",
            }}
          >
            {slideNumber} / {String(TOTAL_SLIDES).padStart(2, "0")}
          </div>

          <div style={{ fontSize: "3rem", lineHeight: 1 }}>{slide.icon}</div>

          <h2
            style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {slide.title}
          </h2>

          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: slide.accentColor,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {slide.subtitle}
          </div>

          <div
            style={{
              marginTop: "0.2rem",
              padding: "0.8rem 1rem",
              borderRadius: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "9999px",
                  background: `${slide.accentColor}20`,
                  border: `1px solid ${slide.accentColor}40`,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: slide.accentColor,
                  fontFamily: "monospace",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>tunnels</span> = {slide.topology.tunnels}
              </span>
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "monospace",
                marginBottom: "0.5rem",
              }}
            >
              {slide.topology.equivalent}
            </div>

            <p
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.45)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {slide.topology.description}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.3rem",
              padding: "0.45rem 0.8rem",
              borderRadius: "0.45rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
              {interactionText}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === activeSlide ? "1.8rem" : "0.45rem",
                  height: "0.35rem",
                  borderRadius: "9999px",
                  backgroundColor:
                    i === activeSlide ? slide.accentColor : "rgba(255,255,255,0.12)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            flex: "1 1 0",
            maxWidth: "720px",
            height: "78vh",
            maxHeight: "680px",
            minHeight: "300px",
            position: "relative",
            borderRadius: "1.2rem",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 40px ${slide.accentColor}08`,
            background: slide.bgColor,
            zIndex: 2,
          }}
        >
          {renderViewport(slide, index, activeSlide)}

          <div
            style={{
              position: "absolute",
              top: "0.8rem",
              right: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.3rem 0.65rem",
              borderRadius: "0.35rem",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: "#4ade80",
                boxShadow: "0 0 5px #4ade80",
              }}
            />
            <span
              style={{
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "monospace",
              }}
            >
              {slide.media.cornerLabel}
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              top: "0.8rem",
              left: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.3rem 0.65rem",
              borderRadius: "0.35rem",
              background: `${slide.accentColor}18`,
              backdropFilter: "blur(10px)",
              border: `1px solid ${slide.accentColor}30`,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: slide.accentColor,
                fontFamily: "monospace",
              }}
            >
              TUNNELS {slide.topology.tunnels}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const TOTAL_SLIDES = slides.length + 1;
const accentColor = "#f472b6";
const bgColor = "#110812";

function ThankYouSlide({ activeSlide }: { activeSlide: number }) {
  const slideIndex = slides.length;
  const slideNumber = String(slideIndex + 1).padStart(2, "0");

  return (
    <section data-background-color={bgColor} data-transition="slide">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
          padding: "2.5rem 3.5rem",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          transform: "scaleX(-1)",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "30%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
            transform: "translate(50%, -50%)",
            pointerEvents: "none",
          }}
        />

        {/* Left panel */}
        <div
          style={{
            flex: "0 0 370px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: accentColor,
              fontFamily: "monospace",
            }}
          >
            {slideNumber} / {String(TOTAL_SLIDES).padStart(2, "0")}
          </div>

          <div style={{ fontSize: "3rem", lineHeight: 1 }}>GIF</div>

          <h2
            style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Thank You
          </h2>

          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: accentColor,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Topology in Everyday Life
          </div>

          <div
            style={{
              marginTop: "0.2rem",
              padding: "0.8rem 1rem",
              borderRadius: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "9999px",
                  background: `${accentColor}20`,
                  border: `1px solid ${accentColor}40`,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: accentColor,
                  fontFamily: "monospace",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>tunnels</span> = ∞
              </span>
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "monospace",
                marginBottom: "0.5rem",
              }}
            >
              Eq: A mind bent in on itself
            </div>

            <p
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.45)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Coffee mugs, donuts, pants, and Klein bottles; topology is hiding in plain sight. Thanks for exploring it.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.3rem",
              padding: "0.45rem 0.8rem",
              borderRadius: "0.45rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
              Animated reference slide. Use arrow keys to navigate.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === activeSlide ? "1.8rem" : "0.45rem",
                  height: "0.35rem",
                  borderRadius: "9999px",
                  backgroundColor:
                    i === activeSlide ? accentColor : "rgba(255,255,255,0.12)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: "1 1 0",
            maxWidth: "720px",
            height: "78vh",
            maxHeight: "680px",
            minHeight: "300px",
            position: "relative",
            borderRadius: "1.2rem",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 40px ${accentColor}08`,
            background: bgColor,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={thankYouGifUrl}
            alt="Thank you"
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />

          {/* Top-right corner label */}
          <div
            style={{
              position: "absolute",
              top: "0.8rem",
              right: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.3rem 0.65rem",
              borderRadius: "0.35rem",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: "#4ade80",
                boxShadow: "0 0 5px #4ade80",
              }}
            />
            <span
              style={{
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "monospace",
              }}
            >
              Animated GIF
            </span>
          </div>

          {/* Top-left tunnels badge */}
          <div
            style={{
              position: "absolute",
              top: "0.8rem",
              left: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.3rem 0.65rem",
              borderRadius: "0.35rem",
              background: `${accentColor}18`,
              backdropFilter: "blur(10px)",
              border: `1px solid ${accentColor}30`,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: accentColor,
                fontFamily: "monospace",
              }}
            >
              TUNNELS ∞
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const deckRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revealRef = useRef<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!deckRef.current || revealRef.current) {
      return;
    }

    const deck = new Reveal(deckRef.current, {
      hash: false,
      controls: true,
      controlsLayout: "edges",
      progress: true,
      center: false,
      transition: "slide",
      backgroundTransition: "fade",
      width: "100%",
      height: "100%",
      margin: 0,
      minScale: 1,
      maxScale: 1,
      embedded: false,
      touch: true,
      loop: false,
      keyboard: true,
      overview: false,
    });

    deck.initialize().then(() => {
      revealRef.current = deck;
      setActiveSlide(0);

      deck.on(
        "slidechanged",
        ((event: Event & { indexh?: number }) => {
          setActiveSlide(event.indexh ?? 0);
        }) as EventListener
      );
    });

    return () => {
      if (revealRef.current) {
        try {
          revealRef.current.destroy();
        } catch {
          // ignore
        }
        revealRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <a
        href="#"
        className="absolute left-4 top-4 z-[200] rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-300"
      >
        All Projects
      </a>
      <div className="reveal" ref={deckRef}>
        <div className="slides">
          {slides.map((slide, index) => (
            <SlideFrame
              key={`${slide.title}-${index}`}
              slide={slide}
              index={index}
              activeSlide={activeSlide}
            />
          ))}
          <ThankYouSlide activeSlide={activeSlide} />
        </div>
      </div>
    </div>
  );
}
