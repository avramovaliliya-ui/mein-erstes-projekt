import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

const W = 1080, H = 1920, C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1), out = Easing.bezier(0.16, 1, 0.3, 1), io = Easing.inOut(Easing.cubic);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
const SEG = 105, GOLD = "#e8c27a", INK = "#1e1814";
const fontFace = `@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff")}') format('woff');font-weight:700;font-style:italic}`;
const Label: React.FC<{n: string}> = ({n}) => <div style={{position: "absolute", left: 90, top: 260, padding: "10px 24px", borderRadius: 40, background: "white", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 34, color: INK, boxShadow: "0 10px 24px rgba(0,0,0,.3)", zIndex: 5}}>{n}</div>;

// 1 — she steps out of the frame, the frame stays
const OutOfFrame = () => {
  const f = useCurrentFrame();
  const L = 170, T = 560, R = 170, B = 420; // frame insets (frame: x170–910, y560–1500)
  const fs = interpolate(f, [0, 16], [0.85, 1], {...C, easing: pop});
  const p = interpolate(f, [30, 60], [0, 1], {...C, easing: io});
  const sc = 1 + 0.16 * p;
  const clip = `inset(${T * (1 - p)}px ${R * (1 - p)}px ${B}px ${L * (1 - p)}px)`;
  return (<AbsoluteFill>
    <Img src={staticFile("u07.jpg")} style={{...full, filter: "blur(22px)", scale: "1.1"}} />
    <div style={{position: "absolute", inset: 0, scale: String(fs)}}>
      <div style={{position: "absolute", left: L - 16, top: T - 16, width: W - L - R + 32, height: H - T - B + 32, background: "white", boxShadow: "0 30px 60px rgba(0,0,0,.35)"}} />
      <Img src={staticFile("u07.jpg")} style={{...full, clipPath: `inset(${T}px ${R}px ${B}px ${L}px)`}} />
      <Img src={staticFile("cut_u07.png")} style={{...full, clipPath: clip, transformOrigin: `540px ${H - B}px`, scale: String(sc), filter: `drop-shadow(0 ${20 * p}px ${30 * p}px rgba(0,0,0,.35))`}} />
    </div>
    <Label n="Aus dem Foto treten" />
  </AbsoluteFill>);
};

// 2 — 3D photo: person and background move against each other
const Photo3D = () => {
  const f = useCurrentFrame();
  const m = Math.sin(interpolate(f, [0, SEG], [-Math.PI / 2, Math.PI * 1.1]));
  const z = interpolate(f, [0, SEG], [1.08, 1.18]);
  return (<AbsoluteFill style={{perspective: 1500}}>
    <div style={{position: "absolute", inset: 0, transform: `rotateY(${m * 5}deg)`, transformStyle: "preserve-3d"}}>
      <Img src={staticFile("u14.jpg")} style={{...full, scale: String(z + 0.04), translate: `${-m * 22}px 0px`}} />
      <Img src={staticFile("cut_u14.png")} style={{...full, scale: String(z + 0.06), translate: `${m * 30}px ${-6}px`, filter: "drop-shadow(0 10px 20px rgba(0,0,0,.25))"}} />
    </div>
    <Label n="Dein Foto in 3D" />
  </AbsoluteFill>);
};

// 3 — polaroid drops in and develops
const Polaroid = () => {
  const f = useCurrentFrame();
  const drop = interpolate(f, [0, 18], [-1400, 0], {...C, easing: out});
  const rot = interpolate(f, [0, 18, 30], [-25, 6, -4], {...C, easing: out});
  const shake = f > 18 && f < 40 ? Math.sin(f * 1.6) * interpolate(f, [18, 40], [12, 0], C) : 0;
  const d = interpolate(f, [24, 92], [0, 1], {...C, easing: io});
  const filt = `brightness(${0.35 + 0.65 * d}) sepia(${1 - d}) saturate(${0.2 + 0.8 * d}) contrast(${0.7 + 0.3 * d}) blur(${(1 - d) * 4}px)`;
  return (<AbsoluteFill>
    <Img src={staticFile("u02.jpg")} style={{...full, filter: "blur(24px)", scale: "1.1"}} />
    <div style={{position: "absolute", left: 180, top: 520, width: 720, height: 860, background: "#fbfaf7", padding: "40px 40px 0", boxShadow: "0 40px 70px rgba(0,0,0,.4)",
      translate: `${shake}px ${drop}px`, rotate: `${rot}deg`}}>
      <div style={{width: 640, height: 640, overflow: "hidden", background: "#2a2220"}}>
        <Img src={staticFile("u02.jpg")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%", filter: filt}} /></div>
      <div style={{textAlign: "center", marginTop: 34, fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 64, color: INK, opacity: interpolate(f, [70, 90], [0, 1], C)}}>mein KI-Ich ✨</div>
    </div>
    <Label n="Polaroid entwickelt sich" />
  </AbsoluteFill>);
};

// 4 — mirror: phone photo left, AI version appears as the reflection
const Mirror = () => {
  const f = useCurrentFrame();
  const line = interpolate(f, [0, 14], [0, 1], {...C, easing: out});
  const flip = interpolate(f, [16, 44], [90, 0], {...C, easing: out});
  const shine = interpolate(f, [44, 70], [-300, 900], C);
  const pill = (t: string, x: number, o: number) => <div style={{position: "absolute", left: x, top: 1500, width: 300, textAlign: "center", padding: "10px 0", borderRadius: 40, background: "white",
    fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 36, color: INK, opacity: o, boxShadow: "0 10px 24px rgba(0,0,0,.3)"}}>{t}</div>;
  return (<AbsoluteFill style={{background: "#f3ece4", perspective: 1800}}>
    <div style={{position: "absolute", left: 0, top: 0, width: 540, height: H, overflow: "hidden"}}>
      <Img src={staticFile("selfie.jpg")} style={{width: 540, height: H, objectFit: "cover", objectPosition: "50% 30%"}} /></div>
    <div style={{position: "absolute", left: 540, top: 0, width: 540, height: H, overflow: "hidden", transformOrigin: "0% 50%", transform: `rotateY(${-flip}deg)`}}>
      <Img src={staticFile("bk_02.jpg")} style={{width: 540, height: H, objectFit: "cover", objectPosition: "50% 30%"}} />
      <div style={{position: "absolute", top: 0, left: shine, width: 160, height: H, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)", rotate: "12deg"}} />
    </div>
    <div style={{position: "absolute", left: 534, top: H / 2 - (H / 2) * line, width: 12, height: H * line, background: `linear-gradient(${GOLD},#fff6d8,${GOLD})`, boxShadow: "0 0 25px rgba(255,230,160,.9)"}} />
    {pill("HANDYFOTO", 120, interpolate(f, [8, 20], [0, 1], C))}
    {pill("KI-ICH", 660, interpolate(f, [40, 52], [0, 1], C))}
    <Label n="Spiegel-Effekt" />
  </AbsoluteFill>);
};

// 5 — floating 3D phone with the Baukasten screen recording
const Phone = () => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 22], [1500, 0], {...C, easing: out});
  const ry = interpolate(f, [0, SEG], [-32, 18], {easing: io});
  const fl = Math.sin(f / 12) * 14;
  const tap = interpolate(f, [62, 80], [0, 1], C);
  return (<AbsoluteFill style={{perspective: 1600}}>
    <Img src={staticFile("u07.jpg")} style={{...full, filter: "blur(26px)", scale: "1.1"}} />
    <div style={{position: "absolute", left: 270, top: 380, width: 540, height: 1100, borderRadius: 80, background: "#111", padding: 20, boxShadow: "0 60px 90px rgba(0,0,0,.45)",
      transform: `translateY(${enter + fl}px) rotateY(${ry}deg) rotateX(8deg)`}}>
      <div style={{position: "relative", width: 500, height: 1060, borderRadius: 62, overflow: "hidden", background: "white"}}>
        <OffthreadVideo src={staticFile("rec.mp4")} startFrom={120} style={{width: "100%", height: "100%", objectFit: "cover"}} muted />
        <div style={{position: "absolute", left: 175, top: 18, width: 150, height: 40, borderRadius: 20, background: "#111"}} />
        <div style={{position: "absolute", inset: 0, background: `linear-gradient(${110 + ry}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.28) 45%, rgba(255,255,255,0) 60%)`}} />
        {tap > 0 && tap < 1 && <div style={{position: "absolute", left: 250 - 40 - 80 * tap, top: 760 - 40 - 80 * tap, width: 80 + 160 * tap, height: 80 + 160 * tap, borderRadius: "50%", border: `${8 * (1 - tap)}px solid ${GOLD}`}} />}
      </div>
    </div>
    <div style={{position: "absolute", left: 500, top: 1180, fontSize: 110, opacity: interpolate(f, [52, 60], [0, 1], C), translate: `0px ${interpolate(f, [52, 62, 70], [60, 0, 10], C)}px`}}>👆</div>
    <Label n="Handy in 3D" />
  </AbsoluteFill>);
};

export const Magie: React.FC = () => (
  <AbsoluteFill style={{background: "#111"}}>
    <style>{fontFace}</style>
    {[OutOfFrame, Photo3D, Polaroid, Mirror, Phone].map((Comp, i) => <Sequence key={i} from={i * SEG} durationInFrames={SEG} premountFor={30}><Comp /></Sequence>)}
    <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
  </AbsoluteFill>
);
