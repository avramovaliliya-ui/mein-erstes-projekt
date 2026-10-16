import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from "remotion";
import P from "./swarmpts.json";

const W = 1080, H = 1920, C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
const SEG = 105;
type Mode = "petals" | "leaves" | "butter" | "hearts" | "spark" | "photos";

const Label: React.FC<{n: string}> = ({n}) => <div style={{position: "absolute", left: 90, top: 260, padding: "10px 24px", borderRadius: 40, background: "white", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 34, color: "#1e1814", boxShadow: "0 10px 24px rgba(0,0,0,.3)"}}>{n}</div>;

// where each particle comes from / goes to
const startOf = (m: Mode, k: number): [number, number] => {
  const r1 = random(m + "a" + k), r2 = random(m + "b" + k);
  if (m === "petals") return [r1 * W, -100 - r2 * 700];            // fall from above
  if (m === "leaves") return [-150 - r2 * 600, 600 + r1 * 900];     // blown in from left
  if (m === "hearts") return [r1 * W, H + 100 + r2 * 500];          // rise from below
  if (m === "butter") return [r1 > 0.5 ? W + 150 : -150, 300 + r2 * 1400];
  if (m === "photos") return [540 + (r1 - 0.5) * 300, 2100 + r2 * 300];
  return [540 + (r1 - 0.5) * 1400, 1320 + (r2 - 0.5) * 1600];        // sparks scattered
};
const endOf = (m: Mode, k: number, x: number, y: number): [number, number] => {
  const r = random(m + "e" + k);
  if (m === "petals" || m === "leaves") return [x + 500 + r * 500, y + 500 + r * 300];
  if (m === "hearts" || m === "butter") return [x + (r - 0.5) * 700, y - 1300 - r * 300];
  if (m === "photos") return [x, y];
  return [x + (r - 0.5) * 200, y + (random(m + "f" + k) - 0.5) * 200];
};

const Item: React.FC<{m: Mode; k: number; f: number; ang: number}> = ({m, k, f, ang}) => {
  const r = random(m + "s" + k);
  if (m === "petals") return <ellipse rx={16} ry={10} fill={r > 0.5 ? "#b3122e" : "#d42a45"} stroke="#6e0a1b" strokeWidth={1} transform={`rotate(${f * 6 + r * 360}) scale(1 ${0.6 + 0.4 * Math.sin(f / 5 + k)})`} />;
  if (m === "leaves") return <g transform={`rotate(${f * 5 + r * 360})`}><path d="M0 -13 C 9 -6 9 6 0 13 C -9 6 -9 -6 0 -13 Z" fill={["#d9661f", "#e8a23a", "#b8441a", "#f0c050"][k % 4]} /><line x1={0} y1={-12} x2={0} y2={14} stroke="#7a3510" strokeWidth={1.5} /></g>;
  if (m === "hearts") return <path d="M0 6 C -14 -4 -10 -16 0 -9 C 10 -16 14 -4 0 6 Z" transform="scale(1.15)" fill={r > 0.5 ? "#e8304f" : "#ff6b81"} stroke="#8a1028" strokeWidth={1} />;
  if (m === "butter") { const fl = 0.25 + 0.75 * Math.abs(Math.sin(f / 2.2 + k)); const col = ["#ffd27a", "#ffffff", "#f4a7b9"][k % 3];
    return <g transform={`rotate(${ang + 90})`}><g transform={`scale(${fl} 1)`}><ellipse cx={-11} cy={-5} rx={11} ry={8} fill={col} stroke="#3b2a1a" strokeWidth={1.2} /><ellipse cx={11} cy={-5} rx={11} ry={8} fill={col} stroke="#3b2a1a" strokeWidth={1.2} />
      <ellipse cx={-8} cy={8} rx={7} ry={6} fill={col} stroke="#3b2a1a" strokeWidth={1.2} /><ellipse cx={8} cy={8} rx={7} ry={6} fill={col} stroke="#3b2a1a" strokeWidth={1.2} /></g><rect x={-1.5} y={-10} width={3} height={22} rx={1.5} fill="#3b2a1a" /></g>; }
  if (m === "spark") { const tw = 0.5 + 0.5 * Math.sin(f / 2 + k * 1.7); return <g opacity={0.55 + 0.45 * tw}><circle r={9} fill="#ffe9a8" opacity={0.35} /><path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z" fill="#fff6d8" transform={`scale(${0.7 + 0.5 * tw})`} /></g>; }
  return <g><rect x={-13} y={-16} width={26} height={32} rx={3} fill="white" /><image href={staticFile(`bk_${String((k % 12) + 1).padStart(2, "0")}.jpg`)} x={-11} y={-14} width={22} height={28} preserveAspectRatio="xMidYMid slice" /></g>;
};

const Swarm: React.FC<{m: Mode; bg: string; label: string}> = ({m, bg, label}) => {
  const f = useCurrentFrame();
  const pts = (P as Record<string, number[][]>)[m];
  const pos = (k: number, fr: number): [number, number] => {
    const [tx, ty] = pts[k], [sx, sy] = startOf(m, k), [ex, ey] = endOf(m, k, tx, ty);
    const arrive = 34 + random(m + "d" + k) * 22;
    const a = interpolate(fr, [random(m + "g" + k) * 12, arrive], [0, 1], {...C, easing: out});
    const b = interpolate(fr, [80 + random(m + "h" + k) * 6, 104], [0, 1], {...C, easing: Easing.in(Easing.quad)});
    const sway = Math.sin(fr / 6 + k) * (m === "butter" ? 60 : 35) * (1 - a) + Math.sin(fr / 5 + k) * 2.5 * a;
    const x = sx + (tx - sx) * a + (ex - tx) * b + sway;
    const y = sy + (ty - sy) * a + (ey - ty) * b + Math.cos(fr / 7 + k) * 20 * (1 - a);
    return [x, y];
  };
  return (<AbsoluteFill>
    <Img src={staticFile(bg)} style={full} />
    <svg width={W} height={H} style={{position: "absolute"}}>
      <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.35" /></filter></defs>
      <g filter={m === "spark" ? "url(#glow)" : "url(#sh)"}>
        {pts.map((_, k) => { const [x, y] = pos(k, f), [x2, y2] = pos(k, f + 1);
          const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
          const sc = m === "photos" ? interpolate(f, [0, 50], [2.2, 1], {...C, easing: out}) : 1;
          return <g key={k} transform={`translate(${x} ${y}) scale(${sc})`}><Item m={m} k={k} f={f} ang={ang} /></g>; })}
      </g>
    </svg>
    <Label n={label} />
  </AbsoluteFill>);
};

const LIST: [Mode, string, string][] = [
  ["petals", "u12.jpg", "Rosenblätter"], ["leaves", "u09.jpg", "Herbstlaub"], ["butter", "u10.jpg", "Schmetterlinge"],
  ["hearts", "u17.jpg", "Herzen"], ["spark", "u04.jpg", "Goldfunken"], ["photos", "u07.jpg", "Deine Bilder"],
];
export const Schwarm: React.FC = () => (
  <AbsoluteFill style={{background: "#111"}}>
    {LIST.map(([m, bg, l], i) => <Sequence key={m} from={i * SEG} durationInFrames={SEG} premountFor={30}><Swarm m={m} bg={bg} label={l} /></Sequence>)}
    <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
  </AbsoluteFill>
);
