import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
const POP = "Pop", PF = "PF";
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff2")}') format('woff2');font-weight:700;font-style:italic}`;
const W = 1080, H = 1920, GOLD = "#e8c27a", RED = "#b3122a";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H};

const Label: React.FC<{n: number; t: string}> = ({n, t}) => (
  <div style={{position: "absolute", left: 90, top: 1700, padding: "10px 24px", borderRadius: 40, background: "white", color: "#1e1814",
    fontFamily: POP, fontWeight: 600, fontSize: 34, boxShadow: "0 10px 24px rgba(0,0,0,.3)"}}>{n} · {t}</div>
);
const Badge = () => (
  <div style={{position: "absolute", left: 40, top: 1850, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: POP, fontSize: 24}}>KI-generiert</div>
);
const zoom = (f: number) => String(interpolate(f, [0, 120], [1.0, 1.06], C));

// 1 · Wort steigt hinter dir hoch
const HinterDir = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [8, 45], [260, 0], {...C, easing: out});
  const o = interpolate(f, [8, 30], [0, 1], C);
  const s = zoom(f);
  return (<>
    <Img src={staticFile("foto.jpg")} style={{...full, scale: s}} />
    <div style={{...full, scale: s, display: "flex", justifyContent: "center"}}>
      <div style={{position: "absolute", top: 40 + y, fontFamily: POP, fontWeight: 900, fontSize: 350, letterSpacing: 30, paddingLeft: 30, color: "white", opacity: o,
        textShadow: "0 18px 50px rgba(0,0,0,.45)"}}>FREI</div>
    </div>
    <Img src={staticFile("cutout.png")} style={{...full, scale: s}} />
    <Label n={1} t="Wort hinter dir" />
  </>);
};

// 2 · Buchstaben kreisen um dich (vorne und hinten)
const TEXT = "ICH BIN GENUG ✦ ICH BIN GENUG ✦ ";
const Ring: React.FC<{front: boolean}> = ({front}) => {
  const f = useCurrentFrame();
  const cx = 515, cy = 560, rx = 360, ry = 90;
  const o = interpolate(f, [0, 15], [0, 1], C);
  return (<>{TEXT.split("").map((ch, i) => {
    const a = -(i / TEXT.length) * Math.PI * 2 - f * 0.035;
    const depth = Math.sin(a); // >0 = vorne
    if ((depth > 0) !== front) return null;
    const x = cx + Math.cos(a) * rx, y = cy + depth * ry;
    const sc = 0.75 + (depth + 1) * 0.25;
    return <div key={i} style={{position: "absolute", left: x - 30, top: y - 40, width: 60, textAlign: "center", fontFamily: POP, fontWeight: 900,
      fontSize: 64, color: depth > 0 ? "white" : GOLD, opacity: o * (0.55 + (depth + 1) * 0.225), scale: String(sc),
      textShadow: "0 4px 14px rgba(0,0,0,.55)"}}>{ch}</div>;
  })}</>);
};
const Kreisen = () => {
  const f = useCurrentFrame();
  const s = zoom(f);
  return (<>
    <Img src={staticFile("foto.jpg")} style={{...full, scale: s}} />
    <div style={{...full, scale: s}}><Ring front={false} /></div>
    <Img src={staticFile("cutout.png")} style={{...full, scale: s}} />
    <div style={{...full, scale: s}}><Ring front /></div>
    <Label n={2} t="Buchstaben kreisen um dich" />
  </>);
};

// 3 · Aus dem Bild treten
const FX = 150, FY = 560, FW = 780, FH = 1020;
const AusDemBild = () => {
  const f = useCurrentFrame();
  const fr = interpolate(f, [0, 25], [0.85, 1], {...C, easing: out});
  const step = interpolate(f, [30, 75], [0, 1], {...C, easing: out});
  const t = `scale(${fr * (1 + step * 0.07)}) translateY(${-step * 40}px)`;
  return (<AbsoluteFill style={{background: "#2a211c"}}>
    <Img src={staticFile("foto.jpg")} style={{...full, filter: "blur(24px)", scale: "1.15"}} />
    <div style={{...full, transform: `scale(${fr})`, transformOrigin: "540px 1070px"}}>
      <div style={{position: "absolute", left: FX - 22, top: FY - 22, width: FW + 44, height: FH + 110, background: "#fbf7f0", boxShadow: "0 30px 60px rgba(0,0,0,.45)", rotate: "-2deg"}} />
      <div style={{position: "absolute", left: FX, top: FY, width: FW, height: FH, overflow: "hidden", rotate: "-2deg"}}>
        <Img src={staticFile("foto.jpg")} style={{position: "absolute", left: -FX, top: -FY, width: W, height: H}} />
      </div>
      <div style={{position: "absolute", left: FX, top: FY + FH + 18, width: FW, textAlign: "center", fontFamily: PF, fontStyle: "italic", fontWeight: 700, fontSize: 54, color: RED, rotate: "-2deg"}}>raus aus dem Rahmen</div>
    </div>
    <Img src={staticFile("cutout.png")} style={{...full, transform: t, transformOrigin: "540px 1070px", opacity: interpolate(f, [22, 32], [0, 1], C),
      clipPath: `inset(0 0 ${H - FY - 40}px 0)`}} />
    <Label n={3} t="Aus dem Bild treten" />
  </AbsoluteFill>);
};

export const EffektMuster: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    <Sequence durationInFrames={120}><HinterDir /></Sequence>
    <Sequence from={120} durationInFrames={120}><Kreisen /></Sequence>
    <Sequence from={240} durationInFrames={120}><AusDemBild /></Sequence>
    <Badge />
  </AbsoluteFill>
);
