import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from "remotion";
import TRACK from "./track.json";

// Muster mit 10 neuen Effekten: KI-Scanner, Neon-Umriss, Karten-Wischen, Glas-Untertitel, Glas zerspringt,
// Glas-Handy (folgt dem Finger), Streifen-Übergang, Lade-Balken, Instagram-Hinweise mit Herzen, Kalender-Blatt.
const W = 1080, H = 1920, FPS = 30, RED = "#e8344d", INK = "#141414", ORANGE = "#d97757", GREEN = "#34c759";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const f = (s: number) => Math.round(s * FPS);
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'Osw';src:url('${staticFile("osw700.woff2")}') format('woff2');font-weight:700}
@font-face{font-family:'Mono';src:url('${staticFile("mono400.woff2")}') format('woff2');font-weight:400}`;
const glass: React.CSSProperties = {background: "rgba(255,255,255,.16)", backdropFilter: "blur(18px) saturate(1.4)", WebkitBackdropFilter: "blur(18px)",
  border: "1.5px solid rgba(255,255,255,.45)", boxShadow: "0 18px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.5)"};
const sh = "0 2px 8px rgba(0,0,0,.45)";

// Tracking (Quelle 24 fps): Fingerspitze und Gesicht, geglättet, Lücken mit dem nächsten Wert gefüllt
const T = TRACK as {hand: Record<string, [number, number]>; face: Record<string, [number, number, number, number]>};
const near = <V,>(m: Record<string, V>, n: number): V | null => { for (let d = 0; d < 12; d++) { if (m[n - d]) return m[n - d]; if (m[n + d]) return m[n + d]; } return null; };
const smooth = (m: Record<string, number[]>, n: number) => {
  const vals = [-3, -2, -1, 0, 1, 2, 3].map((d) => near(m, n + d)).filter(Boolean) as number[][];
  return vals.length ? vals[0].map((_, i) => vals.reduce((a, v) => a + v[i], 0) / vals.length) : null;
};
const srcN = (fr: number, a: number) => Math.round((fr / FPS + a) * 24) + 1;

type Seg = {a: number; b: number; scene: string; src?: string; muted?: boolean};
const SEGS: Seg[] = [
  {a: 0.0, b: 3.1, scene: "scanner", muted: true},
  {a: 3.1, b: 5.2, scene: "swipe"},
  {a: 13.6, b: 16.6, scene: "glas"},
  {a: 19.8, b: 21.4, scene: "streifen", src: "reel2.mp4", muted: true},
  {a: 16.75, b: 18.95, scene: "laden"},
  {a: 25.3, b: 26.9, scene: "ende", src: "reel2.mp4", muted: true},
];
let acc = 0;
const TL = SEGS.map((s) => { const r = {...s, at: acc}; acc += s.b - s.a; return r; });
export const NEU_TOTAL = f(acc);
type S = (typeof TL)[number];
const Vid: React.FC<{s: S; style?: React.CSSProperties}> = ({s, style}) =>
  <OffthreadVideo src={staticFile(s.src ?? "kueche.mp4")} startFrom={f(s.a)} muted={s.muted} style={{position: "absolute", width: W, height: H, ...style}} />;
const GlasCap: React.FC<{text: string; top: number; d?: number}> = ({text, top, d = 0}) => {
  const fr = useCurrentFrame() - d;
  return <div style={{position: "absolute", left: 0, width: W, top, textAlign: "center", opacity: interpolate(fr, [0, 5], [0, 1], C)}}>
    <span style={{...glass, display: "inline-block", padding: "16px 30px", borderRadius: 28, fontFamily: "Pop", fontWeight: 900, fontSize: 52, color: "white", textShadow: sh,
      scale: String(interpolate(fr, [0, 8], [0.7, 1], {...C, easing: pop}))}}>{text}</span>
  </div>;
};

// 1 · KI-Scanner + Neon-Umriss
const Scanner: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const n = srcN(fr, s.a);
  const b = smooth(T.face as unknown as Record<string, number[]>, n) ?? [0.42, 0.16, 0.16, 0.09];
  const x = b[0] * W - 30, y = b[1] * H - 40, w = b[2] * W + 60, h = b[3] * H + 80;
  const scan = (fr % 30) / 30;
  const neonAngle = interpolate(fr, [14, 50], [0, 360], C);
  const labels = ["AVATAR ✓", "KAMERA: AUS", "SCHNITT: CLAUDE"];
  const cn = Math.min(126, n);
  return <>
    <Vid s={s} />
    <Img src={staticFile(`neon/n${String(cn).padStart(4, "0")}.png`)} style={{position: "absolute", width: W, height: H, filter: "drop-shadow(0 0 10px #ff4060) drop-shadow(0 0 22px #ff4060)",
      maskImage: `conic-gradient(from 180deg at 50% 60%, black ${neonAngle}deg, transparent ${neonAngle}deg)`, WebkitMaskImage: `conic-gradient(from 180deg at 50% 60%, black ${neonAngle}deg, transparent ${neonAngle}deg)`}} />
    <div style={{position: "absolute", left: x, top: y, width: w, height: h, opacity: interpolate(fr, [2, 8], [0, 1], C)}}>
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy], i) => <div key={i} style={{position: "absolute", left: cx ? w - 34 : 0, top: cy ? h - 34 : 0, width: 34, height: 34,
        borderTop: cy ? "none" : "4px solid white", borderBottom: cy ? "4px solid white" : "none", borderLeft: cx ? "none" : "4px solid white", borderRight: cx ? "4px solid white" : "none"}} />)}
      <div style={{position: "absolute", left: 6, right: 6, top: scan * h, height: 3, background: "linear-gradient(90deg, transparent, #7df9ff, transparent)", boxShadow: "0 0 14px #7df9ff"}} />
      <div style={{position: "absolute", left: 0, top: -40, fontFamily: "Mono", fontSize: 24, color: "#7df9ff", textShadow: sh}}>ID 01 · {Math.min(99, Math.floor(fr * 2.4))}%</div>
    </div>
    {labels.map((l, i) => <div key={l} style={{position: "absolute", left: 90, top: 520 + i * 92, ...glass, padding: "12px 22px", borderRadius: 18, fontFamily: "Mono", fontSize: 30, color: "white",
      opacity: interpolate(fr, [18 + i * 12, 24 + i * 12], [0, 1], C), translate: `${interpolate(fr, [18 + i * 12, 28 + i * 12], [-60, 0], {...C, easing: out})}px 0`}}>{l}</div>)}
    <GlasCap text="Folge 01 · OHNE KAMERA" top={1330} d={40} />
  </>;
};

// 2 · Karten wischen: CapCut nach links (✕), Claude nach rechts (✓)
const Swipe: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame(), t = fr / FPS + s.a;
  const k1 = interpolate(t, [4.3, 4.7], [0, 1], {...C, easing: out}), k2 = interpolate(t, [4.85, 5.15], [0, 1], {...C, easing: out});
  const Card: React.FC<{k: number; dir: number; title: string; sub: string; stamp: string; col: string; z: number}> = ({k, dir, title, sub, stamp, col, z}) =>
    <div style={{position: "absolute", left: 300, top: 1050, width: 480, height: 330, borderRadius: 34, background: "white", zIndex: z, boxShadow: "0 24px 50px rgba(0,0,0,.35)",
      translate: `${dir * k * 900}px ${-k * 60}px`, rotate: `${dir * k * 24}deg`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 64, color: INK}}>{title}</div>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 34, color: "#777"}}>{sub}</div>
      <div style={{position: "absolute", top: 26, [dir < 0 ? "right" : "left"]: 26, padding: "4px 18px", border: `5px solid ${col}`, borderRadius: 12, color: col, fontFamily: "Pop",
        fontWeight: 900, fontSize: 44, rotate: dir < 0 ? "14deg" : "-14deg", opacity: interpolate(k, [0, 0.25], [0, 1], C)}}>{stamp}</div>
    </div>;
  return <>
    <Vid s={s} />
    <GlasCap text="ich nutze kein CapCut mehr" top={900} />
    <Card k={k2} dir={1} title="✳ Claude" sub="1 Satz" stamp="✓ JA" col={GREEN} z={1} />
    <Card k={k1} dir={-1} title="CapCut" sub="⏱ 3 Stunden" stamp="✕ NEIN" col={RED} z={2} />
  </>;
};

// 3 · Glas zerspringt (Standbild in Scherben) → darunter Glas-Handy, das dem Finger folgt
const SHARDS = Array.from({length: 14}, (_, i) => {
  const cx = (i % 4) * 300 + 120 + random(`x${i}`) * 80, cy = Math.floor(i / 4) * 520 + 200 + random(`y${i}`) * 120;
  const pts = Array.from({length: 5}, (_, k) => { const a = (k / 5) * Math.PI * 2 + random(`a${i}${k}`); const r = 260 + random(`r${i}${k}`) * 160; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  return {cx, cy, pts};
});
const ITEMS = ["Wort hinter dir", "Aus dem Handy", "3D-Text-Ring", "ANGST → Schmetterlinge", "Polaroid", "Untertitel", "Neon-Umriss", "Glas-Handy"];
const Glas: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame(), t = fr / FPS + s.a;
  const n = srcN(fr, s.a);
  const p = smooth(T.hand as unknown as Record<string, number[]>, n) ?? [0.5, 0.5];
  const fx = p[0] * W, fy = p[1] * H;
  const PX = 300, PY = 600, PW = 480, PH = 760, ROW = 96;
  const scroll = -(fy - 900) * 0.6;
  const tapped = t >= 14.4;
  const tapK = interpolate(t, [14.4, 14.6], [0, 1], C);
  const sh2 = interpolate(fr, [0, 16], [0, 1], {...C, easing: out});
  return <>
    <Vid s={s} />
    <div style={{position: "absolute", left: PX, top: PY, width: PW, height: PH, borderRadius: 56, overflow: "hidden", ...glass, scale: String(interpolate(fr, [8, 18], [0.85, 1], {...C, easing: out})),
      opacity: interpolate(fr, [8, 14], [0, 1], C)}}>
      <div style={{position: "absolute", left: 0, top: 26, width: PW, textAlign: "center", fontFamily: "Pop", fontWeight: 600, fontSize: 26, color: "white", textShadow: sh}}>
        <span style={{color: ORANGE}}>✳</span> meine Effekte</div>
      <div style={{position: "absolute", left: 24, right: 24, top: 90 + (tapped ? -(2 * ROW - 200) : scroll)}}>
        {ITEMS.map((it, i) => { const on = tapped ? i === 2 : Math.abs(90 + i * ROW + scroll + PY - fy) < ROW / 2;
          return <div key={i} style={{height: ROW - 12, marginBottom: 12, borderRadius: 24, display: "flex", alignItems: "center", gap: 16, padding: "0 22px",
            background: on ? (tapped ? `rgba(232,52,77,${0.5 + tapK * 0.4})` : "rgba(255,255,255,.28)") : "rgba(255,255,255,.08)", scale: String(tapped && i === 2 ? 1 + tapK * 0.06 : 1),
            fontFamily: "Pop", fontWeight: 600, fontSize: 30, color: "white", textShadow: sh}}>
            <span style={{width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26}}>▶</span>{it}</div>; })}
      </div>
    </div>
    <div style={{position: "absolute", left: fx - 30, top: fy - 30, width: 60, height: 60, borderRadius: 30, border: "3px solid rgba(255,255,255,.9)", background: "rgba(255,255,255,.25)",
      boxShadow: "0 0 24px rgba(255,255,255,.8)", opacity: interpolate(fr, [10, 16], [0, 0.9], C), scale: String(tapped ? 1 + Math.sin(tapK * Math.PI) * 0.8 : 1)}} />
    {/* Scherben des vorigen Bildes fliegen weg */}
    {sh2 < 1 && SHARDS.map((d, i) => <div key={i} style={{position: "absolute", left: 0, top: 0, width: W, height: H, clipPath: `polygon(${d.pts.map(([x, y]) => `${x}px ${y}px`).join(",")})`,
      translate: `${(d.cx - 540) * sh2 * 1.6}px ${(d.cy - 960) * sh2 * 1.6 + sh2 * sh2 * 900}px`, rotate: `${(random(`rot${i}`) - 0.5) * 90 * sh2}deg`, opacity: 1 - sh2 * 0.7}}>
      <Img src={staticFile("shatter.jpg")} style={{width: W, height: H}} />
    </div>)}
    <GlasCap text="ein Ring aus Text um mich" top={1420} d={14} />
  </>;
};

// 4 · Streifen-Übergang ins Ergebnis
const Streifen: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{background: "#000"}}>
    {[0, 1, 2].map((i) => { const k = interpolate(fr, [i * 3, i * 3 + 10], [1, 0], {...C, easing: out});
      return <div key={i} style={{position: "absolute", left: i * 360, top: 0, width: 360, height: H, overflow: "hidden", translate: `0 ${(i % 2 ? -1 : 1) * k * H}px`}}>
        <Vid s={s} style={{left: -i * 360}} /></div>; })}
  </AbsoluteFill>;
};

// 5 · Lade-Balken + Instagram-Hinweise
const NOTES = [["neue.followerin", "folgt dir jetzt"], ["sabine_neustart", "hat kommentiert: CLAUDE"], ["mia.kreativ", "gefällt dein Reel ♥"]];
const Laden: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const pct = Math.round(interpolate(fr, [4, 40], [0, 100], {...C, easing: Easing.inOut(Easing.quad)}));
  return <>
    <Vid s={s} />
    <div style={{position: "absolute", left: 140, top: 1150, width: 800, padding: "24px 30px", borderRadius: 30, ...glass}}>
      <div style={{display: "flex", justifyContent: "space-between", fontFamily: "Pop", fontWeight: 600, fontSize: 32, color: "white", textShadow: sh}}>
        <span><span style={{color: ORANGE}}>✳</span> {pct < 100 ? "Claude schneidet …" : "Fertig ✓"}</span><span style={{fontFamily: "Mono"}}>{pct}%</span></div>
      <div style={{marginTop: 16, height: 14, borderRadius: 7, background: "rgba(255,255,255,.25)", overflow: "hidden"}}>
        <div style={{width: `${pct}%`, height: "100%", background: pct < 100 ? "white" : GREEN, boxShadow: "0 0 12px white"}} /></div>
    </div>
    {NOTES.map(([u, txt], i) => <div key={u} style={{position: "absolute", left: 140, top: 1330 + i * 96, width: 690, padding: "14px 20px", borderRadius: 22, background: "rgba(255,255,255,.95)",
      display: "flex", alignItems: "center", gap: 14, boxShadow: "0 10px 26px rgba(0,0,0,.25)", fontFamily: "Pop", fontSize: 26, color: INK,
      translate: `0 ${interpolate(fr, [34 + i * 8, 42 + i * 8], [80, 0], {...C, easing: out})}px`, opacity: interpolate(fr, [34 + i * 8, 40 + i * 8], [0, 1], C)}}>
      <span style={{width: 48, height: 48, borderRadius: 24, background: `linear-gradient(135deg, #feda75, #d62976, #4f5bd5)`}} />
      <span><b style={{fontWeight: 900}}>{u}</b> {txt}</span></div>)}
  </>;
};

// 6 · Ende: Ergebnis, Herzen steigen auf, Kalender-Blatt „FOLGE 01 → 02“
const Ende: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const flip = interpolate(fr, [20, 32], [0, 180], {...C, easing: Easing.inOut(Easing.quad)});
  return <>
    <Vid s={s} />
    {Array.from({length: 14}, (_, i) => { const st = i * 2.5; const k = interpolate(fr, [st, st + 34], [0, 1], C);
      return <div key={i} style={{position: "absolute", left: 640 + Math.sin(i * 1.7 + fr / 6) * 60 + random(`h${i}`) * 140, top: 1500 - k * 900, fontSize: 40 + random(`s${i}`) * 30,
        opacity: k > 0 && k < 1 ? 1 - k : 0, color: RED}}>♥</div>; })}
    <div style={{position: "absolute", left: 90, top: 300, width: 400, height: 220, perspective: 800}}>
      <div style={{position: "absolute", inset: 0, borderRadius: 22, background: "white", boxShadow: "0 14px 30px rgba(0,0,0,.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 24, color: RED, letterSpacing: 4}}>NÄCHSTE</div>
        <div style={{fontFamily: "Osw", fontWeight: 700, fontSize: 96, lineHeight: 1, color: INK}}>FOLGE 02</div></div>
      <div style={{position: "absolute", inset: 0, borderRadius: 22, background: "white", transformOrigin: "50% 0", transform: `rotateX(${flip}deg)`, backfaceVisibility: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(0,0,0,.35)"}}>
        <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 24, color: RED, letterSpacing: 4}}>OHNE KAMERA</div>
        <div style={{fontFamily: "Osw", fontWeight: 700, fontSize: 96, lineHeight: 1, color: INK}}>FOLGE 01</div></div>
    </div>
  </>;
};
const SZ: Record<string, React.FC<{s: S}>> = {scanner: Scanner, swipe: Swipe, glas: Glas, streifen: Streifen, laden: Laden, ende: Ende};

export const Neu: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    {TL.map((s, i) => { const Z = SZ[s.scene]; return <Sequence key={i} from={f(s.at)} durationInFrames={f(s.at + s.b - s.a) - f(s.at)}><Z s={s} /></Sequence>; })}
    {TL.filter((s) => !s.src).map((s, i) => <Sequence key={`b${i}`} from={f(s.at)} durationInFrames={f(s.at + s.b - s.a) - f(s.at)}>
      <div style={{position: "absolute", left: 40, top: 1856, fontFamily: "Pop", fontWeight: 600, fontSize: 22, letterSpacing: 2, color: "white", textShadow: "0 1px 4px rgba(0,0,0,.8)"}}>KI-GENERIERT</div>
    </Sequence>)}
  </AbsoluteFill>
);
