import React from "react";
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Ring3D} from "./Ring3D";
import W0 from "./reel2-words.json";

// Küchen-Reel v2: Sie redet ungestört, Effekte kommen als Einschübe dazwischen.
// Falsch gesprochene Wörter ersetzt ihre ElevenLabs-Stimme (tts4.wav), immer unter einem Einschub.
const W = 1080, H = 1920, FPS = 24, GOLD = "#e8c27a", RED = "#8e1b2c", INK = "#1e1814";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H};
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}`;
const shadow = "0 4px 0 rgba(0,0,0,.35), 0 0 22px rgba(0,0,0,.55)";
type Word = [string, number, number];
const SRC = (W0 as {src: Word[]; tts: Word[]}).src, TTS = (W0 as {src: Word[]; tts: Word[]}).tts;
const f = (s: number) => Math.round(s * FPS);

// Schnittliste: talk = Originalstück, sonst Einschub. tts = Ausschnitt aus tts4.wav
type Seg = {kind: string; dur: number; src?: number; tts?: [number, number]};
const SEGS: Seg[] = [
  {kind: "hook", src: 0, dur: 3.2},
  {kind: "talk", src: 3.2, dur: 5.55},
  {kind: "timer", dur: 1.15, tts: [2.42, 3.57]},
  {kind: "talk", src: 9.71, dur: 3.6},
  {kind: "chat", dur: 3.2},
  {kind: "talk", src: 13.63, dur: 3.0},
  {kind: "ring", dur: 2.6},
  {kind: "talk", src: 16.71, dur: 2.25},
  {kind: "handy", dur: 2.6},
  {kind: "untertitel", dur: 1.75, tts: [3.68, 5.43]},
  {kind: "sticker", dur: 2.0, tts: [5.4, 7.4]},
  {kind: "talk", src: 24.29, dur: 3.1},
  {kind: "kommentar", dur: 1.95, tts: [7.38, 9.33]},
  {kind: "talk", src: 28.85, dur: 1.15},
];
let acc = 0;
const TL = SEGS.map((s) => { const r = {...s, at: acc}; acc += s.dur; return r; });
export const TOTAL = f(acc);

// Untertitel: Wörter auf die Ausgabezeit umrechnen
const CAPS: Word[] = [];
for (const s of TL) {
  if (s.kind === "talk" || s.kind === "hook") for (const [w, a, b] of SRC) {
    if (a >= s.src! && a < s.src! + s.dur) CAPS.push([w, a - s.src! + s.at, b - s.src! + s.at]);
  }
  if (s.tts) for (const [w, a, b] of TTS) if (a >= s.tts[0] - 0.05 && a < s.tts[1]) CAPS.push([w, a - s.tts[0] + s.at, b - s.tts[0] + s.at]);
}
const SENT: Word[][] = [];
for (const w of CAPS) {
  const last = SENT[SENT.length - 1];
  if (!last || /[.?]$/.test(last[last.length - 1][0]) || w[1] - last[last.length - 1][2] > 0.6) SENT.push([w]); else last.push(w);
}

const Video: React.FC<{from: number; style?: React.CSSProperties; muted?: boolean}> = ({from, style, muted}) =>
  <OffthreadVideo src={staticFile("in.mp4")} startFrom={f(from)} style={{...full, ...style}} muted={muted} />;
const Cut: React.FC<{from: number; style?: React.CSSProperties}> = ({from, style}) => {
  const n = useCurrentFrame() + f(from) + 1;
  return <Img src={staticFile(`cut/c${String(n).padStart(4, "0")}.png`)} style={{...full, ...style}} />;
};
const Headline: React.FC<{text: string; top?: number}> = ({text, top = 250}) => {
  const fr = useCurrentFrame();
  const s = interpolate(fr, [0, 8], [0.8, 1], {...C, easing: pop});
  return <div style={{position: "absolute", left: 90, right: 90, top, textAlign: "center", scale: String(s), opacity: interpolate(fr, [0, 5], [0, 1], C),
    fontFamily: "Pop", fontWeight: 900, fontSize: 58, lineHeight: 1.12, color: "white", textTransform: "uppercase", textShadow: shadow}}>{text}</div>;
};
const Blurred: React.FC<{from: number}> = ({from}) => <Video from={from} muted style={{filter: "blur(30px) brightness(1.05)", scale: "1.15"}} />;

// Einschübe
const Hook = () => {
  const t = useCurrentFrame() / FPS;
  const o = interpolate(t, [0.1, 0.6], [0, 1], C), sc = interpolate(t, [0.1, 0.9], [0.6, 1], {...C, easing: out});
  return <><Video from={0} />
    <Ring3D t={t} cx={560} cy={760} r={300} front={false} opacity={o} scale={sc} tilt={-18} />
    <Cut from={0} />
    <Ring3D t={t} cx={560} cy={760} r={300} front opacity={o} scale={sc} tilt={-18} />
    <Headline text="Ich benutze kein CapCut mehr …" top={1250} /></>;
};
const Timer = () => {
  const fr = useCurrentFrame();
  const n = Math.round(interpolate(fr, [2, 16], [0, 20], {...C, easing: out}));
  return <><Blurred from={8.7} />
    <div style={{position: "absolute", left: 140, right: 140, top: 640, padding: "50px 40px", borderRadius: 48, background: "#fbf7f0", textAlign: "center",
      boxShadow: "0 30px 70px rgba(0,0,0,.3)", scale: String(interpolate(fr, [0, 7], [0.7, 1], {...C, easing: pop}))}}>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 36, color: "#8a7f74"}}>früher, pro Effekt</div>
      <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 200, lineHeight: 1.05, color: RED}}>{n}<span style={{fontSize: 90}}> min</span></div>
    </div></>;
};
const CHAT_ME = "Mach mir einen Text-Ring um mich, lass mich aus dem Handy steigen – und Untertitel.";
const Chat = () => {
  const fr = useCurrentFrame();
  const chars = Math.floor(interpolate(fr, [6, 50], [0, CHAT_ME.length], C));
  const reply = fr > 60;
  return <><Blurred from={13} />
    <Headline text="Ich sage nur, welche Effekte ich will …" top={230} />
    <div style={{position: "absolute", left: 150, width: 780, top: 520, height: 900, borderRadius: 44, background: "#fbf7f0", boxShadow: "0 30px 70px rgba(0,0,0,.3)",
      scale: String(interpolate(fr, [0, 7], [0.85, 1], {...C, easing: out})), opacity: interpolate(fr, [0, 4], [0, 1], C)}}>
      <div style={{display: "flex", justifyContent: "space-between", padding: "34px 44px", fontFamily: "Pop", fontWeight: 600, fontSize: 34, color: INK}}>
        Claude <span style={{width: 18, height: 18, borderRadius: 9, background: "#d97757", marginTop: 10}} /></div>
      <div style={{position: "absolute", right: 40, top: 120, maxWidth: 560, padding: "26px 32px", borderRadius: "30px 30px 8px 30px", background: RED, color: "white",
        fontFamily: "Pop", fontWeight: 600, fontSize: 38, lineHeight: 1.3}}>{CHAT_ME.slice(0, Math.max(1, chars))}</div>
      {reply && <div style={{position: "absolute", left: 40, top: 470, padding: "22px 30px", borderRadius: "30px 30px 30px 8px", background: "#ece6dd", color: INK,
        fontFamily: "Pop", fontWeight: 600, fontSize: 40, scale: String(interpolate(fr, [60, 67], [0.5, 1], {...C, easing: pop})), transformOrigin: "0 100%"}}>Mach ich. ✨</div>}
    </div></>;
};
const Ring = () => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const z = String(interpolate(fr, [0, 62], [1.0, 1.07], C));
  const o = interpolate(t, [0, 0.4], [0, 1], C), sc = interpolate(t, [0, 0.8], [0.6, 1], {...C, easing: out});
  return <><Img src={staticFile("stadt.jpg")} style={{...full, scale: z}} />
    <div style={{...full, scale: z}}><Ring3D t={t + 1} cx={515} cy={660} r={320} front={false} opacity={o} scale={sc} tilt={-18} /></div>
    <Img src={staticFile("stadt_cut.png")} style={{...full, scale: z}} />
    <div style={{...full, scale: z}}><Ring3D t={t + 1} cx={515} cy={660} r={320} front opacity={o} scale={sc} tilt={-18} /></div>
    <Label text="1 · Text-Ring" /></>;
};
const PX = 190, PY = 470, PW = 700, PH = 1244, R = 80;
const Handy = () => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const inn = interpolate(t, [0, 0.35], [0.85, 1], {...C, easing: out});
  const step = interpolate(t, [0.55, 1.7], [0, 1], {...C, easing: out});
  // Im Handy: ihr Stadtfoto. Beim Heraustreten wird der Bildschirm unscharf, der Ausschnitt wächst nach vorne raus.
  const s = PW / W, photo: React.CSSProperties = {position: "absolute", left: 0, top: (PH - H * s) / 2, width: W * s, height: H * s};
  return <AbsoluteFill style={{background: "#efe9e1"}}>
    <Img src={staticFile("stadt.jpg")} style={{...full, filter: "blur(30px)", scale: "1.15"}} />
    <div style={{...full, transform: `scale(${inn})`, transformOrigin: "540px 1100px"}}>
      <div style={{position: "absolute", left: PX - 22, top: PY - 22, width: PW + 44, height: PH + 44, borderRadius: R + 22, background: "#111", boxShadow: "0 40px 90px rgba(0,0,0,.4)"}} />
      <div style={{position: "absolute", left: PX, top: PY, width: PW, height: PH, borderRadius: R, overflow: "hidden", background: "#000"}}>
        <Img src={staticFile("stadt.jpg")} style={{...photo, filter: `blur(${step * 18}px) brightness(${1 - step * 0.25})`}} />
      </div>
      <div style={{position: "absolute", left: 540 - 70, top: PY + 20, width: 140, height: 38, borderRadius: 19, background: "#111"}} />
      <Img src={staticFile("stadt_cut.png")} style={{...photo, left: PX, top: PY + (PH - H * s) / 2, transformOrigin: "50% 92%",
        transform: `scale(${1 + step * 0.32}) translateY(${step * 40}px)`, filter: `drop-shadow(0 ${24 * step}px ${36 * step}px rgba(0,0,0,.45))`}} />
    </div>
    <Label text="2 · Aus dem Handy" /></AbsoluteFill>;
};
const Untertitel = () => {
  const fr = useCurrentFrame();
  return <><Blurred from={19.2} />
    <div style={{position: "absolute", left: 100, right: 100, top: 760, textAlign: "center", fontFamily: "Pop", fontWeight: 900, fontSize: 104, lineHeight: 1.05,
      color: "white", textTransform: "uppercase", textShadow: shadow}}>
      {["Untertitel", "in meiner", "Schrift."].map((l, i) => <div key={i} style={{opacity: interpolate(fr, [i * 8, i * 8 + 4], [0, 1], C),
        translate: `0 ${interpolate(fr, [i * 8, i * 8 + 8], [40, 0], {...C, easing: out})}px`, color: i === 2 ? GOLD : "white"}}>{l}</div>)}
    </div>
    <Label text="3 · Untertitel" /></>;
};
const Sticker = () => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const k = interpolate(t, [0.3, 0.9], [0, 1], {...C, easing: out});
  const edge = [0, 60, 120, 180, 240, 300].map((d) => `drop-shadow(${(Math.cos(d * Math.PI / 180) * 8 * k).toFixed(1)}px ${(Math.sin(d * Math.PI / 180) * 8 * k).toFixed(1)}px 0 white)`).join(" ");
  const sx = interpolate(t, [0.2, 1.2], [-150, W + 50], C);
  return <><Img src={staticFile("stadt.jpg")} style={{...full, filter: `blur(${k * 26}px) brightness(${1 + k * 0.1})`}} />
    <Img src={staticFile("stadt_cut.png")} style={{...full, scale: String(1 + k * 0.04), rotate: `${-2 * k}deg`, filter: `${edge} drop-shadow(0 22px 34px rgba(0,0,0,${0.4 * k}))`}} />
    <div style={{position: "absolute", left: sx, top: 560, fontSize: 120, rotate: "90deg", opacity: t < 1.2 ? 1 : 0}}>✂️</div>
    <Label text="4 · Freigestellt" /></>;
};
const WORD = "CLAUDE";
const Kommentar = () => {
  const fr = useCurrentFrame();
  const n = Math.floor(interpolate(fr, [10, 26], [0, WORD.length], C));
  return <><Blurred from={26} />
    <div style={{position: "absolute", left: 100, right: 100, top: 760, padding: "34px 40px", borderRadius: 40, background: "#fbf7f0", boxShadow: "0 30px 70px rgba(0,0,0,.3)",
      scale: String(interpolate(fr, [0, 7], [0.8, 1], {...C, easing: pop}))}}>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 30, color: "#8a7f74", marginBottom: 18}}>Kommentar hinzufügen …</div>
      <div style={{display: "flex", alignItems: "center", gap: 24}}>
        <div style={{width: 90, height: 90, borderRadius: 45, background: `linear-gradient(135deg, ${GOLD}, ${RED})`}} />
        <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 84, color: INK, letterSpacing: 3}}>{WORD.slice(0, n)}<span style={{opacity: fr % 12 < 6 ? 1 : 0, fontWeight: 600}}>|</span></div>
      </div>
    </div></>;
};
const Label: React.FC<{text: string}> = ({text}) => (
  <div style={{position: "absolute", left: 0, width: W, top: 150, textAlign: "center"}}>
    <span style={{padding: "10px 26px", borderRadius: 40, background: "white", color: INK, fontFamily: "Pop", fontWeight: 600, fontSize: 32, boxShadow: "0 10px 24px rgba(0,0,0,.25)"}}>{text}</span>
  </div>
);
const INSERT: Record<string, React.FC> = {hook: Hook, timer: Timer, chat: Chat, ring: Ring, handy: Handy, untertitel: Untertitel, sticker: Sticker, kommentar: Kommentar};

const Captions = () => {
  const t = useCurrentFrame() / FPS;
  const seg = TL.find((s) => t >= s.at && t < s.at + s.dur);
  if (!seg || seg.kind === "untertitel" || seg.kind === "hook") return null;
  const s = SENT.find((ws) => t >= ws[0][1] - 0.05 && t < ws[ws.length - 1][2] + 0.35);
  if (!s) return null;
  return <div style={{position: "absolute", left: 90, right: 90, top: 1360, textAlign: "center", lineHeight: 1.12}}>
    {s.map(([w, a], k) => {
      const on = t >= a, cur = on && (k === s.length - 1 || t < s[k + 1][1]);
      return <span key={k} style={{display: "inline-block", margin: "0 12px", opacity: on ? 1 : 0.0, scale: String(on ? interpolate(t, [a, a + 0.1], [0.7, 1], {...C, easing: pop}) : 0.7),
        fontFamily: "Pop", fontWeight: 900, fontSize: 64, textTransform: "uppercase", color: cur ? GOLD : "white", textShadow: shadow}}>{w}</span>;
    })}
  </div>;
};
const Badge = () => <div style={{position: "absolute", left: 40, top: 1850, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Pop", fontWeight: 600, fontSize: 24}}>KI-generiert</div>;

export const Reel2: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    {TL.map((s, i) => {
      const Ins = INSERT[s.kind];
      return <Sequence key={i} from={f(s.at)} durationInFrames={f(s.at + s.dur) - f(s.at)}>
        {s.kind === "talk" ? <Video from={s.src!} /> : <Ins />}
        {s.tts && <Audio src={staticFile("tts4.wav")} startFrom={f(s.tts[0])} volume={1.15} />}
      </Sequence>;
    })}
    <Captions />
    <Badge />
  </AbsoluteFill>
);
