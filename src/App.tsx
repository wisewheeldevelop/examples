import { useEffect, useRef, useState } from "react";
import { BestsellersBookShowcase, BookshelfScene, Gallery } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

type AgentDeck = "filmstrip" | "wave";

const NAV = [
  { id: "agents", label: "Agents" },
  { id: "manifesto", label: "Manifesto" },
  { id: "imagegen", label: "Image Gen" },
  { id: "library", label: "Library" },
];

const STACK = [
  { name: "Claude Code", role: "The quiet terminal", note: "Long-context reasoning, repo-wide edits" },
  { name: "Codex", role: "The agentic engineer", note: "Autonomous task execution" },
  { name: "Cursor", role: "The augmented editor", note: "Inline generation at the cursor" },
];

/**
 * The hero is a same-origin landing page whose packaged HTML is kept byte-exact,
 * so its authored copy is rewritten on the loaded DOM instead of in the asset.
 */
const HERO_TITLE = "Naor AI Power Tool";

const HERO_COPY: ReadonlyArray<readonly [string, string]> = [
  ["Field Manuals", "Naor Models"],
  ["Field Manual", "Naor Model"],
  ["Field Notes", "Naor Notes"],
  ["The Collection", "The Roster"],
  ["Tools for Thought", "Naor AI Power Tool"],
];

function useHeroBrand(hostRef: React.RefObject<HTMLDivElement | null>, brand: string) {
  useEffect(() => {
    let settled = 0;

    /** One pass over the frame's text nodes. False while the document is absent. */
    const sweep = () => {
      const doc = hostRef.current?.querySelector("iframe")?.contentDocument;
      if (!doc?.body) return false;

      const mark = doc.querySelector<HTMLElement>("a.brand");
      if (mark && mark.textContent !== brand) mark.textContent = brand;

      // <title> lives in <head>, outside the body walk below.
      if (doc.title !== HERO_TITLE) doc.title = HERO_TITLE;

      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const original = node.nodeValue;
        if (!original) continue;
        let next = original;
        for (const [from, to] of HERO_COPY) next = next.split(from).join(to);
        if (next !== original) node.nodeValue = next;
      }
      return doc.readyState === "complete";
    };

    // The hero document is ~3.5 MB and mounts its covers well after body exists,
    // so keep sweeping until it reports complete, then a few passes beyond that.
    const timer = window.setInterval(() => {
      if (sweep() && ++settled >= 4) window.clearInterval(timer);
    }, 400);
    const stop = window.setTimeout(() => window.clearInterval(timer), 30000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [hostRef, brand]);
}

/**
 * The agent decks and the manifesto are authored documents rebranded ahead of
 * time by scripts/build-naor-assets.mjs and served from public/naor. They are
 * sandboxed exactly as upstream does: scripts only, no same-origin access.
 */
function NaorFrame({ src, title, background }: { src: string; title: string; background: string }) {
  return (
    <iframe
      src={src}
      title={title}
      sandbox="allow-scripts"
      style={{
        position: "absolute",
        inset: 0,
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background,
      }}
    />
  );
}

/**
 * Full-bleed renderer frame.
 *
 * Every renderer here traps touch: the decks set `touch-action: none` on a
 * stage that fills the iframe, the bookshelf does the same on its canvas and
 * OrbitControls preventDefaults, and the hero page sets
 * `overscroll-behavior: contain`. Stacked as full-height sections that leaves a
 * phone with nowhere to start a scroll, so on coarse pointers the frame's
 * contents are inert and the page scrolls normally. Interactive frames offer an
 * explicit opt-in that hands touch back to the renderer.
 */
function Frame({
  variant,
  live,
  onToggle,
  frameRef,
  children,
}: {
  variant: string;
  live?: boolean;
  onToggle?: () => void;
  frameRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div ref={frameRef} className={`frame ${variant} ${live ? "frame--live" : ""}`}>
      {children}
      {onToggle && (
        <button type="button" className="frame__toggle" onClick={onToggle}>
          {live ? "Done" : "Tap to interact"}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [deck, setDeck] = useState<AgentDeck>("filmstrip");
  // The hero landing page carries its own header, so ours only appears past it.
  const [navShown, setNavShown] = useState(false);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => () => setLiveFrame((cur) => (cur === id ? null : id));

  useHeroBrand(heroRef, "NAOR·BRAIN AI");

  useEffect(() => {
    const onScroll = () => setNavShown(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`nav ${navShown ? "nav--shown" : ""}`}>
        <a className="nav__mark" href="#top">
          NAOR<span>·</span>BRAIN<em>AI</em>
        </a>
        <nav className="nav__links">
          {NAV.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>
        <a className="nav__cta" href="#library">
          Get access
        </a>
      </header>

      {/* HERO */}
      <section className="section" id="top">
        <div className="hero">
          <Frame variant="frame--hero" frameRef={heroRef}>
            <BestsellersBookShowcase
              headingFont="iowan-old-style"
              bodyFont="iowan-old-style"
              headingWeight="500"
              bodyWeight="400"
              primaryColor="#c3a47b"
              headingSize={325}
              bodySize={17}
              headingLetterSpacing={-0.085}
            />
          </Frame>
          <div className="hero__plate">
            <p className="hero__kicker">Naor AI Power Tool</p>
            <p className="hero__sub">The operator's shelf — every agent Naor runs, in one place.</p>
          </div>
        </div>
      </section>

      {/* TOOLCHAIN */}
      <section className="section stack">
        <p className="section__eyebrow">The toolchain</p>
        <ol className="stack__grid">
          {STACK.map((t, i) => (
            <li key={t.name} className="stack__item">
              <span className="stack__idx">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="stack__name">{t.name}</h3>
              <p className="stack__role">{t.role}</p>
              <p className="stack__note">{t.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* AGENTS */}
      <section className="section section--alt" id="agents">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">01 — The models</p>
            <h2 className="section__title">Pick your Naor Agent</h2>
          </div>
          <div className="switch" role="group" aria-label="Agent deck layout">
            {(["filmstrip", "wave"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={deck === v} onClick={() => setDeck(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <Frame
          variant={deck === "wave" ? "frame--tall" : "frame--wide"}
          live={liveFrame === "agents"}
          onToggle={toggle("agents")}
        >
          <NaorFrame
            key={deck}
            src={deck === "wave" ? "/naor/agents-wave.html" : "/naor/agents-filmstrip.html"}
            title={`Naor AI agent ${deck}`}
            background={deck === "wave" ? "#121212" : "#d8c9ad"}
          />
        </Frame>
      </section>

      {/* MANIFESTO */}
      <section className="section" id="manifesto">
        <Frame variant="frame--band">
          <NaorFrame src="/naor/manifesto.html" title="Naor Brain AI — Power Tool" background="#000" />
        </Frame>
      </section>

      {/* IMAGE GEN */}
      <section className="section section--alt" id="imagegen">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">02 — Generation</p>
            <h2 className="section__title section__title--wide">NAOR AI IMAGE GEN</h2>
          </div>
          <p className="section__note">
            A drifting wall of plates, every one of them generated by Naor AI.
          </p>
        </div>
        {/* The Gallery ships pointer-events:none — an ambient wall, not interactive. */}
        <Frame variant="frame--tall">
          <Gallery speed={1} scale={1} opacity={1} />
        </Frame>
      </section>

      {/* LIBRARY */}
      <section className="section" id="library">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">03 — The library</p>
            <h2 className="section__title">Ten volumes, one brain</h2>
          </div>
          <p className="section__note">
            Claude Code, Codex and Cursor, bound as Naor volumes. Pull a spine off the shelf to
            open it.
          </p>
        </div>
        <Frame variant="frame--tall" live={liveFrame === "library"} onToggle={toggle("library")}>
          <BookshelfScene />
        </Frame>
      </section>

      <footer className="footer">
        <div className="footer__mark">
          NAOR<span>·</span>BRAIN<em>AI</em>
        </div>
        <p className="footer__line">
          Naor AI Power Tool — an operator's console for Claude Code, Codex and Cursor.
        </p>
        <p className="footer__line footer__line--dim">© 2026 Naor AI. All rights reserved.</p>
      </footer>
    </>
  );
}
