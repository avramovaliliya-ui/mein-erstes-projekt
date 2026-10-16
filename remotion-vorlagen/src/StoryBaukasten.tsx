import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";

const W = 1080, H = 1920, C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1), out = Easing.bezier(0.16, 1, 0.3, 1), io = Easing.inOut(Easing.cubic);
const INK = "#1e1814", GOLD = "#e8c27a";
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
const fonts = `@font-face{font-family:'PF';src:url('${staticFile("pf700.woff")}') format('woff');font-weight:700}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff")}') format('woff');font-weight:700;font-style:italic}`;
const stroke = [-5, 0, 5].flatMap((x) => [-5, 0, 5].map((y) => `${x}px ${y}px 0 ${INK}`)).join(",") + ",0 8px 18px rgba(0,0,0,.35)";

// story text: one sentence, left 85px, lower quarter, italic words marked with *…*
const StoryText: React.FC<{lines: string[]; at: number; top?: number}> = ({lines, at, top = 1400}) => {
  const f = useCurrentFrame();
  return (<div style={{position: "absolute", left: 85, top, width: 760}}>
    {lines.map((ln, i) => {
      const t0 = at + i * 6, o = interpolate(f, [t0, t0 + 12], [0, 1], C), dy = interpolate(f, [t0, t0 + 14], [26, 0], {...C, easing: out});
      return <div key={i} style={{fontFamily: "PF", fontWeight: 700, fontSize: 64, lineHeight: "82px", color: "white", textShadow: stroke, whiteSpace: "nowrap", opacity: o, translate: `0px ${dy}px`}}>
        {ln.split(/(\*[^*]+\*)/).map((p, k) => p.startsWith("*") ? <span key={k} style={{fontStyle: "italic"}}>{p.slice(1, -1)}</span> : <span key={k}>{p}</span>)}
      </div>;
    })}
  </div>);
};
const Badge = () => <div style={{position: "absolute", left: 40, top: 1856, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 24}}>KI-generiert</div>;

// 1 — Handyfoto as polaroid that develops
export const StoryB1: React.FC = () => {
  const f = useCurrentFrame();
  const drop = interpolate(f, [8, 28], [-1500, 0], {...C, easing: out});
  const rot = interpolate(f, [8, 28, 40], [-30, 2, -7], {...C, easing: out});
  const shake = f > 28 && f < 50 ? Math.sin(f * 1.6) * interpolate(f, [28, 50], [10, 0], C) : 0;
  const d = interpolate(f, [34, 110], [0, 1], {...C, easing: io});
  const filt = `brightness(${0.35 + 0.65 * d}) sepia(${1 - d}) saturate(${0.2 + 0.8 * d}) contrast(${0.7 + 0.3 * d}) blur(${(1 - d) * 4}px)`;
  return (<AbsoluteFill style={{background: "#111"}}>
    <style>{fonts}</style>
    <Img src={staticFile("u12.jpg")} style={{...full, scale: String(interpolate(f, [0, 180], [1.02, 1.07]))}} />
    <div style={{position: "absolute", left: 650, top: 820, width: 340, height: 410, background: "#fbfaf7", padding: "20px 20px 0", boxShadow: "0 30px 60px rgba(0,0,0,.4)", translate: `${shake}px ${drop}px`, rotate: `${rot}deg`}}>
      <div style={{width: 300, height: 300, overflow: "hidden", background: "#2a2220"}}><Img src={staticFile("selfie.jpg")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", filter: filt}} /></div>
      <div style={{textAlign: "center", marginTop: 20, fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 34, color: INK, opacity: interpolate(f, [90, 110], [0, 1], C)}}>mein Handyfoto</div>
    </div>
    <StoryText lines={["Das ist mein *Handyfoto*", "– nichts Besonderes,", "oder?"]} at={50} />
    <Badge />
  </AbsoluteFill>);
};

// 2 — mirror: handyfoto left, AI image unfolds right
export const StoryB2: React.FC = () => {
  const f = useCurrentFrame();
  const line = interpolate(f, [0, 16], [0, 1], {...C, easing: out});
  const flip = interpolate(f, [18, 50], [90, 0], {...C, easing: out});
  const shine = interpolate(f, [52, 80], [-300, 900], C);
  const pill = (t: string, x: number, o: number) => <div style={{position: "absolute", left: x, top: 1270, padding: "10px 26px", borderRadius: 40, background: "white", fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 34, color: INK, opacity: o, boxShadow: "0 10px 24px rgba(0,0,0,.3)"}}>{t}</div>;
  return (<AbsoluteFill style={{background: "#f3ece4", perspective: 1800}}>
    <style>{fonts}</style>
    <div style={{position: "absolute", left: 0, top: 0, width: 540, height: H, overflow: "hidden"}}><Img src={staticFile("selfie.jpg")} style={{width: 540, height: H, objectFit: "cover", objectPosition: "50% 30%"}} /></div>
    <div style={{position: "absolute", left: 540, top: 0, width: 540, height: H, overflow: "hidden", transformOrigin: "0% 50%", transform: `rotateY(${-flip}deg)`}}>
      <Img src={staticFile("bk_02.jpg")} style={{width: 540, height: H, objectFit: "cover", objectPosition: "50% 30%"}} />
      <div style={{position: "absolute", top: 0, left: shine, width: 160, height: H, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)", rotate: "12deg"}} />
    </div>
    <div style={{position: "absolute", left: 534, top: H / 2 - (H / 2) * line, width: 12, height: H * line, background: `linear-gradient(${GOLD},#fff6d8,${GOLD})`, boxShadow: "0 0 25px rgba(255,230,160,.9)"}} />
    {pill("Handyfoto", 90, interpolate(f, [10, 22], [0, 1], C))}
    {pill("KI-Bild", 640, interpolate(f, [46, 58], [0, 1], C))}
    <StoryText lines={["Und das hat *KI* daraus", "gemacht – mit einem", "einzigen Text."]} at={60} />
    <Badge />
  </AbsoluteFill>);
};

// 3 — 3D phone with the Baukasten screen recording next to her
export const StoryB3: React.FC = () => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 24], [1400, 0], {...C, easing: out});
  const ry = interpolate(f, [0, 210], [-28, 14], {easing: io});
  const fl = Math.sin(f / 12) * 12;
  const tap = interpolate(f, [100, 120], [0, 1], C);
  return (<AbsoluteFill style={{background: "#111", perspective: 1600}}>
    <style>{fonts}</style>
    <Img src={staticFile("u07.jpg")} style={{...full, scale: String(interpolate(f, [0, 210], [1.02, 1.06]))}} />
    <div style={{position: "absolute", left: 640, top: 640, width: 360, height: 730, borderRadius: 56, background: "#111", padding: 14, boxShadow: "0 50px 80px rgba(0,0,0,.45)",
      transform: `translateY(${enter + fl}px) rotateY(${ry}deg) rotateX(6deg)`}}>
      <div style={{position: "relative", width: 332, height: 702, borderRadius: 44, overflow: "hidden", background: "white"}}>
        <OffthreadVideo src={staticFile("rec.mp4")} startFrom={120} style={{width: "100%", height: "100%", objectFit: "cover"}} muted />
        <div style={{position: "absolute", left: 116, top: 12, width: 100, height: 28, borderRadius: 14, background: "#111"}} />
        <div style={{position: "absolute", inset: 0, background: `linear-gradient(${110 + ry}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.25) 45%, rgba(255,255,255,0) 60%)`}} />
        {tap > 0 && tap < 1 && <div style={{position: "absolute", left: 166 - 30 - 60 * tap, top: 500 - 30 - 60 * tap, width: 60 + 120 * tap, height: 60 + 120 * tap, borderRadius: "50%", border: `${6 * (1 - tap)}px solid ${GOLD}`}} />}
      </div>
    </div>
    <div style={{position: "absolute", left: 800, top: 1150, fontSize: 90, opacity: interpolate(f, [88, 96], [0, 1], C), translate: `0px ${interpolate(f, [88, 98, 106], [50, 0, 8], C)}px`}}>👆</div>
    <StoryText lines={["Du *wählst* nur aus", "– und kopierst den", "fertigen Text."]} at={36} />
    <Badge />
  </AbsoluteFill>);
};

// 4 — call to action: comment FOTO, space left for the link sticker
export const StoryB4: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [20, 36], [0, 1], {...C, easing: pop});
  return (<AbsoluteFill style={{background: "#111"}}>
    <style>{fonts}</style>
    <Img src={staticFile("u14.jpg")} style={{...full, scale: String(interpolate(f, [0, 210], [1.02, 1.07]))}} />
    <div style={{position: "absolute", left: 85, top: 1150, padding: "18px 28px", borderRadius: 28, background: "white", boxShadow: "0 18px 40px rgba(0,0,0,.35)", display: "flex", alignItems: "center", gap: 18,
      scale: String(s), transformOrigin: "0% 50%"}}>
      <Img src={staticFile("selfie.jpg")} style={{width: 64, height: 64, borderRadius: 32, objectFit: "cover"}} />
      <div style={{fontFamily: "Poppins, sans-serif", lineHeight: 1.15}}><div style={{fontSize: 24, color: "#888"}}>Kommentar</div><div style={{fontSize: 46, fontWeight: 800, color: INK}}>FOTO 🤍</div></div>
    </div>
    <div style={{position: "absolute", left: 470, top: 1140, fontSize: 90, opacity: interpolate(f, [36, 44], [0, 1], C), translate: `0px ${Math.sin(f / 5) * 12}px`}}>👈</div>
    <StoryText lines={["Kommentiere *FOTO*", "unter meinem neuen Reel", "– der Baukasten", "ist *gratis*."]} at={46} top={1360} />
    <Badge />
  </AbsoluteFill>);
};
