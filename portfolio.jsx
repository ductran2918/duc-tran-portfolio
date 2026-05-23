// portfolio.jsx — Duc Tran personal portfolio
// Technical / dev-tool minimal. Single source for hero variants, card styles,
// and the small interactive surfaces (cmd palette, status bar, hover previews).

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Data ────────────────────────────────────────────────────────────────────

const SITE = {
  name: "Duc Tran",
  role: "Data Journalist",
  location: "Brooklyn, NY",
  tz: "America/New_York",
  tzOffset: -4,
  email: "duc@ductran.work",
  social: [
    { k: "github",     v: "ductran", href: "#" },
    { k: "x",          v: "@ductran", href: "#" },
    { k: "are.na",     v: "duc-tran", href: "#" },
    { k: "signal",     v: "available on request", href: "#" },
  ],
  about: [
    "I report on systems — housing, climate, money — with code and a notebook.",
    "Most days I'm scraping, modeling, or trying to convince a designer that a small multiple is fine, actually.",
    "Before journalism I worked in product. The pivot stuck.",
  ],
};

const WORK = [
  { from: "2024", to: "present", role: "Senior Data Reporter", org: "The Atlas",    note: "Investigations desk · longform + interactives" },
  { from: "2022", to: "2024",    role: "Data Journalist",      org: "Bloomberg",    note: "Markets data team · daily explainers" },
  { from: "2021", to: "2022",    role: "Newsroom Fellow",      org: "ProPublica",   note: "Local Reporting Network" },
  { from: "2019", to: "2021",    role: "Researcher",           org: "Pew Research", note: "Quantitative methods · survey design" },
  { from: "2017", to: "2019",    role: "Product Manager",      org: "Stitch",       note: "Civic-tech tooling for newsrooms" },
];

const PROJECTS = [
  {
    id: "evictions",
    no: "01",
    title: "Inside America's Eviction Machine",
    pub: "The Atlas",
    date: "2025-03",
    tag: "Investigation",
    blurb: "A national audit of 4.2M eviction filings across 31 court systems, exposing landlords who file the same case dozens of times to extract late fees.",
    metrics: [["filings", "4.2M"], ["counties", "1,840"], ["reading time", "21 min"]],
    stack: ["Python", "DuckDB", "Observable", "QGIS"],
    body: [
      "We obtained court records from 31 jurisdictions — most in PDF, some via FOIA, one mailed in on a USB stick — and resolved 4.2M filings to individual landlords using fuzzy name matching against state LLC registries.",
      "The investigation surfaced a pattern of 'serial filing': landlords who use eviction court as a debt-collection rail, often filing and dismissing the same tenant ten or more times in a year.",
      "Tools: pdfplumber + camelot for extraction, duckdb for joins on a single laptop, Observable Plot for the small-multiple lockup.",
    ],
    impact: ["Cited in 3 state legislative hearings", "Won SOPA 2025 — Public Service", "Methodology repo: 1.4k stars"],
  },
  {
    id: "heat",
    no: "02",
    title: "Fifty Summers of Heat",
    pub: "Bloomberg Green",
    date: "2024-08",
    tag: "Climate · Interactive",
    blurb: "A scrollable, fifty-year temperature record for any U.S. ZIP, built on 2.1B station-day readings.",
    metrics: [["readings", "2.1B"], ["ZIPs", "41,683"], ["p95 latency", "120ms"]],
    stack: ["DuckDB-WASM", "D3", "Mapbox", "Cloudflare"],
    body: [
      "The hard part was making 50 years of NOAA hourly data feel like nothing. We pre-aggregated to ZIP × week, shipped a 38MB DuckDB-WASM file, and let the browser query it on the fly.",
      "Heat anomalies render as a horizon chart — the same visual grammar you'd use for sleep tracking, applied to a planet warming.",
      "I co-wrote the methodology with NOAA's climate division and open-sourced the ZIP-day aggregates under CC0.",
    ],
    impact: ["100M+ page views in launch week", "Adopted by 8 local newsrooms", "ONA finalist · Excellence in Visual Digital Storytelling"],
  },
  {
    id: "money",
    no: "03",
    title: "Where the Soft Money Went",
    pub: "ProPublica",
    date: "2023-11",
    tag: "Money in Politics",
    blurb: "Tracing 501(c)(4) transfers across 600,000 IRS filings to map the 'dark money' graph for the 2022 midterms.",
    metrics: [["filings", "612k"], ["entities", "84k"], ["edges", "311k"]],
    stack: ["Neo4j", "Pandas", "Sigma.js", "Datasette"],
    body: [
      "We treated every grant disbursement on a Schedule I as a directed edge between nonprofits and walked the graph backward from the seven largest political spenders.",
      "Most of the money flowed through three 'pass-through' c4s with no public-facing programming. We named them.",
      "Published an open Datasette so other reporters could query the same graph for their state.",
    ],
    impact: ["Bylines in 14 partner outlets", "IRS Form 990 schedule revisions referenced the work", "Datasette: 9k queries in first month"],
  },
  {
    id: "migration",
    no: "04",
    title: "Atlas of Internal Migration",
    pub: "Side project",
    date: "2023-02",
    tag: "Mapping · R&D",
    blurb: "A flow map of 380M county-to-county moves from IRS SOI data, 2010 — 2022. No insights. Just a beautiful, honest picture.",
    metrics: [["moves", "380M"], ["counties", "3,143"], ["years", "12"]],
    stack: ["d3-geo", "GDAL", "WebGL", "Glitch"],
    body: [
      "A pure-craft project. I wanted to see whether the great American shuffling looked the way I'd been told it does. (Mostly it does. Sometimes it doesn't.)",
      "Rendered with custom WebGL since the SVG approach blew up around 60k edges. Open-sourced the rendering pipeline.",
      "Sometimes the most useful thing you can publish is a map without a thesis.",
    ],
    impact: ["Featured in Information is Beautiful", "Used in 4 university curricula", "Github: 2.3k stars"],
  },
];

const FONT_PAIRS = {
  "inter-jb":   { sans: "'Inter', ui-sans-serif, system-ui, sans-serif",       mono: "'JetBrains Mono', ui-monospace, monospace", display: "'Inter', sans-serif",       label: "Inter / JetBrains" },
  "plex":       { sans: "'IBM Plex Sans', system-ui, sans-serif",              mono: "'IBM Plex Mono', ui-monospace, monospace",  display: "'IBM Plex Sans', sans-serif", label: "IBM Plex" },
  "geist":      { sans: "'Inter', ui-sans-serif, system-ui, sans-serif",       mono: "'Geist Mono', ui-monospace, monospace",     display: "'Inter', sans-serif",       label: "Inter / Geist Mono" },
  "instrument": { sans: "'Inter', ui-sans-serif, system-ui, sans-serif",       mono: "'JetBrains Mono', ui-monospace, monospace", display: "'Instrument Serif', serif", label: "Instrument Serif" },
};

const ACCENTS = ["#86f4b6", "#7cc7ff", "#ffb86b", "#ff7ab8", "#e5e5e5"];

// ── Hooks ───────────────────────────────────────────────────────────────────

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return pos;
}

function useHotkey(matcher, handler) {
  useEffect(() => {
    const fn = (e) => { if (matcher(e)) { e.preventDefault(); handler(e); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [matcher, handler]);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, "0");
const fmtTime = (d, tz = SITE.tz) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false, timeZone: tz,
    }).format(d);
  } catch { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`; }
};

// ── Atoms ───────────────────────────────────────────────────────────────────

function SectionHead({ no, title, hint, idRef }) {
  return (
    <header id={idRef} style={{
      display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16,
      alignItems: "baseline", paddingBottom: 18, marginBottom: 28,
      borderBottom: ".5px solid var(--hair)",
    }}>
      <span className="mono small" style={{ color: "var(--faint)" }}>§ {no}</span>
      <h2 style={{
        margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: "-.01em",
      }}>{title}</h2>
      {hint && <span className="mono small" style={{ color: "var(--faint)" }}>{hint}</span>}
    </header>
  );
}

function Spark({ values, w = 80, h = 22 }) {
  const max = Math.max(...values), min = Math.min(...values);
  const span = (max - min) || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 2) + 1;
    const y = h - 2 - ((v - min) / span) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden>
      <line className="axis" x1="0" x2={w} y1={h-1} y2={h-1} />
      <path d={`M ${pts.replace(/ /g, " L ")}`} />
    </svg>
  );
}

// Hand-drawn-ish placeholder for project hover preview.
function ProjectPreview({ id }) {
  const seed = id.charCodeAt(0) + id.length * 7;
  const rng = (i) => ((Math.sin(seed * 999 + i) + 1) / 2);
  const series = useMemo(() => Array.from({ length: 48 }, (_, i) => rng(i)), [id]);
  return (
    <div className="preview-ph mono small" style={{
      borderRadius: 4, padding: "12px 14px",
      border: ".5px solid var(--hair)",
      aspectRatio: "16/10",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
        <span>preview.png</span>
        <span>1840×1150</span>
      </div>
      <svg viewBox="0 0 200 80" style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
        <defs>
          <pattern id={`hatch-${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y="0" x2="0" y2="6" stroke="var(--accent)" strokeWidth="1" opacity=".45" />
          </pattern>
        </defs>
        <path d={`M0,80 ${series.map((v,i)=>`L ${(i/(series.length-1))*200},${80 - v*70}`).join(" ")} L 200,80 Z`} fill={`url(#hatch-${id})`} />
        <path d={`M0,${80 - series[0]*70} ${series.map((v,i)=>`L ${(i/(series.length-1))*200},${80 - v*70}`).join(" ")}`}
              fill="none" stroke="var(--fg)" strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
        <span>↳ figure_03</span>
        <span>plot.svg</span>
      </div>
    </div>
  );
}

// ── Top bar ─────────────────────────────────────────────────────────────────

function TopBar({ onCmdK, theme, onTheme }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      backdropFilter: "blur(8px) saturate(140%)",
      WebkitBackdropFilter: "blur(8px) saturate(140%)",
      background: "color-mix(in oklab, var(--bg) 80%, transparent)",
      borderBottom: ".5px solid var(--hair)",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        padding: "12px 32px",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <a href="#top" className="mono" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Mark />
          <span style={{ fontWeight: 500, fontSize: 13 }}>duc.tran</span>
          <span style={{ color: "var(--faint)", fontSize: 12 }}>/ portfolio</span>
        </a>
        <nav className="mono" style={{ display: "flex", gap: 18, marginLeft: "auto", fontSize: 12 }}>
          {[["about","#about"],["work","#work"],["projects","#projects"],["contact","#contact"]].map(([l,h]) => (
            <a key={l} href={h} style={{ color: "var(--muted)", textDecoration: "none" }}
               onMouseEnter={(e)=>e.currentTarget.style.color="var(--fg)"}
               onMouseLeave={(e)=>e.currentTarget.style.color="var(--muted)"}>{l}</a>
          ))}
        </nav>
        <button onClick={onCmdK} className="mono" style={{
          appearance: "none", border: ".5px solid var(--hair-strong)", background: "transparent",
          color: "var(--muted)", padding: "5px 10px", borderRadius: 4, fontSize: 11,
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          fontFamily: "var(--font-mono)",
        }}>
          <span>search</span>
          <kbd style={{
            fontFamily: "var(--font-mono)", fontSize: 10, padding: "1px 5px",
            border: ".5px solid var(--hair-strong)", borderRadius: 3, color: "var(--faint)",
          }}>⌘K</kbd>
        </button>
        <button onClick={onTheme} aria-label="toggle theme" style={{
          appearance: "none", background: "transparent", border: ".5px solid var(--hair-strong)",
          color: "var(--muted)", borderRadius: 4, width: 28, height: 26, cursor: "pointer",
          display: "grid", placeItems: "center", fontSize: 11,
        }}>{theme === "dark" ? "☾" : "☀"}</button>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <rect x="1.5" y="1.5" width="17" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M5 14 L10 5 L15 14" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="miter" />
      <line x1="6.8" y1="11.4" x2="13.2" y2="11.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// ── Hero variants ───────────────────────────────────────────────────────────

function HeroStacked({ now }) {
  return (
    <section id="top" style={{ paddingTop: 84, paddingBottom: "var(--section-y)" }}>
      <div className="mono small reveal" data-d="0" style={{ color: "var(--faint)", display: "flex", gap: 12, marginBottom: 28 }}>
        <span>~/portfolio</span>
        <span>·</span>
        <span>v2026.05</span>
        <span>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="pulse-dot" /> available · q3 2026
        </span>
      </div>
      <h1 className="reveal" data-d="1" style={{
        margin: 0, fontFamily: "var(--font-display)",
        fontSize: "clamp(56px, 9vw, 116px)",
        lineHeight: 0.95, letterSpacing: "-.035em", fontWeight: 500,
      }}>Duc Tran.</h1>
      <p className="reveal" data-d="2" style={{
        margin: "20px 0 0", fontSize: 22, color: "var(--muted)", maxWidth: 640,
        lineHeight: 1.4, letterSpacing: "-.01em",
      }}>
        Data journalist. I report on housing, climate, and money with a
        notebook in one hand and a query planner in the other.
      </p>
      <div className="mono small reveal" data-d="3" style={{
        marginTop: 44, display: "flex", gap: 32, color: "var(--muted)", flexWrap: "wrap",
      }}>
        <KV k="based" v={SITE.location} />
        <KV k="local" v={<span className="tnum">{fmtTime(now)}</span>} />
        <KV k="reach" v={<a href={`mailto:${SITE.email}`} style={{ color: "var(--fg)", textDecoration: "underline", textUnderlineOffset: 4 }}>{SITE.email}</a>} />
      </div>
    </section>
  );
}

function HeroSplit({ now }) {
  return (
    <section id="top" style={{ paddingTop: 84, paddingBottom: "var(--section-y)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 60, alignItems: "end" }}>
        <div>
          <div className="mono small reveal" data-d="0" style={{ color: "var(--faint)", marginBottom: 28, display: "flex", gap: 10 }}>
            <span className="pulse-dot" />
            <span>available · q3 2026</span>
          </div>
          <h1 className="reveal" data-d="1" style={{
            margin: 0, fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 6.5vw, 88px)", lineHeight: 0.95,
            letterSpacing: "-.035em", fontWeight: 500,
          }}>
            Duc Tran<br/>
            <span style={{ color: "var(--muted)" }}>Data journalist.</span>
          </h1>
        </div>
        <aside className="mono small reveal" data-d="2" style={{
          color: "var(--muted)", borderLeft: ".5px solid var(--hair)", paddingLeft: 24,
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <KV k="role" v={SITE.role} />
          <KV k="based" v={SITE.location} />
          <KV k="utc" v={`${SITE.tzOffset >= 0 ? "+" : ""}${SITE.tzOffset}`} />
          <KV k="local" v={<span className="tnum">{fmtTime(now)}</span>} />
          <KV k="email" v={SITE.email} />
        </aside>
      </div>
    </section>
  );
}

function HeroTerminal({ now }) {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    const script = [
      "$ whoami",
      "duc.tran",
      "$ cat ./bio.txt",
      "Duc Tran — Data Journalist.",
      "Housing · Climate · Money · Maps.",
      "$ status --availability",
      "● available · q3 2026 · open to brief contracts and full-time.",
      "$ contact",
      `mail: ${SITE.email}    based: ${SITE.location}`,
      "$ _",
    ];
    let i = 0, id;
    const tick = () => {
      setLines((prev) => [...prev, script[i]]);
      i++;
      if (i < script.length) id = setTimeout(tick, 220 + Math.random() * 180);
    };
    id = setTimeout(tick, 280);
    return () => clearTimeout(id);
  }, []);
  return (
    <section id="top" style={{ paddingTop: 84, paddingBottom: "var(--section-y)" }}>
      <div className="mono" style={{
        background: "var(--panel)", border: ".5px solid var(--hair)",
        borderRadius: 6, padding: "18px 22px", fontSize: 14, lineHeight: 1.65,
        maxWidth: 720,
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Dot c="#ff5f57" /><Dot c="#febc2e" /><Dot c="#28c840" />
          <span style={{ marginLeft: 12, color: "var(--faint)", fontSize: 11 }}>~/duc-tran — zsh</span>
        </div>
        {lines.map((l, i) => {
          const isCmd = l.startsWith("$");
          const isStatus = l.startsWith("●");
          const last = i === lines.length - 1;
          return (
            <div key={i} style={{ color: isCmd ? "var(--muted)" : isStatus ? "var(--accent)" : "var(--fg)" }}>
              {l === "$ _" ? <span style={{ color: "var(--muted)" }}>$ </span> : null}
              {l === "$ _" ? <span className="blink" /> : l}
            </div>
          );
        })}
      </div>
      <div className="mono small" style={{ marginTop: 24, color: "var(--faint)", display: "flex", gap: 16 }}>
        <span>local <span className="tnum">{fmtTime(now)}</span></span>
        <span>·</span>
        <span>scroll to continue ↓</span>
      </div>
    </section>
  );
}

function Dot({ c }) { return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: c }} />; }
function KV({ k, v }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ color: "var(--faint)" }}>{k}</span>
      <span style={{ color: "var(--fg)" }}>{v}</span>
    </span>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" style={{ paddingBottom: "var(--section-y)" }}>
      <SectionHead no="01" title="About" hint="3 paragraphs · 38s read" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 16, lineHeight: 1.6, maxWidth: 540 }}>
          {SITE.about.map((p, i) => <p key={i} style={{ margin: 0, textWrap: "pretty" }}>{p}</p>)}
        </div>
        <div className="mono small" style={{ color: "var(--muted)", display: "flex", flexDirection: "column", gap: "var(--row-y)" }}>
          <AboutRow k="stack" v="Python · DuckDB · Observable · SQL · QGIS · R" />
          <AboutRow k="writes for" v="The Atlas · Bloomberg · ProPublica" />
          <AboutRow k="speaking" v="NICAR 2024, 2025 · SRCCON 2024" />
          <AboutRow k="teaching" v="CUNY Newmark · Data Reporting (Spring '26)" />
          <AboutRow k="prizes" v="SOPA · ONA finalist · IRE honorable mention" />
        </div>
      </div>
    </section>
  );
}

function AboutRow({ k, v }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "100px 1fr", gap: 14,
      paddingBottom: "var(--row-y)", borderBottom: ".5px solid var(--hair)",
    }}>
      <span style={{ color: "var(--faint)" }}>{k}</span>
      <span style={{ color: "var(--fg)" }}>{v}</span>
    </div>
  );
}

function Work() {
  return (
    <section id="work" style={{ paddingBottom: "var(--section-y)" }}>
      <SectionHead no="02" title="Work" hint="5 positions · 9 years" />
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {WORK.map((w, i) => (
          <li key={i} style={{
            display: "grid",
            gridTemplateColumns: "140px 1.4fr 1fr",
            gap: 24, alignItems: "baseline",
            padding: "calc(var(--row-y) + 6px) 0",
            borderBottom: ".5px solid var(--hair)",
            transition: "background .2s",
            cursor: "default",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--panel)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span className="mono small tnum" style={{ color: "var(--muted)" }}>
              {w.from} → {w.to}
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{w.role}</div>
              <div className="mono small" style={{ color: "var(--muted)", marginTop: 2 }}>{w.org}</div>
            </div>
            <span className="small" style={{ color: "var(--muted)", textAlign: "right" }}>{w.note}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Projects ────────────────────────────────────────────────────────────────

function ProjectCard({ p, open, onToggle, style }) {
  const sharedHeader = (
    <header
      onClick={onToggle}
      style={{
        cursor: "pointer", userSelect: "none",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 18, alignItems: "baseline", padding: "20px 0",
      }}
    >
      <span className="mono small tnum" style={{ color: "var(--faint)" }}>{p.no}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-.005em", display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          {p.title}
          <span className="mono small" style={{ color: "var(--accent)" }}>· {p.tag}</span>
        </div>
        <div className="mono small" style={{ color: "var(--muted)", marginTop: 4, display: "flex", gap: 12 }}>
          <span>{p.pub}</span><span>·</span><span className="tnum">{p.date}</span>
        </div>
      </div>
      <span className="mono small" style={{ color: "var(--muted)", transition: "transform .25s" }}>
        {open ? "[ collapse ]" : "[ read ]"}
      </span>
    </header>
  );

  return (
    <article style={{
      borderBottom: ".5px solid var(--hair)",
      ...(style === "card" ? {
        border: ".5px solid var(--hair)", borderRadius: 6,
        padding: "0 22px", marginBottom: 12, background: open ? "var(--panel)" : "transparent",
      } : {}),
    }}>
      {sharedHeader}
      <div className="card-body-wrap" data-open={open ? "1" : "0"}>
        <div>
          <div style={{ paddingBottom: 28 }}>
            <ProjectBody p={p} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectBody({ p }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
      <div>
        <p style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.55, color: "var(--fg)", textWrap: "pretty" }}>{p.blurb}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
          {p.body.map((b, i) => <p key={i} style={{ margin: 0, textWrap: "pretty" }}>{b}</p>)}
        </div>
        <div className="label" style={{ marginTop: 28, marginBottom: 10 }}>Impact</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {p.impact.map((it, i) => (
            <li key={i} className="mono small" style={{ color: "var(--muted)", display: "flex", gap: 10 }}>
              <span style={{ color: "var(--accent)" }}>↳</span>{it}
            </li>
          ))}
        </ul>
      </div>
      <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <ProjectPreview id={p.id} />
        <div>
          <div className="label" style={{ marginBottom: 8 }}>By the numbers</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {p.metrics.map(([k, v], i) => (
              <div key={i} style={{ padding: "10px 12px", border: ".5px solid var(--hair)", borderRadius: 4 }}>
                <div className="mono tnum" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
                <div className="mono small" style={{ color: "var(--muted)", marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Stack</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {p.stack.map((s) => (
              <span key={s} className="mono small" style={{
                padding: "3px 8px", border: ".5px solid var(--hair)", borderRadius: 3, color: "var(--muted)",
              }}>{s}</span>
            ))}
          </div>
        </div>
        <a href="#" className="mono small" style={{
          color: "var(--fg)", textDecoration: "underline", textUnderlineOffset: 4,
        }}>read the full piece →</a>
      </aside>
    </div>
  );
}

function ProjectsGrid({ openId, onToggle }) {
  // Compact 2x2 grid card style — no inline expand; opens the inline panel below.
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--hair)", border: ".5px solid var(--hair)", borderRadius: 6, overflow: "hidden" }}>
      {PROJECTS.map((p) => (
        <button key={p.id} onClick={() => onToggle(p.id)} style={{
          appearance: "none", border: 0, textAlign: "left",
          padding: 24, background: openId === p.id ? "var(--panel)" : "var(--bg)",
          cursor: "pointer", display: "flex", flexDirection: "column", gap: 16,
          color: "inherit", minHeight: 240,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="mono small" style={{ color: "var(--faint)" }}>{p.no}</span>
            <span className="mono small" style={{ color: "var(--accent)" }}>{p.tag}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.25, letterSpacing: "-.01em" }}>{p.title}</div>
          <div className="mono small" style={{ color: "var(--muted)", marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
            <span>{p.pub}</span>
            <span className="tnum">{p.date}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Projects({ cardStyle }) {
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId((cur) => cur === id ? null : id);

  if (cardStyle === "grid") {
    const openP = PROJECTS.find(p => p.id === openId);
    return (
      <section id="projects" style={{ paddingBottom: "var(--section-y)" }}>
        <SectionHead no="03" title="Selected work" hint={`${PROJECTS.length} pieces · 2023 — 2025`} />
        <ProjectsGrid openId={openId} onToggle={toggle} />
        <div className="card-body-wrap" data-open={openId ? "1" : "0"} style={{ marginTop: openId ? 24 : 0 }}>
          <div>{openP && <div style={{ padding: "8px 0" }}><ProjectBody p={openP} /></div>}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" style={{ paddingBottom: "var(--section-y)" }}>
      <SectionHead no="03" title="Selected work" hint={`${PROJECTS.length} pieces · 2023 — 2025`} />
      <div style={{ borderTop: cardStyle === "list" ? ".5px solid var(--hair)" : 0 }}>
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} p={p} open={openId === p.id} onToggle={() => toggle(p.id)} style={cardStyle} />
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" style={{ paddingBottom: "var(--section-y)" }}>
      <SectionHead no="04" title="Contact" hint="ping anytime" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
        <p style={{ margin: 0, fontSize: 22, lineHeight: 1.4, letterSpacing: "-.01em", textWrap: "pretty" }}>
          The fastest way to reach me is email. I read everything, reply to most things within 48 hours, and answer cold pitches that mention a dataset by name.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--row-y)" }}>
          <ContactRow k="email" v={SITE.email} href={`mailto:${SITE.email}`} />
          {SITE.social.map((s) => (
            <ContactRow key={s.k} k={s.k} v={s.v} href={s.href} />
          ))}
          <ContactRow k="resume" v="duc-tran-cv-2026.pdf  ↗" href="#" />
        </ul>
      </div>
    </section>
  );
}

function ContactRow({ k, v, href }) {
  return (
    <li style={{
      display: "grid", gridTemplateColumns: "110px 1fr", gap: 14,
      paddingBottom: "var(--row-y)", borderBottom: ".5px solid var(--hair)",
    }}>
      <span className="mono small" style={{ color: "var(--faint)" }}>{k}</span>
      <a href={href} className="mono small" style={{ color: "var(--fg)", textDecoration: "underline", textUnderlineOffset: 4 }}>{v}</a>
    </li>
  );
}

Object.assign(window, {
  SectionHead, Spark, TopBar, HeroStacked, HeroSplit, HeroTerminal,
  About, Work, Projects, Contact, KV, FONT_PAIRS, ACCENTS, SITE,
  useNow, useCursor, useHotkey, fmtTime,
});
