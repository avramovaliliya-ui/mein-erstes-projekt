import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";
import WORDS from "./kueche-words.json";

// Küchen-Reel: Original-Video + Effekte genau beim gesprochenen Satz.
// Ausschnitte (cut/cNNNN.png) gibt es nur in den Effekt-Abschnitten.
const W = 1080, H = 1920, FPS = 24, GOLD = "#e8c27a", RED = "#b3122a", INK = "#1e1814";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H};
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'PF';src:url('${staticFile("pf700.woff2")}') format('woff2');font-weight:700}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff2")}') format('woff2');font-weight:700;font-style:italic}`;
const stroke = `0 3px 0 ${INK},0 0 18px rgba(0,0,0,.55),2px 2px 0 ${INK},-2px 2px 0 ${INK}`;

const sec = (f: number) => f / FPS;
const between = (f: number, a: number, b: number) => sec(f) >= a && sec(f) < b;
const Cut: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const n = useCurrentFrame() + 1;
  return <Img src={staticFile(`cut/c${String(n).padStart(4, "0")}.png`)} style={{...full, ...style}} />;
};
const Video: React.FC<{style?: React.CSSProperties; muted?: boolean}> = ({style, muted}) => (
  <OffthreadVideo src={staticFile("in.mp4")} style={{...full, ...style}} muted={muted} />
);

// 0 · Hook vor dem ersten Wort
const Hook = () => {
  const f = useCurrentFrame();
  const o = interpolate(sec(f), [0.2, 0.6, 2.8, 3.1], [0, 1, 1, 0], C);
  const s = interpolate(sec(f), [0.2, 0.7], [0.7, 1], {...C, easing: pop});
  return <div style={{position: "absolute", left: 90, right: 90, top: 1180, textAlign: "center", opacity: o, scale: String(s)}}>
    <span style={{fontFamily: "PF", fontWeight: 700, fontSize: 92, color: "white", textShadow: stroke}}>Effekte </span>
    <span style={{fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 92, color: GOLD, textShadow: stroke}}>ohne CapCut?</span>
  </div>;
};

// 1 · „CapCut“ hinter ihr, wird rot durchgestrichen (3.2–5.2 s)
const CapCutBehind = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const o = interpolate(t, [3.2, 3.5], [0, 1], C);
  const y = interpolate(t, [3.2, 3.7], [120, 0], {...C, easing: out});
  const line = interpolate(t, [4.45, 4.8], [0, 1], {...C, easing: out});
  return (<>
    <div style={{position: "absolute", left: 0, width: W, top: 150 + y, textAlign: "center", opacity: o}}>
      <div style={{display: "inline-block", position: "relative", fontFamily: "Pop", fontWeight: 900, fontSize: 230, letterSpacing: -6, color: "white", textShadow: "0 16px 40px rgba(0,0,0,.35)"}}>
        CapCut
        <div style={{position: "absolute", left: -20, top: "52%", height: 30, width: `calc(${line * 100}% + ${line * 40}px)`, background: RED, borderRadius: 15, rotate: "-6deg", transformOrigin: "left center"}} />
      </div>
    </div>
    <Cut />
  </>);
};

// 2 · Zähler 0 → 20 Minuten (7.9–9.7 s)
const Minuten = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const o = interpolate(t, [7.9, 8.1, 9.5, 9.7], [0, 1, 1, 0], C);
  const n = Math.round(interpolate(t, [8.1, 8.9], [0, 20], {...C, easing: out}));
  const shake = t > 8.9 && t < 9.2 ? Math.sin(f * 2.5) * 8 : 0;
  return <div style={{position: "absolute", left: 0, width: W, top: 1110, textAlign: "center", opacity: o, translate: `${shake}px 0`}}>
    <div style={{display: "inline-flex", alignItems: "baseline", gap: 18, padding: "10px 44px 18px", borderRadius: 40, background: "rgba(255,255,255,.92)", boxShadow: "0 18px 40px rgba(0,0,0,.25)"}}>
      <span style={{fontFamily: "Pop", fontWeight: 900, fontSize: 150, color: RED}}>{n}</span>
      <span style={{fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 70, color: INK}}>Minuten</span>
    </div>
  </div>;
};

// 3 · Chat-Blase: „sage nur, was ich will“ (11.5–13.6 s)
const PROMPT = "Mach mir einen Ring aus Text um mich ✨";
const Chat = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const s = interpolate(t, [11.5, 11.8], [0, 1], {...C, easing: pop});
  const o = interpolate(t, [13.3, 13.6], [1, 0], C);
  const chars = Math.floor(interpolate(t, [11.9, 13.1], [0, PROMPT.length], C));
  return <div style={{position: "absolute", left: 360, width: 600, top: 1100, opacity: o, scale: String(s), transformOrigin: "100% 100%"}}>
    <div style={{padding: "28px 36px", borderRadius: "40px 40px 8px 40px", background: "white", boxShadow: "0 18px 40px rgba(0,0,0,.25)",
      fontFamily: "Pop", fontWeight: 600, fontSize: 46, lineHeight: 1.25, color: INK, minHeight: 60}}>
      {chars === 0 ? "• • •" : PROMPT.slice(0, chars)}
    </div>
  </div>;
};

// 4 · Ring aus Text um sie (14.2–16.7 s)
const RING = "RING AUS TEXT ✦ RING AUS TEXT ✦ ";
const Ring: React.FC<{front: boolean}> = ({front}) => {
  const f = useCurrentFrame();
  const t = sec(f);
  const o = interpolate(t, [14.2, 14.6, 16.4, 16.7], [0, 1, 1, 0], C);
  const grow = interpolate(t, [14.2, 14.8], [0.4, 1], {...C, easing: out});
  const cx = 545, cy = 860, rx = 400 * grow, ry = 95 * grow;
  return <>{RING.split("").map((ch, i) => {
    const a = -(i / RING.length) * Math.PI * 2 - t * 1.6;
    const d = Math.sin(a);
    if ((d > 0) !== front) return null;
    return <div key={i} style={{position: "absolute", left: cx + Math.cos(a) * rx - 30, top: cy + d * ry - 40, width: 60, textAlign: "center",
      fontFamily: "Pop", fontWeight: 900, fontSize: 66, color: d > 0 ? "white" : GOLD, opacity: o * (0.6 + (d + 1) * 0.2),
      scale: String(0.75 + (d + 1) * 0.25), textShadow: "0 4px 14px rgba(0,0,0,.55)"}}>{ch}</div>;
  })}</>;
};

// 5 · Aus dem Handy steigen (16.7–19.0 s)
const PX = 170, PY = 1180, PW = 740, PH = 1300, R = 90; // Handy beginnt unter dem Kinn
const Handy = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const inn = interpolate(t, [16.71, 17.1], [0.8, 1], {...C, easing: out});
  const step = interpolate(t, [17.4, 18.3], [0, 1], {...C, easing: out});
  const phone: React.CSSProperties = {...full, transform: `scale(${inn})`, transformOrigin: "540px 1700px"};
  return (<AbsoluteFill style={{background: "#f3eee8"}}>
    <Video muted style={{filter: "blur(28px) brightness(1.08)", scale: "1.15", opacity: 0.85}} />
    <div style={phone}>
      <div style={{position: "absolute", left: PX - 26, top: PY - 26, width: PW + 52, height: PH + 52, borderRadius: R + 26, background: "#141414", boxShadow: "0 40px 80px rgba(0,0,0,.35)"}} />
      <div style={{position: "absolute", left: PX, top: PY, width: PW, height: PH, borderRadius: R, overflow: "hidden"}}>
        <Video muted style={{left: -PX, top: -PY}} />
      </div>
    </div>
    <Cut style={{transform: `scale(${inn * (1 + step * 0.06)}) translateY(${-step * 30}px)`, transformOrigin: "540px 1700px",
      clipPath: `inset(0 0 ${H - PY}px 0)`, opacity: interpolate(t, [16.9, 17.1], [0, 1], C)}} />
  </AbsoluteFill>);
};

// 6 · „Claude schneidet alles“: Sticker mit weissem Rand (22.6–24.3 s)
const Sticker = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const k = interpolate(t, [22.6, 23.0], [0, 1], {...C, easing: out});
  const sc = 1 + k * 0.04;
  const edge = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => `drop-shadow(${(Math.cos(d * Math.PI / 180) * 7 * k).toFixed(1)}px ${(Math.sin(d * Math.PI / 180) * 7 * k).toFixed(1)}px 0 white)`).join(" ");
  const sx = interpolate(t, [22.7, 23.5], [-120, W + 40], C);
  return (<>
    <Video muted style={{filter: `blur(${k * 22}px) saturate(${1 - k * 0.4}) brightness(${1 + k * 0.12})`}} />
    <Cut style={{scale: String(sc), filter: `${edge} drop-shadow(0 18px 30px rgba(0,0,0,${0.35 * k}))`}} />
    <div style={{position: "absolute", left: sx, top: 330, fontSize: 110, rotate: "90deg", opacity: t < 23.6 ? 1 : 0}}>✂️</div>
  </>);
};

// 7 · Kommentar-Blase mit Kommentar-Wort (27.6–30 s)
const Kommentar = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const s = interpolate(t, [27.7, 28.0], [0, 1], {...C, easing: pop});
  return <div style={{position: "absolute", left: 120, top: 1110, scale: String(s), transformOrigin: "0% 100%",
    display: "flex", alignItems: "center", gap: 22, padding: "22px 34px 22px 22px", borderRadius: 60, background: "white", boxShadow: "0 18px 40px rgba(0,0,0,.25)"}}>
    <div style={{width: 84, height: 84, borderRadius: 42, background: `linear-gradient(135deg, ${GOLD}, ${RED})`}} />
    <div>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 28, color: "#777"}}>Dein Kommentar</div>
      <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 64, color: INK, letterSpacing: 2}}>CLAUDE</div>
    </div>
    <div style={{fontSize: 52, marginLeft: 16, color: RED}}>♥</div>
  </div>;
};

// Untertitel Wort für Wort, Satz für Satz
const SENT: [string, number, number][][] = [];
for (const w of WORDS as [string, number, number][]) {
  if (!SENT.length || /[.?]$/.test(SENT[SENT.length - 1].slice(-1)[0][0])) SENT.push([]);
  SENT[SENT.length - 1].push(w);
}
const Captions = () => {
  const t = sec(useCurrentFrame());
  const s = SENT.find((ws) => t >= ws[0][1] - 0.1 && t < ws[ws.length - 1][2] + 0.5);
  if (!s) return null;
  const mine = s[0][0] === "Untertitel"; // „in meiner Schrift“ bekommt die grosse Schrift
  return <div style={{position: "absolute", left: 90, right: 90, top: mine ? 1300 : 1400, textAlign: "center", lineHeight: 1.15}}>
    {s.map(([w, a], k) => {
      const on = t >= a, cur = on && (k === s.length - 1 || t < s[k + 1][1]);
      const sc = interpolate(t, [a, a + 0.12], [0.6, cur ? 1.12 : 1], {...C, easing: pop});
      return <span key={k} style={{display: "inline-block", margin: "0 14px", opacity: on ? 1 : 0, scale: String(on ? sc : 0.6),
        fontFamily: "PF", fontWeight: 700, fontStyle: mine || cur ? "italic" : "normal", fontSize: mine ? 104 : 78,
        color: cur || mine ? GOLD : "white", textShadow: stroke}}>{w}</span>;
    })}
  </div>;
};

const Badge = () => (
  <div style={{position: "absolute", left: 40, top: 1850, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Pop", fontWeight: 600, fontSize: 24}}>KI-generiert</div>
);

export const KuecheReel: React.FC = () => {
  const f = useCurrentFrame();
  const handy = between(f, 16.71, 19.0);
  return (<AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    <Video />
    {between(f, 0, 3.2) && <Hook />}
    {between(f, 3.2, 5.2) && <CapCutBehind />}
    {between(f, 7.9, 9.7) && <Minuten />}
    {between(f, 11.5, 13.6) && <Chat />}
    {between(f, 14.2, 16.7) && <><Ring front={false} /><Cut /><Ring front /></>}
    {handy && <Handy />}
    {between(f, 22.6, 24.29) && <Sticker />}
    {between(f, 27.6, 30.1) && <Kommentar />}
    <Captions />
    <Badge />
  </AbsoluteFill>);
};
