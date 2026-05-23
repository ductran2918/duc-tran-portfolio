// app.jsx — root, command palette, status bar, tweaks wiring, easter eggs.

const { useState: _useState, useEffect: _useEffect, useRef: _useRef, useMemo: _useMemo, useCallback: _useCallback } = React;

// ── Command Palette ─────────────────────────────────────────────────────────

function CommandPalette({ open, onClose, onTheme, theme, projects, onJump }) {
  const [q, setQ] = _useState("");
  const inputRef = _useRef(null);
  const [cur, setCur] = _useState(0);

  _useEffect(() => { if (open) { setQ(""); setCur(0); setTimeout(()=>inputRef.current?.focus(), 30); } }, [open]);

  const items = _useMemo(() => {
    const base = [
      { id: "go-about", group: "go", label: "About", hint: "§01", run: () => onJump("about") },
      { id: "go-work", group: "go", label: "Work history", hint: "§02", run: () => onJump("work") },
      { id: "go-projects", group: "go", label: "Selected work", hint: "§03", run: () => onJump("projects") },
      { id: "go-contact", group: "go", label: "Contact", hint: "§04", run: () => onJump("contact") },
      ...projects.map(p => ({
        id: "p-"+p.id, group: "pieces", label: p.title,
        hint: `${p.pub} · ${p.date}`, run: () => onJump("projects", p.id),
      })),
      { id: "theme", group: "actions", label: theme === "dark" ? "Switch to light" : "Switch to dark", hint: "⇧⌘L", run: onTheme },
      { id: "email", group: "actions", label: "Copy email to clipboard", hint: SITE.email,
        run: () => { navigator.clipboard?.writeText(SITE.email); toast("email copied"); } },
      { id: "resume", group: "actions", label: "Download resume", hint: ".pdf · 124kb", run: () => toast("resume requested") },
      { id: "source", group: "actions", label: "View source on GitHub", hint: "↗", run: () => window.open("about:blank") },
    ];
    if (!q.trim()) return base;
    const needle = q.trim().toLowerCase();
    return base.filter(it => (it.label + " " + (it.hint||"")).toLowerCase().includes(needle));
  }, [q, projects, theme]);

  _useEffect(() => { setCur(0); }, [q]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCur(c => Math.min(items.length-1, c+1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCur(c => Math.max(0, c-1)); }
    else if (e.key === "Enter") { e.preventDefault(); const it = items[cur]; if (it) { it.run(); onClose(); } }
    else if (e.key === "Escape") { onClose(); }
  };

  if (!open) return null;

  const grouped = {};
  items.forEach((it,i) => { (grouped[it.group] ||= []).push({...it, i}); });

  return (
    <div className="cmdk-back" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "min(640px, 92vw)",
        background: "var(--bg)", border: ".5px solid var(--hair-strong)", borderRadius: 8,
        boxShadow: "0 30px 80px rgba(0,0,0,.30)", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: ".5px solid var(--hair)", gap: 12 }}>
          <span className="mono small" style={{ color: "var(--faint)" }}>$</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="jump to section, project, or run a command…"
            style={{
              flex: 1, border: 0, background: "transparent", outline: "none", color: "var(--fg)",
              fontFamily: "var(--font-sans)", fontSize: 15,
            }}
          />
          <kbd className="mono small" style={{ color: "var(--faint)", border: ".5px solid var(--hair)", padding: "2px 6px", borderRadius: 3 }}>esc</kbd>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
          {Object.entries(grouped).map(([g, list]) => (
            <div key={g}>
              <div className="label" style={{ padding: "8px 18px 4px" }}>{g === "go" ? "Navigate" : g === "pieces" ? "Selected work" : "Actions"}</div>
              {list.map((it) => (
                <div key={it.id}
                  onMouseEnter={() => setCur(it.i)}
                  onClick={() => { it.run(); onClose(); }}
                  style={{
                    padding: "8px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", gap: 12,
                    background: cur === it.i ? "var(--panel)" : "transparent",
                    borderLeft: cur === it.i ? `2px solid var(--accent)` : "2px solid transparent",
                  }}>
                  <span style={{ fontSize: 14 }}>{it.label}</span>
                  <span className="mono small" style={{ color: "var(--faint)" }}>{it.hint}</span>
                </div>
              ))}
            </div>
          ))}
          {items.length === 0 && (
            <div className="mono small" style={{ padding: 24, color: "var(--faint)", textAlign: "center" }}>no matches for "{q}"</div>
          )}
        </div>
        <div className="mono small" style={{
          padding: "10px 18px", borderTop: ".5px solid var(--hair)",
          display: "flex", gap: 16, color: "var(--faint)", justifyContent: "space-between",
        }}>
          <span>↑↓ navigate · ↵ select</span>
          <span>built in ~4 weekends</span>
        </div>
      </div>
    </div>
  );
}

// quick toast
function toast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; left:50%; bottom:64px; transform:translateX(-50%);
    background:var(--fg); color:var(--bg); padding:8px 14px; border-radius:4px;
    font-family:var(--font-mono); font-size:12px; z-index:200;
    box-shadow:0 8px 24px rgba(0,0,0,.25);
    opacity:0; transition:opacity .2s, transform .2s;
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translate(-50%, -6px)"; });
  setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 250); }, 1600);
}

// ── Status Bar ──────────────────────────────────────────────────────────────

function StatusBar({ now }) {
  const cur = useCursor();
  const [konami, setKonami] = _useState(false);
  // Tiny scroll readout — 0 → 100
  const [scroll, setScroll] = _useState(0);
  _useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // konami code
  _useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let i = 0;
    const fn = (e) => {
      if (e.key === seq[i]) { i++; if (i === seq.length) { setKonami(true); toast("konami unlocked — try ⌘K"); i = 0; } }
      else { i = 0; }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <footer className="mono small" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
      borderTop: ".5px solid var(--hair)",
      background: "color-mix(in oklab, var(--bg) 88%, transparent)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      color: "var(--muted)",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "8px 32px",
        display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span className="pulse-dot" /> live
        </span>
        <span>·</span>
        <span><span style={{ color: "var(--faint)" }}>local </span><span className="tnum" style={{ color: "var(--fg)" }}>{fmtTime(now)}</span></span>
        <span>·</span>
        <span><span style={{ color: "var(--faint)" }}>cursor </span><span className="tnum">{String(cur.x).padStart(4,"0")}, {String(cur.y).padStart(4,"0")}</span></span>
        <span>·</span>
        <span><span style={{ color: "var(--faint)" }}>scroll </span><span className="tnum">{String(scroll).padStart(3,"0")}%</span></span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 14 }}>
          {konami && <span style={{ color: "var(--accent)" }}>★ unlocked</span>}
          <span style={{ color: "var(--faint)" }}>press</span>
          <kbd style={{ border: ".5px solid var(--hair-strong)", padding: "1px 6px", borderRadius: 3 }}>?</kbd>
          <span style={{ color: "var(--faint)" }}>for shortcuts</span>
        </span>
      </div>
    </footer>
  );
}

// ── Shortcuts overlay ───────────────────────────────────────────────────────

function ShortcutsHelp({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="cmdk-back" onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        width: "min(420px, 92vw)", background: "var(--bg)", border: ".5px solid var(--hair-strong)",
        borderRadius: 8, padding: "20px 24px", boxShadow: "0 30px 80px rgba(0,0,0,.30)",
      }}>
        <div className="mono small" style={{ color: "var(--faint)", marginBottom: 14 }}>keyboard</div>
        {[
          ["⌘ K", "open command palette"],
          ["G then A/W/P/C", "go to section"],
          ["T", "toggle theme"],
          ["?", "show this"],
          ["esc", "close overlays"],
        ].map(([k,v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: ".5px solid var(--hair)" }}>
            <span style={{ fontSize: 14 }}>{v}</span>
            <kbd className="mono small" style={{ border: ".5px solid var(--hair-strong)", padding: "1px 8px", borderRadius: 3 }}>{k}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [cmdkOpen, setCmdk] = _useState(false);
  const [helpOpen, setHelp] = _useState(false);
  const now = useNow();

  // Apply tweaks to <html> data-attrs and CSS variables.
  _useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = t.dark ? "dark" : "light";
    html.dataset.tex = t.texture;
    html.dataset.density = t.density;
    const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS["inter-jb"];
    html.style.setProperty("--font-sans", pair.sans);
    html.style.setProperty("--font-mono", pair.mono);
    html.style.setProperty("--font-display", pair.display);
    html.style.setProperty("--accent", t.accent);
    html.style.setProperty("--accent-soft", `color-mix(in oklab, ${t.accent} 22%, transparent)`);
  }, [t]);

  const toggleTheme = _useCallback(() => setTweak("dark", !t.dark), [t.dark, setTweak]);

  // Global hotkeys
  useHotkey((e) => (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "k"), () => setCmdk((o) => !o));
  useHotkey((e) => !e.metaKey && !e.ctrlKey && !e.altKey && e.key === "?" && !isInInput(e), () => setHelp((o) => !o));
  useHotkey((e) => !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "t" && !isInInput(e), () => toggleTheme());
  // G then A/W/P/C two-key navigation
  const gRef = _useRef({ at: 0 });
  _useEffect(() => {
    const fn = (e) => {
      if (isInInput(e)) return;
      const k = e.key.toLowerCase();
      if (k === "g") { gRef.current.at = Date.now(); return; }
      if (Date.now() - gRef.current.at < 900) {
        const map = { a: "about", w: "work", p: "projects", c: "contact" };
        if (map[k]) { e.preventDefault(); jumpTo(map[k]); }
        gRef.current.at = 0;
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const jumpTo = (idOrSection, sub) => {
    const el = document.getElementById(idOrSection);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // sub-target left as future hook (projects could pre-open)
  };

  const HeroPick = { stacked: HeroStacked, split: HeroSplit, terminal: HeroTerminal }[t.hero] || HeroStacked;

  return (
    <>
      <TopBar onCmdK={() => setCmdk(true)} theme={t.dark ? "dark" : "light"} onTheme={toggleTheme} />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px 120px" }}>
        <HeroPick now={now} />
        <About />
        <Work />
        <Projects cardStyle={t.card} />
        <Contact />

        <footer className="mono small" style={{
          marginTop: 40, paddingTop: 24, borderTop: ".5px solid var(--hair)",
          display: "flex", justifyContent: "space-between", color: "var(--faint)", flexWrap: "wrap", gap: 12,
        }}>
          <span>© 2026 Duc Tran · all stories are mine, all bugs are mine</span>
          <span>built by hand · last shipped 2026-05-23</span>
        </footer>
      </main>

      <StatusBar now={now} />

      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdk(false)}
        onTheme={toggleTheme}
        theme={t.dark ? "dark" : "light"}
        projects={PROJECTS}
        onJump={jumpTo}
      />

      <ShortcutsHelp open={helpOpen} onClose={() => setHelp(false)} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakColor label="Accent" value={t.accent}
          options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSelect label="Background texture" value={t.texture}
          options={[
            { value: "grid", label: "Grid" },
            { value: "dots", label: "Dotted" },
            { value: "lines", label: "Ruled" },
            { value: "none", label: "Plain" },
          ]}
          onChange={(v) => setTweak("texture", v)} />

        <TweakSection label="Type" />
        <TweakSelect label="Font pair" value={t.fontPair}
          options={Object.entries(FONT_PAIRS).map(([v, p]) => ({ value: v, label: p.label }))}
          onChange={(v) => setTweak("fontPair", v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={[{value:"compact",label:"Compact"},{value:"regular",label:"Regular"},{value:"comfy",label:"Comfy"}]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSelect label="Hero variant" value={t.hero}
          options={[
            { value: "stacked", label: "Stacked — big name" },
            { value: "split", label: "Split — name + meta" },
            { value: "terminal", label: "Terminal — type-out" },
          ]}
          onChange={(v) => setTweak("hero", v)} />
        <TweakSelect label="Project cards" value={t.card}
          options={[
            { value: "list", label: "List — inline expand" },
            { value: "card", label: "Bordered cards" },
            { value: "grid", label: "2×2 grid" },
          ]}
          onChange={(v) => setTweak("card", v)} />
      </TweaksPanel>
    </>
  );
}

function isInInput(e) {
  const t = e.target;
  return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Hidden hello in the console
;(function welcome() {
  const css1 = "font-family: ui-monospace, monospace; font-size: 12px; color: #86f4b6;";
  const css2 = "font-family: ui-monospace, monospace; font-size: 11px; color: #888;";
  console.log("%c$ whoami\n%cduc.tran — data journalist. brooklyn.\n\n%cif you're reading this, mail me. duc@ductran.work", css1, "color:#fff;font-family:ui-monospace,monospace;", css2);
})();
