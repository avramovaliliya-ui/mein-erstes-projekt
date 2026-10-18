import React from "react";
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

// Muster „Gesicht oben, Handy unten scrollt“: oben kleine Karte mit ihr (redet weiter),
// darunter Schritt-Wort, darunter Handy mit Claude-Chat, der mitscrollt, am Ende das Ergebnis.
const W = 1080, H = 1920, FPS = 30, RED = "#c3172e", INK = "#1e1814", CREAM = "#f4efe7";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const f = (s: number) => Math.round(s * FPS);
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff2")}') format('woff2');font-weight:700;font-style:italic}`;

// ihre Sätze aus dem Küchen-Video: [von, bis, Bildverschiebung für das Gesicht]
const TALK: [number, number, number][] = [[3.15, 5.2, 330], [11.45, 13.3, 120], [14.15, 16.6, 330]];
let acc = 0;
const TL = TALK.map(([a, b, sh]) => { const r = {a, b, sh, at: acc}; acc += b - a; return r; });
const END = 2.4; // Ergebnis gross
export const SCROLL_TOTAL = f(acc + END);

const CW = 560, CH = 300, CX = (W - CW) / 2, CY = 270;
const Karte = () => (
  <div style={{position: "absolute", left: CX, top: CY, width: CW, height: CH, borderRadius: 34, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,.25)", background: "#000"}}>
    {TL.map((t, i) => (
      <Sequence key={i} from={f(t.at)} durationInFrames={f(t.at + t.b - t.a) - f(t.at)}>
        <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(t.a)} style={{position: "absolute", left: 0, top: -t.sh * (CW / W), width: CW, height: CW * 16 / 9}} />
      </Sequence>
    ))}
  </div>
);

const STEPS = ["1 · hochladen", "2 · ein Satz", "3 · fertig"];
const Schritt = () => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const i = TL.findIndex((s) => t >= s.at && t < s.at + s.b - s.a);
  if (i < 0) return null;
  const local = fr - f(TL[i].at);
  return <div style={{position: "absolute", left: 0, width: W, top: CY + CH + 26, textAlign: "center", fontFamily: "Pop", fontWeight: 600, fontSize: 40, color: INK,
    opacity: interpolate(local, [0, 5], [0, 1], C), translate: `0 ${interpolate(local, [0, 8], [16, 0], {...C, easing: out})}px`}}>{STEPS[i]}</div>;
};

// Chat im Handy, Nachrichten erscheinen nacheinander und der Verlauf scrollt nach oben
const SATZ = "Mach einen 3D-Ring aus Text um mich – und Untertitel drunter.";
const PX = 250, PY = 700, PW = 580, PH = 1040;
const Handy = () => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const t2 = TL[1].at, t3 = TL[2].at;
  const typed = Math.floor(interpolate(t, [t2 + 0.1, t2 + 1.5], [0, SATZ.length], C));
  const scroll = interpolate(t, [t2, t2 + 0.4, t3, t3 + 0.5], [0, -60, -60, -330], {...C, easing: out});
  const bubble = (on: number) => ({opacity: interpolate(t, [on, on + 0.15], [0, 1], C), scale: String(interpolate(t, [on, on + 0.25], [0.6, 1], {...C, easing: pop}))});
  return <div style={{position: "absolute", left: PX - 16, top: PY - 16, width: PW + 32, height: PH + 32, borderRadius: 82, background: "#111", boxShadow: "0 30px 70px rgba(0,0,0,.3)"}}>
    <div style={{position: "absolute", left: 16, top: 16, width: PW, height: PH, borderRadius: 68, overflow: "hidden", background: "#faf8f4"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: PW, height: 120, background: "#faf8f4", zIndex: 2, display: "flex", alignItems: "flex-end", padding: "0 34px 18px",
        fontFamily: "Pop", fontWeight: 600, fontSize: 30, color: INK, gap: 12, borderBottom: "1px solid #eee"}}>
        <span style={{width: 18, height: 18, borderRadius: 9, background: "#d97757", marginBottom: 8}} /> Claude</div>
      <div style={{position: "absolute", left: 0, top: 150 + scroll, width: PW}}>
        <div style={{...bubble(0.2), marginLeft: "auto", marginRight: 28, width: 330, transformOrigin: "100% 0", display: "flex", gap: 10, justifyContent: "flex-end"}}>
          {[0, 1].map((k) => <div key={k} style={{width: 150, height: 230, borderRadius: 20, overflow: "hidden", background: "#000", position: "relative"}}>
            <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(6 + k * 8)} muted style={{width: 150, height: 267}} />
            <div style={{position: "absolute", left: 8, bottom: 8, fontSize: 22, color: "white", fontFamily: "Pop", fontWeight: 600}}>▶ 0:10</div>
          </div>)}
        </div>
        {t > t2 && <div style={{marginLeft: "auto", marginRight: 28, marginTop: 22, maxWidth: 420, padding: "22px 26px", borderRadius: "28px 28px 8px 28px", background: RED, color: "white",
          fontFamily: "Pop", fontWeight: 600, fontSize: 30, lineHeight: 1.3}}>{SATZ.slice(0, Math.max(1, typed))}{typed < SATZ.length ? "|" : ""}</div>}
        {t > t3 && <div style={{...bubble(t3 + 0.1), marginLeft: 28, marginTop: 26, width: 400, transformOrigin: "0 0"}}>
          <div style={{padding: "18px 24px", borderRadius: "28px 28px 28px 8px", background: "#ece6dd", color: INK, fontFamily: "Pop", fontWeight: 600, fontSize: 30, display: "inline-block", whiteSpace: "nowrap"}}>Mach ich. ✨</div>
          <div style={{marginTop: 14, width: 270, height: 480, borderRadius: 24, overflow: "hidden", background: "#000", boxShadow: "0 10px 24px rgba(0,0,0,.2)"}}>
            <Sequence from={f(t3 + 0.3)}><OffthreadVideo src={staticFile("reel2.mp4")} startFrom={f(19.8)} muted style={{width: 270, height: 480}} /></Sequence>
          </div>
        </div>}
      </div>
    </div>
  </div>;
};

const Ende = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill>
    <OffthreadVideo src={staticFile("reel2.mp4")} startFrom={f(20.3)} muted style={{width: W, height: H, scale: String(interpolate(fr, [0, 10], [0.55, 1], {...C, easing: out})), borderRadius: interpolate(fr, [0, 10], [60, 0], C)}} />
  </AbsoluteFill>;
};

export const Scroll: React.FC = () => (
  <AbsoluteFill style={{background: CREAM}}>
    <style>{fontFace}</style>
    <Sequence durationInFrames={f(acc)}>
      <Karte /><Schritt /><Handy />
    </Sequence>
    <Sequence durationInFrames={f(acc)}>
      <div style={{position: "absolute", left: 40, top: 1856, fontFamily: "Pop", fontWeight: 600, fontSize: 22, letterSpacing: 2, color: INK, opacity: 0.8}}>KI-GENERIERT</div>
    </Sequence>
    <Sequence from={f(acc)}><Ende /></Sequence>
  </AbsoluteFill>
);
