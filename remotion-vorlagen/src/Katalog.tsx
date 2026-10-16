import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

const W = 1080, H = 1350, GOLD = "#e8c27a", INK = "#1e1814";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const fontFace = `
@font-face{font-family:'PF';src:url('${staticFile("pf700.woff")}') format('woff');font-weight:700}
@font-face{font-family:'PF';src:url('${staticFile("pf400.woff")}') format('woff');font-weight:400}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff")}') format('woff');font-weight:700;font-style:italic}`;
const stroke = `-3px -3px 0 ${INK},3px -3px 0 ${INK},-3px 3px 0 ${INK},3px 3px 0 ${INK},0 4px 14px rgba(0,0,0,.5)`;
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
const S = 3.2; // seconds per effect

const Label: React.FC<{n: number; t: string}> = ({n, t}) => (
  <div style={{position: "absolute", left: 30, top: 30, padding: "8px 18px", borderRadius: 30, background: "rgba(0,0,0,.72)", color: "white",
    fontFamily: "Poppins, sans-serif", fontSize: 30, fontWeight: 600}}>{n} · {t}</div>
);
const Badge = () => (
  <div style={{position: "absolute", left: 30, top: 1300, padding: "4px 12px", borderRadius: 8, background: "black", color: "white",
    fontFamily: "Poppins, sans-serif", fontSize: 22}}>KI-generiert</div>
);

// 1 karaoke captions
const E1 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const words = ["Ich", "baue", "mir", "mein", "Bild", "selbst."];
  const i = Math.floor(interpolate(f, [0.2 * fps, 2.6 * fps], [0, words.length], C));
  return (<>
    <Img src={staticFile("laptop.jpg")} style={{...full, scale: String(interpolate(f, [0, S * fps], [1.05, 1.0], C))}} />
    <div style={{position: "absolute", left: 60, right: 60, top: 980, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 76, lineHeight: 1.15}}>
      {words.map((w, k) => (
        <span key={k} style={{display: "inline-block", margin: "0 12px", color: k === i - 1 ? GOLD : "white", textShadow: stroke,
          opacity: k < i ? 1 : 0.0, scale: k === i - 1 ? "1.15" : "1"}}>{w.toUpperCase()}</span>))}
    </div>
    <Label n={1} t="Wort-für-Wort-Untertitel" />
  </>);
};

// 2 before/after slider
const E2 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const x = interpolate(f, [0.3 * fps, 1.6 * fps, 2.3 * fps, 3 * fps], [W, 380, 560, 520], {...C, easing: out});
  return (<>
    <Img src={staticFile("portrait.jpg")} style={full} />
    <div style={{position: "absolute", left: 0, top: 0, width: x, height: H, overflow: "hidden"}}><Img src={staticFile("selfie.jpg")} style={{...full, objectPosition: "50% 30%"}} /></div>
    <div style={{position: "absolute", left: x - 4, top: 0, width: 8, height: H, background: "white", boxShadow: "0 0 20px rgba(0,0,0,.4)"}} />
    <div style={{position: "absolute", left: x - 40, top: H / 2 - 40, width: 80, height: 80, borderRadius: 40, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontFamily: "Poppins"}}>⇆</div>
    <div style={{position: "absolute", left: 40, top: 1150, fontFamily: "PF", fontWeight: 700, fontSize: 64, color: "white", textShadow: stroke, opacity: x < 900 ? 1 : 0}}>Handyfoto</div>
    <div style={{position: "absolute", right: 40, top: 1150, fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 64, color: GOLD, textShadow: stroke, opacity: x < 700 ? 1 : 0}}>KI-Porträt</div>
    <Label n={2} t="Vorher / Nachher-Schieber" />
  </>);
};

// 3 card stack fanning out
const E3 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const imgs = ["bk02_Kaffee.jpg", "bk07_Cafe.jpg", "bk08_Spaziergang.jpg", "bk10_GoldeneStunde.jpg", "bk12_GuteNacht.jpg"];
  return (<AbsoluteFill style={{background: "linear-gradient(160deg,#2a211c,#5a3b33)"}}>
    {imgs.map((s, k) => {
      const t0 = (0.15 + k * 0.18) * fps;
      const fan = interpolate(f, [1.6 * fps, 2.3 * fps], [0, 1], {...C, easing: out});
      const rot = -24 + k * 12;
      return (<div key={k} style={{position: "absolute", left: W / 2 - 190, top: 300, width: 380, height: 640, borderRadius: 18, overflow: "hidden", border: "10px solid white",
        boxShadow: "0 20px 50px rgba(0,0,0,.5)", transformOrigin: "50% 120%",
        rotate: `${rot * fan + (k - 2) * 2}deg`,
        translate: interpolate(f, [t0, t0 + 0.4 * fps], ["0px 1300px", "0px 0px"], {...C, easing: out}),
      }}><Img src={staticFile(s)} style={{width: "100%", height: "100%", objectFit: "cover"}} /></div>);
    })}
    <div style={{position: "absolute", width: W, top: 1100, textAlign: "center", fontFamily: "PF", fontWeight: 700, fontSize: 70, color: "white", textShadow: stroke,
      opacity: interpolate(f, [2.2 * fps, 2.6 * fps], [0, 1], C)}}>Ein Tag. <span style={{fontStyle: "italic", color: GOLD}}>Zwölf</span> Bilder.</div>
    <Label n={3} t="Fotokarten fächern auf" />
  </AbsoluteFill>);
};

// 4 kinetic typography slam
const E4 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const ws = ["NEBEN", "DER", "SCHICHT.", "NACHTS."];
  return (<>
    <Img src={staticFile("bk12_GuteNacht.jpg")} style={full} />
    {ws.map((w, k) => {
      const t0 = (0.2 + k * 0.55) * fps;
      return (<div key={k} style={{position: "absolute", width: W, top: 640 + k * 150, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 900,
        fontSize: k === 3 ? 150 : 110, WebkitTextStroke: `3px ${INK}`, color: k === 3 ? GOLD : "white", letterSpacing: -2, textShadow: "0 8px 30px rgba(0,0,0,.6)",
        scale: String(interpolate(f, [t0, t0 + 0.25 * fps], [2.4, 1], {...C, easing: out})),
        opacity: interpolate(f, [t0, t0 + 0.12 * fps], [0, 1], C)}}>{w}</div>);
    })}
    <Label n={4} t="Wörter knallen rein" />
  </>);
};

// 5 zoom-through the eye into next image
const E5 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const z = interpolate(f, [0.2 * fps, 1.6 * fps], [1, 9], {...C, easing: Easing.bezier(0.7, 0, 0.84, 0)});
  const o2 = interpolate(f, [1.35 * fps, 1.65 * fps], [0, 1], C);
  return (<>
    <Img src={staticFile("portrait.jpg")} style={{...full, scale: String(z), transformOrigin: "548px 617px"}} />
    <Img src={staticFile("bk10_GoldeneStunde.jpg")} style={{...full, opacity: o2, scale: String(interpolate(f, [1.4 * fps, S * fps], [1.25, 1], {...C, easing: out}))}} />
    <div style={{position: "absolute", left: 70, top: 1120, fontFamily: "PF", fontWeight: 700, fontSize: 66, color: "white", textShadow: stroke, opacity: o2}}>
      Schau mir in die <span style={{fontStyle: "italic", color: GOLD}}>Augen</span>.</div>
    <Label n={5} t="Zoom durchs Auge" />
  </>);
};

// 6 handdrawn circle + arrow drawing on
const E6 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const d1 = interpolate(f, [0.3 * fps, 1.1 * fps], [1, 0], {...C, easing: out});
  const d2 = interpolate(f, [1.1 * fps, 1.6 * fps], [1, 0], {...C, easing: out});
  return (<>
    <Img src={staticFile("portrait.jpg")} style={full} />
    <svg width={W} height={H} style={{position: "absolute"}}>
      <path d="M 440 560 C 620 520, 700 600, 680 680 C 650 760, 380 760, 360 660 C 345 590, 420 545, 520 548" fill="none" stroke="#e0463c" strokeWidth={9} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={d1} />
      <path d="M 860 330 C 820 420, 760 500, 700 560 M 700 560 L 760 545 M 700 560 L 712 500" fill="none" stroke="#e0463c" strokeWidth={9} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={d2} />
    </svg>
    <div style={{position: "absolute", left: 700, top: 210, rotate: "-6deg", fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 72, color: "#e0463c",
      textShadow: "0 3px 0 white", opacity: interpolate(f, [1.5 * fps, 1.8 * fps], [0, 1], C)}}>Poren!</div>
    <Label n={6} t="Kreis & Pfeil zeichnen sich" />
  </>);
};

// 7 counter
const E7 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const v = Math.round(interpolate(f, [0.2 * fps, 2.0 * fps], [0, 848189], {...C, easing: out}));
  return (<>
    <Img src={staticFile("bk05_Schreibtisch.jpg")} style={full} />
    <div style={{position: "absolute", width: W, top: 470, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 150, color: "white", WebkitTextStroke: `4px ${INK}`,
      textShadow: "0 8px 30px rgba(0,0,0,.6)"}}>{v.toLocaleString("de-CH")}</div>
    <div style={{position: "absolute", width: W, top: 680, textAlign: "center", fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 70, color: GOLD,
      textShadow: stroke, opacity: interpolate(f, [2.0 * fps, 2.4 * fps], [0, 1], C)}}>Aufrufe in 30 Tagen</div>
    <Label n={7} t="Zahl zählt hoch" />
  </>);
};

// 8 chat bubbles
const E8 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const b = (t: number) => interpolate(f, [t * fps, (t + 0.3) * fps], [0, 1], {...C, easing: pop});
  const msg = "FOTO";
  return (<>
    <Img src={staticFile("bk07_Cafe.jpg")} style={{...full, filter: "blur(5px)"}} />
    <div style={{position: "absolute", left: 120, top: 380, maxWidth: 700, padding: "26px 34px", borderRadius: "34px 34px 34px 8px", background: "white",
      fontFamily: "Poppins, sans-serif", fontSize: 44, color: INK, scale: String(b(0.3)), transformOrigin: "0% 100%"}}>Wie machst du diese Bilder? 😍</div>
    <div style={{position: "absolute", right: 120, top: 600, padding: "26px 34px", borderRadius: "34px 34px 8px 34px", background: "#3797f0",
      fontFamily: "Poppins, sans-serif", fontSize: 44, color: "white", scale: String(b(1.1)), transformOrigin: "100% 100%"}}>Schreib {msg} in die Kommentare 🤍</div>
    <div style={{position: "absolute", left: 120, top: 820, padding: "26px 34px", borderRadius: "34px 34px 34px 8px", background: "white",
      fontFamily: "Poppins, sans-serif", fontSize: 44, color: INK, scale: String(b(2.0)), transformOrigin: "0% 100%"}}>FOTO</div>
    <Label n={8} t="Chat-Blasen" />
  </>);
};

export const Katalog: React.FC = () => {
  const {fps} = useVideoConfig();
  const d = Math.round(S * fps);
  return (
    <AbsoluteFill style={{background: "black"}}>
      <style>{fontFace}</style>
      <Sequence from={0 * d} durationInFrames={d} premountFor={fps}><E1 /></Sequence>
      <Sequence from={1 * d} durationInFrames={d} premountFor={fps}><E2 /></Sequence>
      <Sequence from={2 * d} durationInFrames={d} premountFor={fps}><E3 /></Sequence>
      <Sequence from={3 * d} durationInFrames={d} premountFor={fps}><E4 /></Sequence>
      <Sequence from={4 * d} durationInFrames={d} premountFor={fps}><E5 /></Sequence>
      <Sequence from={5 * d} durationInFrames={d} premountFor={fps}><E6 /></Sequence>
      <Sequence from={6 * d} durationInFrames={d} premountFor={fps}><E7 /></Sequence>
      <Sequence from={7 * d} durationInFrames={d} premountFor={fps}><E8 /></Sequence>
      <Badge />
    </AbsoluteFill>
  );
};
