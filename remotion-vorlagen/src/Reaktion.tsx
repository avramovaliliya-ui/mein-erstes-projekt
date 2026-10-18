import React from "react";
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from "remotion";

// Muster „Reaktions-Format“: oben Schnitt-Chaos / Chat / Effekt, unten sie (Küchen-Video).
// Effekt-Szenen laufen über den ganzen Bildschirm.
const W = 1080, H = 1920, HALF = 960, FPS = 30, RED = "#c3172e", GOLD = "#e8c27a", INK = "#1e1814";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const f = (s: number) => Math.round(s * FPS);
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff2")}') format('woff2');font-weight:700;font-style:italic}`;
const shadow = "0 4px 0 rgba(0,0,0,.35), 0 0 22px rgba(0,0,0,.55)";

// Unten: Küchen-Video, Ausschnitt so verschoben, dass ihr Gesicht in der unteren Hälfte sitzt
const Unten: React.FC<{from: number; shift: number; muted?: boolean}> = ({from, shift, muted}) => (
  <div style={{position: "absolute", left: 0, top: HALF, width: W, height: HALF, overflow: "hidden"}}>
    <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(from)} muted={muted} style={{position: "absolute", left: 0, top: -shift, width: W, height: H}} />
  </div>
);
const Voll: React.FC<{src: string; from: number}> = ({src, from}) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile(src)} startFrom={f(from)} muted style={{width: W, height: H, scale: String(interpolate(fr, [0, 8], [1.12, 1], {...C, easing: out}))}} />
    <AbsoluteFill style={{background: "white", opacity: interpolate(fr, [0, 4], [0.9, 0], C)}} />
  </AbsoluteFill>;
};

// Oben 1: volle Schnitt-App, Uhr rast, am Ende rotes Kreuz
const Chaos = () => {
  const fr = useCurrentFrame();
  const secs = Math.floor(interpolate(fr, [0, 60], [47 * 60, 3 * 3600 + 12 * 60], C));
  const clock = `${String(Math.floor(secs / 3600)).padStart(2, "0")}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const colors = ["#5b8def", "#e0a03c", "#4fb38a", "#c8649a", "#8a6de0", "#d9534f"];
  const px = (fr * 37) % 900 + 90;
  const cx = 300 + Math.sin(fr / 3) * 260, cy = 690 + Math.cos(fr / 2.3) * 120;
  const x = interpolate(fr, [44, 54], [0, 1], {...C, easing: out});
  return <div style={{position: "absolute", left: 0, top: 0, width: W, height: HALF, background: "#16161a", overflow: "hidden"}}>
    <div style={{position: "absolute", left: 300, top: 340, width: 400, height: 225, background: "#000", borderRadius: 10, overflow: "hidden"}}>
      <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(6)} muted style={{width: 480, height: 853, marginTop: -260}} />
    </div>
    {colors.map((c, t) => <div key={t} style={{position: "absolute", left: 0, top: 580 + t * 52, width: W, height: 44}}>
      {Array.from({length: 7}, (_, k) => {
        const jitter = (random(`j${t}${k}${Math.floor(fr / 4)}`) - 0.5) * 30;
        return <div key={k} style={{position: "absolute", left: 40 + k * 150 + jitter + random(`o${t}${k}`) * 40, top: 4, width: 90 + random(`w${t}${k}`) * 60, height: 36,
          borderRadius: 6, background: c, opacity: 0.85}} />;
      })}
    </div>)}
    <div style={{position: "absolute", left: px, top: 560, width: 4, height: 340, background: "white"}} />
    <div style={{position: "absolute", left: cx, top: cy, fontSize: 54, rotate: "-20deg"}}>🖱️</div>
    <div style={{position: "absolute", left: 0, width: W, top: 262, textAlign: "center", fontFamily: "Pop", fontWeight: 900, fontSize: 54, color: "white", textShadow: shadow}}>
      SIE: <span style={{color: "#ff6b6b"}}>{clock}</span> SCHNEIDEN</div>
    <div style={{position: "absolute", left: 140, top: 230, width: 800, height: 680, opacity: x}}>
      {[45, -45].map((r) => <div key={r} style={{position: "absolute", left: 0, top: 320, width: 800 * x, height: 34, background: RED, borderRadius: 17, rotate: `${r}deg`, transformOrigin: "400px 17px", boxShadow: "0 8px 24px rgba(0,0,0,.4)"}} />)}
    </div>
  </div>;
};

// Oben 2: Chat – ihr Satz tippt sich, dann "Mach ich."
const Chat: React.FC<{text: string}> = ({text}) => {
  const fr = useCurrentFrame();
  const n = Math.floor(interpolate(fr, [3, 22], [0, text.length], C));
  return <div style={{position: "absolute", left: 0, top: 0, width: W, height: HALF, background: "#f4efe7", overflow: "hidden"}}>
    <div style={{position: "absolute", left: 60, top: 270, fontFamily: "Pop", fontWeight: 600, fontSize: 34, color: INK, display: "flex", alignItems: "center", gap: 14}}>
      <span style={{width: 22, height: 22, borderRadius: 11, background: "#d97757"}} /> Claude</div>
    <div style={{position: "absolute", right: 60, top: 350, maxWidth: 760, padding: "30px 38px", borderRadius: "36px 36px 10px 36px", background: RED, color: "white",
      fontFamily: "Pop", fontWeight: 600, fontSize: 48, lineHeight: 1.25, scale: String(interpolate(fr, [0, 6], [0.7, 1], {...C, easing: pop})), transformOrigin: "100% 0"}}>
      {text.slice(0, Math.max(1, n))}{n < text.length ? "|" : ""}</div>
    {fr > 26 && <div style={{position: "absolute", left: 60, top: 640, padding: "24px 34px", borderRadius: "36px 36px 36px 10px", background: "#e6ded3", color: INK,
      fontFamily: "Pop", fontWeight: 600, fontSize: 46, scale: String(interpolate(fr, [26, 32], [0.5, 1], {...C, easing: pop})), transformOrigin: "0 100%"}}>Mach ich. ✨</div>}
  </div>;
};

const Schluss = () => {
  const fr = useCurrentFrame();
  return <div style={{position: "absolute", left: 0, top: 0, width: W, height: HALF, background: "#16161a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
    <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 140, color: "white", scale: String(interpolate(fr, [0, 8], [0.6, 1], {...C, easing: pop}))}}>ICH:</div>
    <div style={{fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 150, color: GOLD, scale: String(interpolate(fr, [5, 13], [0.6, 1], {...C, easing: pop}))}}>1 Satz.</div>
  </div>;
};

type Seg = {d: number; el: React.ReactNode; voll?: boolean};
const SEGS: Seg[] = [
  {d: 2.05, el: <><Chaos /><Unten from={3.15} shift={200} /></>},
  {d: 1.85, el: <><Chat text="Mach einen 3D-Ring aus Text um mich" /><Unten from={11.45} shift={0} /></>},
  {d: 2.6, el: <Voll src="reel2.mp4" from={19.7} />, voll: true},
  {d: 1.3, el: <><Chat text="Lass mich aus dem Handy steigen" /><Unten from={0.3} shift={200} muted /></>},
  {d: 2.4, el: <Voll src="reel2.mp4" from={24.7} />, voll: true},
  {d: 1.3, el: <><Chat text="Stell das Wort FREI hinter mich" /><Unten from={1.6} shift={200} muted /></>},
  {d: 2.2, el: <Voll src="muster.mp4" from={0.2} />, voll: true},
  {d: 1.4, el: <><Schluss /><Unten from={25.0} shift={250} /></>},
];
let acc = 0;
const TL = SEGS.map((s) => { const r = {...s, at: acc}; acc += s.d; return r; });
export const TOTAL = f(acc);

export const Reaktion: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    {TL.map((s, i) => <Sequence key={i} from={f(s.at)} durationInFrames={f(s.at + s.d) - f(s.at)}>{s.el}</Sequence>)}
    <Badge />
  </AbsoluteFill>
);
const Badge = () => {
  const t = useCurrentFrame() / FPS;
  const voll = TL.some((s) => s.voll && t >= s.at && t < s.at + s.d);
  return voll ? null : <div style={{position: "absolute", left: 40, top: 1856, fontFamily: "Pop", fontWeight: 600, fontSize: 22, letterSpacing: 2, color: "white", textShadow: "0 1px 4px rgba(0,0,0,.8)"}}>KI-GENERIERT</div>;
};
