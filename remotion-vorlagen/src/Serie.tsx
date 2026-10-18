import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from "remotion";

// Serien-Muster nach ihren Vorbildern: sie redet vollformatig, Effekte schweben um sie herum.
// Pille oben, Wort hinter dem Kopf, schräge Karten, Chat-Zeile, Untertitel klein + Schlüsselwort riesig.
const W = 1080, H = 1920, FPS = 30, GOLD = "#f2c14e", RED = "#c3172e", INK = "#1e1814";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const f = (s: number) => Math.round(s * FPS);
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}`;
const sh = "0 3px 0 rgba(0,0,0,.35), 0 0 18px rgba(0,0,0,.5)";

// Küchen-Video: [von, bis] und Untertitel [klein, gross, Zeit des grossen Worts]
type Seg = {a: number; b: number; small: string; big: string; bigAt: number; top: number};
const SEGS: Seg[] = [
  {a: 3.1, b: 5.2, small: "ich nutze kein", big: "CAPCUT mehr.", bigAt: 4.28, top: 1180},
  {a: 11.4, b: 13.35, small: "heute sage ich nur,", big: "was ich will.", bigAt: 12.7, top: 1060},
  {a: 14.1, b: 16.6, small: "ein", big: "Ring aus Text", bigAt: 14.38, top: 1080},
  {a: 16.75, b: 18.95, small: "ich steige aus dem", big: "Handy.", bigAt: 18.2, top: 1150},
];
let acc = 0;
const TL = SEGS.map((s) => { const r = {...s, at: acc}; acc += s.b - s.a; return r; });
const END = 1.6;
export const SERIE_TOTAL = f(acc + END);

const Basis: React.FC<{a: number}> = ({a}) => <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(a)} style={{position: "absolute", width: W, height: H}} />;
const Cut: React.FC<{a: number}> = ({a}) => {
  const n = useCurrentFrame() + Math.round(a * 24) + 1; // Ausschnitte sind in 24 fps
  return <Img src={staticFile(`cut/c${String(Math.round((useCurrentFrame() / FPS + a) * 24) + 1).padStart(4, "0")}.png`)} style={{position: "absolute", width: W, height: H}} data-n={n} />;
};

// schwebende, schräge Karte mit Schatten
const Karte: React.FC<{x: number; y: number; w: number; h: number; rot: number; delay?: number; children: React.ReactNode; label?: string}> = ({x, y, w, h, rot, delay = 0, children, label}) => {
  const fr = useCurrentFrame() - delay;
  const s = interpolate(fr, [0, 9], [0.4, 1], {...C, easing: pop});
  const bob = Math.sin(fr / 9) * 8;
  return <div style={{position: "absolute", left: x, top: y + bob, width: w, height: h, rotate: `${rot + Math.sin(fr / 14) * 1.2}deg`, scale: String(s), opacity: fr < 0 ? 0 : 1,
    borderRadius: 28, overflow: "hidden", background: "#111", border: "6px solid white", boxShadow: "0 24px 50px rgba(0,0,0,.45)"}}>
    {children}
    {label && <div style={{position: "absolute", left: "50%", bottom: 16, translate: "-50% 0", padding: "6px 16px", borderRadius: 10, background: label === "FERTIG" ? GOLD : "white",
      color: INK, fontFamily: "Pop", fontWeight: 900, fontSize: 24, letterSpacing: 3}}>{label}</div>}
  </div>;
};

const Pille = () => (
  <div style={{position: "absolute", left: 0, width: W, top: 268, textAlign: "center"}}>
    <span style={{display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 28px", borderRadius: 40, background: "white", color: INK, fontFamily: "Pop", fontWeight: 600,
      fontSize: 32, boxShadow: "0 10px 26px rgba(0,0,0,.25)"}}><span style={{color: "#d97757", fontSize: 36}}>✳</span> Kann Claude diesen Effekt nachbauen?</span>
  </div>
);

const Untertitel: React.FC<{s: (typeof TL)[number]}> = ({s}) => {
  const fr = useCurrentFrame(), t = fr / FPS + s.a;
  const bigOn = t >= s.bigAt;
  return <div style={{position: "absolute", left: 90, width: 740, top: s.top, textAlign: "center", lineHeight: 1.02}}>
    <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 50, color: "white", textShadow: sh, opacity: interpolate(fr, [0, 4], [0, 1], C)}}>{s.small}</div>
    {bigOn && <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 96, letterSpacing: -2, color: GOLD, textShadow: sh,
      scale: String(interpolate(t, [s.bigAt, s.bigAt + 0.18], [0.5, 1], {...C, easing: pop}))}}>{s.big}</div>}
  </div>;
};

// Szene 1: CLAUDE hinter dem Kopf + Karte mit Schnitt-Chaos, das rot durchgestrichen wird
const Chaos = () => {
  const fr = useCurrentFrame();
  const cols = ["#5b8def", "#e0a03c", "#4fb38a", "#c8649a", "#8a6de0"];
  const x = interpolate(fr, [34, 44], [0, 1], {...C, easing: out});
  return <AbsoluteFill style={{background: "#16161a"}}>
    {cols.map((c, t) => Array.from({length: 4}, (_, k) => <div key={`${t}${k}`} style={{position: "absolute", left: 14 + k * 78 + (random(`j${t}${k}${Math.floor(fr / 4)}`) - 0.5) * 18, top: 150 + t * 38,
      width: 60, height: 28, borderRadius: 5, background: c}} />))}
    <div style={{position: "absolute", left: (fr * 9) % 300 + 10, top: 140, width: 3, height: 200, background: "white"}} />
    <div style={{position: "absolute", left: 0, width: "100%", top: 40, textAlign: "center", fontFamily: "Pop", fontWeight: 900, fontSize: 40, color: "#ff6b6b"}}>3:12 h</div>
    {[40, -40].map((r) => <div key={r} style={{position: "absolute", left: 20, top: 190, width: 300 * x, height: 18, background: RED, borderRadius: 9, rotate: `${r}deg`, transformOrigin: "150px 9px"}} />)}
  </AbsoluteFill>;
};
const Szene1: React.FC<{s: (typeof TL)[number]}> = ({s}) => {
  const fr = useCurrentFrame();
  const y = interpolate(fr, [0, 12], [140, 0], {...C, easing: out});
  return <>
    <Basis a={s.a} />
    <div style={{position: "absolute", left: 0, width: W, top: 345 + y, textAlign: "center", fontFamily: "Pop", fontWeight: 900, fontSize: 200, letterSpacing: -6, color: "white",
      opacity: interpolate(fr, [0, 8], [0, 1], C), textShadow: "0 14px 40px rgba(0,0,0,.3)"}}>claude</div>
    <Cut a={s.a} />
    <Karte x={70} y={760} w={340} h={430} rot={-7} delay={6}><Chaos /></Karte>
    <Untertitel s={s} />
  </>;
};
// Szene 2: Chat-Zeile tippt sich
const SATZ = "Mach einen 3D-Ring aus Text um mich";
const Szene2: React.FC<{s: (typeof TL)[number]}> = ({s}) => {
  const fr = useCurrentFrame();
  const n = Math.floor(interpolate(fr, [4, 46], [0, SATZ.length], C));
  return <>
    <Basis a={s.a} />
    <div style={{position: "absolute", left: 120, width: 840, top: 1330, padding: "26px 30px", borderRadius: 30, background: "rgba(30,30,32,.92)", boxShadow: "0 20px 44px rgba(0,0,0,.45)",
      display: "flex", alignItems: "center", gap: 18, scale: String(interpolate(fr, [0, 8], [0.7, 1], {...C, easing: pop})), rotate: "-2deg"}}>
      <span style={{color: "#d97757", fontSize: 40}}>✳</span>
      <span style={{flex: 1, fontFamily: "Pop", fontWeight: 600, fontSize: 36, color: "white"}}>{SATZ.slice(0, n)}<span style={{opacity: fr % 14 < 7 ? 1 : 0}}>|</span></span>
      <span style={{width: 56, height: 56, borderRadius: 28, background: "white", color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900}}>↑</span>
    </div>
    <Untertitel s={s} />
  </>;
};
// Szene 3: Karte rechts mit dem fertigen 3D-Ring
const Szene3: React.FC<{s: (typeof TL)[number]}> = ({s}) => (<>
  <Basis a={s.a} />
  <Karte x={640} y={560} w={380} h={676} rot={7} delay={2}>
    <OffthreadVideo src={staticFile("reel2.mp4")} startFrom={f(19.8)} muted style={{width: 380, height: 676}} />
  </Karte>
  <Untertitel s={s} />
</>);
// Szene 4: ROH und FERTIG nebeneinander
const Szene4: React.FC<{s: (typeof TL)[number]}> = ({s}) => (<>
  <Basis a={s.a} />
  <Karte x={170} y={1300} w={200} h={320} rot={-6} delay={4} label="ROH">
    <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(1)} muted style={{width: 200, height: 356, marginTop: -16}} />
  </Karte>
  <Karte x={470} y={1280} w={200} h={340} rot={6} delay={12} label="FERTIG">
    <OffthreadVideo src={staticFile("reel2.mp4")} startFrom={f(25.2)} muted style={{width: 200, height: 356}} />
  </Karte>
  <Untertitel s={{...s, top: 1100}} />
</>);
const Ende = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile("reel2.mp4")} startFrom={f(20.4)} muted style={{width: W, height: H, scale: String(interpolate(fr, [0, 10], [0.45, 1], {...C, easing: out})),
      rotate: `${interpolate(fr, [0, 10], [7, 0], C)}deg`}} />
  </AbsoluteFill>;
};
const SZENEN = [Szene1, Szene2, Szene3, Szene4];

export const Serie: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    {TL.map((s, i) => { const Sz = SZENEN[i]; return <Sequence key={i} from={f(s.at)} durationInFrames={f(s.at + s.b - s.a) - f(s.at)}><Sz s={s} /></Sequence>; })}
    <Sequence from={f(acc)}><Ende /></Sequence>
    <Sequence durationInFrames={f(acc)}>
      <Pille />
      <div style={{position: "absolute", left: 40, top: 1856, fontFamily: "Pop", fontWeight: 600, fontSize: 22, letterSpacing: 2, color: "white", textShadow: "0 1px 4px rgba(0,0,0,.8)"}}>KI-GENERIERT</div>
    </Sequence>
  </AbsoluteFill>
);
