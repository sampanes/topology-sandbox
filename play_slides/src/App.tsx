import { useEffect, useRef, useState } from "react";
import Reveal from "reveal.js";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";
import {
  coffeeGlbUrl,
  kleinBottleGifUrl,
  mobiusStripGifUrl,
  pantsGlbUrl,
  shoeGlbUrl,
  tshirtGlbUrl,
  tubeTorusGifUrl,
} from "./assetPaths";
import ThreeScene, { type ThreeSceneSource } from "./components/ThreeScene";

interface TopologyInfo {
  genus: number;
  boundaries: number;
  boundaryLabels: string[];
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
    title: "Shoe",
    subtitle: "Used Here as a Sock Stand-In",
    bgColor: "#080e1a",
    accentColor: "#6366f1",
    icon: "Shoe",
    topology: {
      genus: 0,
      boundaries: 1,
      boundaryLabels: ["Ankle opening"],
      description:
        "Like a sock, a shoe shell is organized around a main entry opening and a closed distal end. For this presentation it serves as the imported stand-in for the sock slide.",
      equivalent: "Disk-like surface with 1 boundary",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: shoeGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "Pants",
    subtitle: "Three Openings, Zero Handles",
    bgColor: "#060d1f",
    accentColor: "#3b82f6",
    icon: "Pant",
    topology: {
      genus: 0,
      boundaries: 3,
      boundaryLabels: ["Waist", "Left ankle", "Right ankle"],
      description:
        "A pair of pants has three boundary openings and no handle. It is the classic pair-of-pants surface in topology.",
      equivalent: "Genus 0 surface with 3 boundaries",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: pantsGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "T-Shirt",
    subtitle: "Four Openings, Still Genus Zero",
    bgColor: "#150808",
    accentColor: "#ef4444",
    icon: "Shirt",
    topology: {
      genus: 0,
      boundaries: 4,
      boundaryLabels: ["Neck", "Bottom hem", "Left sleeve", "Right sleeve"],
      description:
        "A shirt has four boundary openings but still no tunnel through the surface, so its genus remains 0.",
      equivalent: "Genus 0 surface with 4 boundaries",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: tshirtGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "Coffee Mug",
    subtitle: "The Classic Genus-1 Surface",
    bgColor: "#100e08",
    accentColor: "#f59e0b",
    icon: "Mug",
    topology: {
      genus: 1,
      boundaries: 1,
      boundaryLabels: ["Top opening"],
      description:
        "The handle creates a tunnel through the surface, making the mug genus 1. It is topologically equivalent to a torus with one boundary.",
      equivalent: "Torus with 1 boundary (genus 1)",
    },
    media: {
      kind: "3d",
      source: { kind: "gltf", url: coffeeGlbUrl },
      cornerLabel: "Imported GLB",
    },
  },
  {
    title: "Mobius Strip",
    subtitle: "One-Sided Surface Animation",
    bgColor: "#0d0817",
    accentColor: "#c084fc",
    icon: "GIF",
    topology: {
      genus: 0,
      boundaries: 1,
      boundaryLabels: ["Single edge loop"],
      description:
        "The Mobius strip is non-orientable and has only one boundary component. The animation is useful for showing how the surface twists back into itself.",
      equivalent: "Non-orientable strip with 1 boundary",
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
    title: "Klein Bottle",
    subtitle: "Immersed Non-Orientable Surface",
    bgColor: "#071019",
    accentColor: "#22d3ee",
    icon: "GIF",
    topology: {
      genus: 2,
      boundaries: 0,
      boundaryLabels: ["Closed surface"],
      description:
        "The Klein bottle cannot be embedded in ordinary 3D space without self-intersection, so the GIF is useful here as a conceptual visualization.",
      equivalent: "Closed non-orientable surface",
    },
    media: {
      kind: "image",
      src: kleinBottleGifUrl,
      alt: "Klein bottle animation",
      fit: "contain",
      cornerLabel: "Animated GIF",
    },
  },
  {
    title: "Tube to Torus",
    subtitle: "Boundary Closure Animation",
    bgColor: "#101008",
    accentColor: "#a3e635",
    icon: "GIF",
    topology: {
      genus: 1,
      boundaries: 0,
      boundaryLabels: ["Closed loop"],
      description:
        "This animation shows a cylindrical tube closing into a torus, which is a useful visual bridge from boundary-count thinking into genus thinking.",
      equivalent: "Torus (genus 1, closed surface)",
    },
    media: {
      kind: "image",
      src: tubeTorusGifUrl,
      alt: "Tube to torus animation",
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
            {slideNumber} / {String(slides.length).padStart(2, "0")}
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
                <span style={{ fontSize: "0.9rem" }}>g</span> = {slide.topology.genus}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "monospace",
                }}
              >
                b = {slide.topology.boundaries}
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

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.3rem",
                marginBottom: "0.5rem",
              }}
            >
              {slide.topology.boundaryLabels.map((label, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.3rem",
                    background: `${slide.accentColor}15`,
                    fontSize: "0.65rem",
                    color: slide.accentColor,
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: slide.accentColor,
                      display: "inline-block",
                      boxShadow: `0 0 4px ${slide.accentColor}`,
                    }}
                  />
                  {label}
                </span>
              ))}
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
            {slides.map((_, i) => (
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
              GENUS {slide.topology.genus}
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace",
              }}
            >
              b {slide.topology.boundaries}
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
        </div>
      </div>
    </div>
  );
}
