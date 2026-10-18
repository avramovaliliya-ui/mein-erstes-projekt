import React from "react";
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

// Podcast-Reel aus zwei 10-s-Clips: Stillstände rausgeschnitten, glattes Durchsprechen.
// Jeder Schnitt wechselt leicht zwischen weit (1.0) und nah (1.04), damit kein Sprung sichtbar ist.
// Karaoke-Untertitel nach ihrem Podcast-Stil (Serif weiss, kommend grau, max. 4 Wörter).
const W = 1080, H = 1920, FPS = 30;
const fontFace = `
@font-face{font-family:'PF';src:url('${staticFile("pf600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}`;
const f = (s: number) => Math.round(s * FPS);
const WERBUNG = true; // Post führt zu einem bezahlten Kurs (Affiliate)

// [Datei, von, bis, Zoom]
type Seg = {src: string; a: number; b: number; zoom: number};
const SEGS: Seg[] = [
  {src: "p1.mp4", a: 1.0, b: 2.5, zoom: 1},
  {src: "p1.mp4", a: 3.42, b: 4.73, zoom: 1.04},
  {src: "p1.mp4", a: 5.42, b: 7.2, zoom: 1},
  {src: "p2.mp4", a: 0.92, b: 4.78, zoom: 1.04},
  {src: "p2.mp4", a: 5.08, b: 7.55, zoom: 1},
];
let acc = 0;
const TL = SEGS.map((s) => { const r = {...s, at: acc}; acc += s.b - s.a; return r; });
export const TOTAL = f(acc);

// Wörter: [Text, Datei, Start, Ende] in Quellzeit
type Word = [string, string, number, number];
const WORDS: Word[] = [
  ["Und", "p1.mp4", 1.05, 1.2], ["manchmal", "p1.mp4", 1.2, 1.48], ["frage", "p1.mp4", 1.48, 1.92], ["ich", "p1.mp4", 1.92, 2.06], ["mich,", "p1.mp4", 2.06, 2.45],
  ["was", "p1.mp4", 3.4, 3.66], ["ist", "p1.mp4", 3.66, 3.86], ["grausamer:", "p1.mp4", 3.86, 4.6],
  ["jemandem", "p1.mp4", 5.46, 5.86], ["das", "p1.mp4", 5.86, 6.02], ["Herz", "p1.mp4", 6.02, 6.26], ["zu", "p1.mp4", 6.26, 6.56], ["brechen?", "p1.mp4", 6.56, 7.05],
  ["Oder", "p2.mp4", 0.95, 1.16], ["einem", "p2.mp4", 1.16, 1.38], ["Menschen", "p2.mp4", 1.38, 1.76], ["erst", "p2.mp4", 1.76, 1.96], ["das", "p2.mp4", 1.96, 2.14],
  ["Gefühl", "p2.mp4", 2.14, 2.46], ["zu", "p2.mp4", 2.46, 2.7], ["geben,", "p2.mp4", 2.7, 3.3], ["endlich", "p2.mp4", 3.42, 3.72], ["sicher", "p2.mp4", 3.72, 4.06],
  ["zu", "p2.mp4", 4.06, 4.34], ["sein", "p2.mp4", 4.34, 4.62], ["und", "p2.mp4", 5.1, 5.24], ["ihm", "p2.mp4", 5.24, 5.38], ["dann", "p2.mp4", 5.38, 5.52],
  ["genau", "p2.mp4", 5.52, 5.84], ["dieses", "p2.mp4", 5.84, 6.06], ["Gefühl", "p2.mp4", 6.06, 6.5], ["wieder", "p2.mp4", 6.5, 6.8], ["zu", "p2.mp4", 6.8, 6.95], ["nehmen?", "p2.mp4", 6.95, 7.4],
];
// auf Ausgabezeit umrechnen
const OUT = WORDS.map(([w, src, a, b]) => {
  const s = TL.find((t) => t.src === src && a >= t.a - 0.08 && a < t.b)!;
  return {w, a: Math.max(s.at, a - s.a + s.at), b: Math.min(s.at + s.b - s.a, b - s.a + s.at)};
});
// Gruppen: erst nach Satzzeichen trennen, dann gleichmässig auf höchstens 4 Wörter / 22 Zeichen verteilen (keine einzelnen Restwörter)
const PHRASES: typeof OUT[] = [];
for (const w of OUT) {
  const p = PHRASES[PHRASES.length - 1];
  if (!p || /[,.:?]$/.test(p[p.length - 1].w)) PHRASES.push([w]); else p.push(w);
}
const GROUPS: typeof OUT[] = [];
for (const p of PHRASES) {
  const chars = p.map((x) => x.w).join(" ").length;
  const k = Math.max(Math.ceil(p.length / 4), Math.ceil(chars / 22));
  for (let i = 0; i < k; i++) GROUPS.push(p.slice(Math.round((i * p.length) / k), Math.round(((i + 1) * p.length) / k)));
}

const Captions: React.FC<{zoom: number}> = ({zoom}) => {
  const t = useCurrentFrame() / FPS;
  const gi = GROUPS.findIndex((g, i) => t >= g[0].a - 0.05 && t < (GROUPS[i + 1] ? GROUPS[i + 1][0].a - 0.05 : g[g.length - 1].b + 0.5));
  if (gi < 0) return null;
  // Text zieht leicht mit dem Zoom mit (Regel 20)
  return <div style={{position: "absolute", left: 90, width: 740, top: 1110 + (zoom - 1) * 300, textAlign: "center", lineHeight: 1.18}}>
    {GROUPS[gi].map((w, k) => (
      <span key={k} style={{display: "inline-block", margin: "0 10px", fontFamily: "PF", fontWeight: 600, fontSize: 78,
        color: t >= w.a ? "#ffffff" : "#a8a29c", textShadow: "0 3px 14px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6)"}}>{w.w}</span>
    ))}
  </div>;
};

const Badge = () => <div style={{position: "absolute", left: 40, top: 1856, fontFamily: "Pop", fontWeight: 600, fontSize: 22, letterSpacing: 2,
  color: "white", textShadow: "0 1px 4px rgba(0,0,0,.7)"}}>{WERBUNG ? "KI-GENERIERT | WERBUNG" : "KI-GENERIERT"}</div>;

export const Podcast: React.FC = () => {
  const fr = useCurrentFrame();
  const cur = TL.find((s) => fr >= f(s.at) && fr < f(s.at + s.b - s.a)) ?? TL[TL.length - 1];
  return <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    {TL.map((s, i) => (
      <Sequence key={i} from={f(s.at)} durationInFrames={f(s.at + s.b - s.a) - f(s.at)}>
        <OffthreadVideo src={staticFile(s.src)} startFrom={f(s.a)} volume={(v) => Math.min(1, (v + 1) / 3, (f(s.b - s.a) - v) / 3)} style={{position: "absolute", width: W, height: H, scale: String(s.zoom), transformOrigin: "520px 620px"}} />
      </Sequence>
    ))}
    <Captions zoom={cur.zoom} />
    <Badge />
  </AbsoluteFill>;
};
