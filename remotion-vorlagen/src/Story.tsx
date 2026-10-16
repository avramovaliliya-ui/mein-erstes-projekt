import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

const W = 1080, H = 1920, GOLD = "#e8c27a", INK = "#1e1814", ROSE = "#d98b8b";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const inq = Easing.bezier(0.7, 0, 0.84, 0);
const fontFace = `
@font-face{font-family:'PF';src:url('${staticFile("pf700.woff")}') format('woff');font-weight:700}
@font-face{font-family:'PF';src:url('${staticFile("pf400.woff")}') format('woff');font-weight:400}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff")}') format('woff');font-weight:700;font-style:italic}`;
const stroke = `-3px -3px 0 ${INK},3px -3px 0 ${INK},-3px 3px 0 ${INK},3px 3px 0 ${INK},0 4px 14px rgba(0,0,0,.45)`;
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
const S = 3.2;

const Label: React.FC<{n: number; t: string}> = ({n, t}) => (
  <div style={{position: "absolute", left: 40, top: 260, padding: "10px 22px", borderRadius: 30, background: "rgba(0,0,0,.72)", color: "white",
    fontFamily: "Poppins, sans-serif", fontSize: 34, fontWeight: 600}}>{n} · {t}</div>
);
const Sent: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 1430}) => (
  <div style={{position: "absolute", left: 90, right: 250, top, fontFamily: "PF", fontWeight: 400, fontSize: 58, lineHeight: 1.2, color: "white", textShadow: stroke}}>{children}</div>
);
const I: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{fontStyle: "italic", fontWeight: 700}}>{children}</span>;

// 1 emoji rain
const T1 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const em = ["🤍", "✨", "😍", "🔥", "🤍", "✨"];
  return (<>
    <Img src={staticFile("bk10_GoldeneStunde.jpg")} style={full} />
    {new Array(22).fill(0).map((_, k) => {
      const x = (k % 2 ? 830 + random("x" + k) * 200 : random("x" + k) * 200), d = 0.6 + random("d" + k) * 1.4, t0 = random("t" + k) * 1.4 * fps;
      const y = interpolate(f, [t0, t0 + d * 2 * fps], [H + 100, -200], C);
      return <div key={k} style={{position: "absolute", left: x, top: y, fontSize: 50 + random("s" + k) * 50, rotate: `${Math.sin((f + k * 9) / 8) * 15}deg`}}>{em[k % em.length]}</div>;
    })}
    <Sent>Danke für <I>2.187</I> von euch 🤍</Sent>
    <Label n={1} t="Emoji-Regen" />
  </>);
};

// 2 poll sticker look
const T2 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = interpolate(f, [0.2 * fps, 0.6 * fps], [0, 1], {...C, easing: pop});
  const a = interpolate(f, [1.2 * fps, 2.2 * fps], [0, 72], {...C, easing: out});
  return (<>
    <Img src={staticFile("bk07_Cafe.jpg")} style={full} />
    <div style={{position: "absolute", left: 190, top: 1080, width: 700, padding: 34, borderRadius: 30, background: "white", scale: String(s), rotate: "-2deg",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)", fontFamily: "Poppins, sans-serif"}}>
      <div style={{fontSize: 40, fontWeight: 700, textAlign: "center", color: INK, marginBottom: 24}}>Echt oder KI? 🤔</div>
      {[["Echt", a], ["KI", 100 - a]].map(([t, v], k) => (
        <div key={k} style={{position: "relative", height: 84, borderRadius: 20, background: "#eee", marginTop: 14, overflow: "hidden"}}>
          <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${f > 1.2 * fps ? v : 0}%`, background: k ? "linear-gradient(90deg,#f58529,#dd2a7b)" : "#c9c9c9"}} />
          <div style={{position: "absolute", left: 28, top: 18, fontSize: 38, fontWeight: 700, color: INK}}>{t as string}</div>
          <div style={{position: "absolute", right: 28, top: 18, fontSize: 38, fontWeight: 700, color: INK, opacity: f > 1.2 * fps ? 1 : 0}}>{Math.round(v as number)}%</div>
        </div>))}
    </div>
    <Label n={2} t="Umfrage-Look" />
  </>);
};

// 3 double exposure: her silhouette filled with autumn scene
const T3 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const o = interpolate(f, [0.3 * fps, 1.5 * fps], [0, 0.6], C);
  return (<AbsoluteFill style={{background: "#efe9e2"}}>
    <Img src={staticFile("cutout.png")} style={{...full, objectPosition: "50% 0%"}} />
    <div style={{...full, WebkitMaskImage: `url(${staticFile("cutout.png")})`, WebkitMaskSize: "cover", WebkitMaskPosition: "50% 0%", opacity: o, mixBlendMode: "screen"}}>
      <Img src={staticFile("bk10_GoldeneStunde.jpg")} style={{...full, scale: String(interpolate(f, [0, S * fps], [1.25, 1.05], C))}} />
    </div>
    <Sent>Zwei Welten – <I>eine</I> Frau.</Sent>
    <Label n={3} t="Doppelbelichtung" />
  </AbsoluteFill>);
};

// 4 clone / double: real vs AI side by side
const T4 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const l = interpolate(f, [0.2 * fps, 0.9 * fps], [-W / 2, 0], {...C, easing: out});
  const r = interpolate(f, [0.5 * fps, 1.2 * fps], [W / 2, 0], {...C, easing: out});
  const tag = (t: string, d: number) => interpolate(f, [d * fps, (d + 0.3) * fps], [0, 1], {...C, easing: pop});
  return (<AbsoluteFill style={{background: "#111"}}>
    <div style={{position: "absolute", left: l, top: 0, width: W / 2, height: H, overflow: "hidden"}}><Img src={staticFile("selfie.jpg")} style={{width: W / 2, height: H, objectFit: "cover", objectPosition: "50% 30%"}} /></div>
    <div style={{position: "absolute", left: W / 2 + r, top: 0, width: W / 2, height: H, overflow: "hidden"}}><Img src={staticFile("portrait.jpg")} style={{width: W / 2, height: H, objectFit: "cover", objectPosition: "45% 30%"}} /></div>
    <div style={{position: "absolute", left: W / 2 - 3, top: 0, width: 6, height: H, background: "white"}} />
    <div style={{position: "absolute", left: 80, top: 1450, padding: "12px 26px", borderRadius: 40, background: "white", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, scale: String(tag("a", 1.3))}}>📱 Ich</div>
    <div style={{position: "absolute", right: 80, top: 1450, padding: "12px 26px", borderRadius: 40, background: GOLD, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, scale: String(tag("b", 1.6))}}>✨ KI-Ich</div>
    <Label n={4} t="Doppel: Ich & KI-Ich" />
  </AbsoluteFill>);
};

// 5 parallax 2.5D: background and cutout move differently
const T5 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const p = interpolate(f, [0, S * fps], [0, 1], {...C, easing: Easing.bezier(0.45, 0, 0.55, 1)});
  return (<>
    <Img src={staticFile("portrait.jpg")} style={{...full, scale: String(1.25 - 0.08 * p), translate: `${-60 + 120 * p}px 0px`, filter: "blur(3px)"}} />
    <Img src={staticFile("cutout.png")} style={{...full, scale: String(1.05 + 0.1 * p), translate: `${40 - 80 * p}px 0px`}} />
    <Sent>Bewegung aus <I>einem</I> Foto.</Sent>
    <Label n={5} t="3D-Tiefe (Parallax)" />
  </>);
};

// 6 3D tilt card
const T6 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const ry = interpolate(f, [0, 1.2 * fps, S * fps], [-55, 8, -8], {...C, easing: out});
  const rx = interpolate(f, [0, 1.2 * fps, S * fps], [20, -4, 4], {...C, easing: out});
  return (<AbsoluteFill style={{background: "linear-gradient(170deg,#e9ddd3,#c99b8f)", perspective: 1600}}>
    <div style={{position: "absolute", left: 160, top: 330, width: 760, height: 1100, borderRadius: 40, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.4)",
      transform: `rotateY(${ry}deg) rotateX(${rx}deg)`, border: "12px solid white"}}>
      <Img src={staticFile("bk02_Kaffee.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
    </div>
    <Sent top={1500}>Mein Morgen – <I>neu</I> gedacht.</Sent>
    <Label n={6} t="3D-Kippen" />
  </AbsoluteFill>);
};

// 7 whip pan transition
const T7 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const x = interpolate(f, [1.1 * fps, 1.5 * fps], [0, -W], {...C, easing: inq});
  const blur = interpolate(f, [1.0 * fps, 1.3 * fps, 1.6 * fps], [0, 40, 0], C);
  return (<>
    <div style={{position: "absolute", left: x, top: 0, width: 2 * W, height: H, filter: `blur(${blur}px)`}}>
      <Img src={staticFile("bk08_Spaziergang.jpg")} style={{position: "absolute", left: 0, width: W, height: H, objectFit: "cover"}} />
      <Img src={staticFile("bk12_GuteNacht.jpg")} style={{position: "absolute", left: W, width: W, height: H, objectFit: "cover"}} />
    </div>
    <Sent>{f < 1.3 * fps ? <>Tagsüber: <I>Schicht</I>.</> : <>Nachts: <I>mein</I> Business.</>}</Sent>
    <Label n={7} t="Wisch-Übergang" />
  </>);
};

// 8 dolly zoom (vertigo)
const T8 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const p = interpolate(f, [0.2 * fps, 2.6 * fps], [0, 1], {...C, easing: Easing.bezier(0.45, 0, 0.55, 1)});
  return (<>
    <Img src={staticFile("portrait.jpg")} style={{...full, scale: String(1 + 0.6 * p), filter: "blur(2px)"}} />
    <Img src={staticFile("cutout.png")} style={{...full, scale: String(1.15 - 0.12 * p), transformOrigin: "50% 40%"}} />
    <Sent>Wenn dir <I>alles</I> zu viel wird …</Sent>
    <Label n={8} t="Vertigo-Zoom" />
  </>);
};

// 9 highlighter marker behind words
const T9 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const w1 = interpolate(f, [0.5 * fps, 1.1 * fps], [0, 100], {...C, easing: out});
  return (<>
    <Img src={staticFile("bk05_Schreibtisch.jpg")} style={full} />
    <div style={{position: "absolute", left: 90, top: 1380, fontFamily: "PF", fontSize: 64, color: INK, lineHeight: 1.35}}>
      <div style={{display: "inline-block", position: "relative", padding: "0 14px"}}>
        <div style={{position: "absolute", left: 0, top: 10, bottom: 6, width: `${w1}%`, background: "rgba(255,226,140,.95)", borderRadius: 8, rotate: "-1deg"}} />
        <span style={{position: "relative", fontWeight: 700}}>Keine Technik.</span>
      </div><br />
      <div style={{display: "inline-block", position: "relative", padding: "0 14px"}}>
        <div style={{position: "absolute", left: 0, top: 10, bottom: 6, width: `${interpolate(f, [1.3 * fps, 1.9 * fps], [0, 100], {...C, easing: out})}%`, background: "rgba(255,190,200,.95)", borderRadius: 8, rotate: "1deg"}} />
        <span style={{position: "relative", fontWeight: 700, fontStyle: "italic"}}>Nur kopieren.</span>
      </div>
    </div>
    <Label n={9} t="Textmarker" />
  </>);
};

// 10 countdown + progress
const T10 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const n = 3 - Math.floor(interpolate(f, [0.2 * fps, 2.6 * fps], [0, 3], C));
  const sc = interpolate((f - 0.2 * fps) % fps, [0, 0.3 * fps], [1.6, 1], {...C, easing: out});
  return (<>
    <Img src={staticFile("portrait.jpg")} style={full} />
    <div style={{position: "absolute", width: W, top: 1480, textAlign: "center", fontFamily: "PF", fontWeight: 700, fontSize: 220, color: "white", textShadow: stroke, scale: String(sc)}}>
      {n > 0 ? n : "🔥"}</div>
    <div style={{position: "absolute", left: 90, right: 90, top: 1790, height: 22, borderRadius: 11, background: "rgba(255,255,255,.5)"}}>
      <div style={{width: `${interpolate(f, [0.2 * fps, 2.6 * fps], [0, 100], C)}%`, height: "100%", borderRadius: 11, background: GOLD}} />
    </div>
    <div style={{position: "absolute", width: W, top: 1420, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "white", textShadow: stroke}}>Neues Reel kommt in …</div>
    <Label n={10} t="Countdown" />
  </>);
};

export const Story: React.FC = () => {
  const {fps} = useVideoConfig();
  const d = Math.round(S * fps);
  const L = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10];
  return (
    <AbsoluteFill style={{background: "black"}}>
      <style>{fontFace}</style>
      <Sequence from={0 * d} durationInFrames={d} premountFor={fps}><T1 /></Sequence>
      <Sequence from={1 * d} durationInFrames={d} premountFor={fps}><T2 /></Sequence>
      <Sequence from={2 * d} durationInFrames={d} premountFor={fps}><T3 /></Sequence>
      <Sequence from={3 * d} durationInFrames={d} premountFor={fps}><T4 /></Sequence>
      <Sequence from={4 * d} durationInFrames={d} premountFor={fps}><T5 /></Sequence>
      <Sequence from={5 * d} durationInFrames={d} premountFor={fps}><T6 /></Sequence>
      <Sequence from={6 * d} durationInFrames={d} premountFor={fps}><T7 /></Sequence>
      <Sequence from={7 * d} durationInFrames={d} premountFor={fps}><T8 /></Sequence>
      <Sequence from={8 * d} durationInFrames={d} premountFor={fps}><T9 /></Sequence>
      <Sequence from={9 * d} durationInFrames={d} premountFor={fps}><T10 /></Sequence>
      <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
      {L.length ? null : null}
    </AbsoluteFill>
  );
};
