// portfolio.jsx — Duc Tran personal portfolio
// Technical / dev-tool minimal. Single source for hero variants, card styles,
// and the small interactive surfaces (cmd palette, status bar, hover previews).

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Data ────────────────────────────────────────────────────────────────────

const SITE = {
  name: "Duc Tran",
  role: "Data Journalism Lead",
  location: "Ho Chi Minh City, Vietnam",
  tz: "Asia/Ho_Chi_Minh",
  tzOffset: +7,
  email: "ttvietduc@gmail.com",
  social: [
    { k: "linkedin", v: "ttvietduc",        href: "https://www.linkedin.com/in/ttvietduc" },
    { k: "github",   v: "ductran2918",       href: "https://github.com/ductran2918" },
    { k: "work",     v: "duc@techinasia.com", href: "mailto:duc@techinasia.com" },
    { k: "signal",   v: "available on request", href: "#" },
  ],
  about: [
    "I report on the Asian tech ecosystem — startups, venture capital, and the markets shaping them — with data at the center of every story.",
    "My path to data journalism ran through marketing, social listening, and three Vietnamese newsrooms: VNG's Zing News, Dân Trí, and VnExpress, where I helped pioneer data-driven storytelling in Vietnamese media.",
    "Now I'm Data Journalism Lead at Tech in Asia, building analyses that founders and VCs rely on. I also serve as President of the ABG Alumni Association (2025–26).",
  ],
};

const WORK = [
  { from: "2024", to: "present", role: "Data Journalism Lead",  org: "Tech in Asia",    note: "YC W15 · Asian tech & VC ecosystem" },
  { from: "2023", to: "2024",    role: "Data Journalist",       org: "VnExpress.net",   note: "Economy · demographics · technology" },
  { from: "2021", to: "2023",    role: "Reporter",              org: "Dân Trí",         note: "Economy desk · DBiz format launch" },
  { from: "2018", to: "2021",    role: "Reporter",              org: "VNG / Zing News", note: "Finance · banking · Financial Review" },
  { from: "2018", to: "2018",    role: "Research Executive",    org: "Buzzmetrics",     note: "Social listening · consumer perception" },
];

const PROJECTS = [
  {
    id: "metro",
    no: "01",
    title: "Ho Chi Minh City's Metro Moment",
    pub: "VnExpress.net",
    date: "2024-01",
    tag: "Urban · Data",
    blurb: "A data-driven portrait of Metro Line 1's 17-year journey to completion — tracking construction phases, budget overruns, and what it means for 9 million daily commuters.",
    metrics: [["years tracked", "17"], ["stations", "14"], ["km of line", "19.7"]],
    stack: ["Datawrapper", "Flourish", "Excel", "QGIS"],
    body: [
      "Metro Line 1 was more than an infrastructure story — it was a record of a city's patience. I assembled the full timeline of construction starts, delays, and funding gaps from public records, official reports, and MPI data.",
      "Visualizing the cost escalation as a layered timeline made the story legible: a project budgeted at $1.09B that grew to nearly $2.5B across nearly two decades of construction.",
      "The piece was recognized by VnExpress leadership at the newsroom's 23rd anniversary celebration as a standout data feature of the year.",
    ],
    impact: ["Recognized at VnExpress 23rd anniversary as standout data feature", "Economy section cover story", "Cited in subsequent urban planning coverage by peer outlets"],
  },
  {
    id: "fdi",
    no: "02",
    title: "Who's Actually Investing in Vietnam",
    pub: "VnExpress.net",
    date: "2024-06",
    tag: "Economy · Investment",
    blurb: "Mapping five years of FDI registration data to show which sectors and provinces attract capital — and where headline growth numbers obscure a more uneven picture.",
    metrics: [["years of data", "5"], ["provinces", "63"], ["sectors mapped", "21"]],
    stack: ["Python", "Datawrapper", "QGIS", "Excel"],
    body: [
      "I gathered and cross-referenced Ministry of Planning and Investment records, provincial reports, and enterprise registration data to build a picture of where foreign capital actually flows versus what the headlines claim.",
      "A key finding: manufacturing concentration in a handful of northern industrial zones masked persistent underdevelopment in the south-central region, even as headline FDI numbers climbed year-on-year.",
      "Recognized at VnExpress's 24th anniversary. The methodology was adopted by the Economy desk for quarterly FDI tracking going forward.",
    ],
    impact: ["Recognized at VnExpress 24th anniversary", "Methodology adopted for quarterly FDI tracking", "Shared widely by Vietnamese economics researchers"],
  },
  {
    id: "dbiz",
    no: "03",
    title: "DBiz: Reinventing the Economy Desk",
    pub: "Dân Trí",
    date: "2022-12",
    tag: "Format · Innovation",
    blurb: "Launched a new data-driven business journalism format at one of Vietnam's most established papers — a change management project as much as an editorial one.",
    metrics: [["award", "Innovative Team 2022"], ["tools rolled out", "2"], ["desk", "Economy"]],
    stack: ["Flourish", "Datawrapper", "Google Sheets"],
    body: [
      "Joining Dân Trí meant stepping into a newsroom with decades of entrenched habits. The Economy desk transformation was a chance to introduce data visualization as a first-class storytelling tool rather than an afterthought.",
      "I led the evaluation and adoption of Flourish and Datawrapper, trained colleagues, and advocated for making charts and interactives central to the Economy coverage — not decorative but load-bearing.",
      "DBiz launched as a new editorial format blending data analysis with business reporting. The Economy desk won 'Innovative Team of the Year' in 2022.",
    ],
    impact: ["Economy desk: Innovative Team of the Year 2022", "Flourish and Datawrapper adopted newsroom-wide", "DBiz format ran as a flagship series through 2023"],
  },
  {
    id: "asia-tech",
    no: "04",
    title: "Mapping the Asian Tech Ecosystem",
    pub: "Tech in Asia",
    date: "2025-01",
    tag: "VC · Startups",
    blurb: "Ongoing data journalism covering startup funding, founder trends, and the macro forces shaping venture capital across Southeast Asia and broader Asia.",
    metrics: [["markets tracked", "12+"], ["audience", "founders + VCs"], ["cadence", "ongoing"]],
    stack: ["Python", "SQL", "Datawrapper", "Flourish"],
    body: [
      "At Tech in Asia, the audience is different from a general news site — readers are operators and investors who will act on what they read. Every analysis needs to add real signal, not just repackage press releases.",
      "I compile, clean, and analyze funding data across the region, building visualizations and data stories that help readers benchmark, compare, and understand where capital is flowing and why.",
      "The work spans deal flow analysis, founder demographic research, sector deep-dives, and data products published as part of Tech in Asia's premium subscriber offering.",
    ],
    impact: ["Data products used by subscriber VCs and founders", "Core part of Tech in Asia's premium subscriber value", "17th National Press Awards — Consolation Prize (prior work)"],
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
          <span className="pulse-dot" /> open to collaborate · 2025
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
        Data journalism lead at Tech in Asia. I cover the Asian tech ecosystem
        with data, visualizations, and stories that founders and VCs actually use.
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
            <span>open to collaborate · 2025</span>
          </div>
          <h1 className="reveal" data-d="1" style={{
            margin: 0, fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 6.5vw, 88px)", lineHeight: 0.95,
            letterSpacing: "-.035em", fontWeight: 500,
          }}>
            Duc Tran<br/>
            <span style={{ color: "var(--muted)" }}>Data journalism lead.</span>
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
      "Duc Tran — Data Journalism Lead.",
      "Startups · Venture Capital · Asian Tech Ecosystem.",
      "$ status --current",
      "● Tech in Asia (YC W15) · open to collaborate",
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
      <SectionHead no="01" title="About" hint="3 paragraphs · 40s read" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 16, lineHeight: 1.6, maxWidth: 540 }}>
          {SITE.about.map((p, i) => <p key={i} style={{ margin: 0, textWrap: "pretty" }}>{p}</p>)}
        </div>
        <div className="mono small" style={{ color: "var(--muted)", display: "flex", flexDirection: "column", gap: "var(--row-y)" }}>
          <AboutRow k="stack" v="Python · SQL · Flourish · Datawrapper · QGIS · Excel" />
          <AboutRow k="has written for" v="Tech in Asia · VnExpress · Dân Trí · Zing News" />
          <AboutRow k="awards" v="17th National Press Awards · Consolation Prize · Innovative Team 2022" />
          <AboutRow k="education" v="Foreign Trade University · Int'l Business Management" />
          <AboutRow k="association" v="ABG Alumni Association President 2025–26" />
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
      <SectionHead no="02" title="Work" hint="5 positions · 7 years" />
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
        <SectionHead no="03" title="Selected work" hint={`${PROJECTS.length} pieces · 2022 — 2025`} />
        <ProjectsGrid openId={openId} onToggle={toggle} />
        <div className="card-body-wrap" data-open={openId ? "1" : "0"} style={{ marginTop: openId ? 24 : 0 }}>
          <div>{openP && <div style={{ padding: "8px 0" }}><ProjectBody p={openP} /></div>}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" style={{ paddingBottom: "var(--section-y)" }}>
      <SectionHead no="03" title="Selected work" hint={`${PROJECTS.length} pieces · 2022 — 2025`} />
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
          The fastest way to reach me is email. I read everything, reply to most things within 48 hours, and have a soft spot for anyone who leads with an interesting dataset.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--row-y)" }}>
          <ContactRow k="email" v={SITE.email} href={`mailto:${SITE.email}`} />
          {SITE.social.map((s) => (
            <ContactRow key={s.k} k={s.k} v={s.v} href={s.href} />
          ))}
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
