import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from "remotion";
import TR from "./handtrack.json";
import AP from "./angstpts.json";

const W = 1080, H = 1920, C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1), pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const INK = "#1e1814";
const T = TR as number[][], P = AP as number[][];
const VID = 150; // 5 s video, then freeze on last frame
const at = (f: number) => {
  const ff = Math.min(f, VID - 1), p = (ff / 30) * 24, i = Math.min(T.length - 1, Math.floor(p)), j = Math.min(T.length - 1, i + 1), u = p - Math.floor(p);
  return [T[i][0] + (T[j][0] - T[i][0]) * u, T[i][1] + (T[j][1] - T[i][1]) * u];
};
const strokeBig = `-5px -5px 0 ${INK},5px -5px 0 ${INK},-5px 5px 0 ${INK},5px 5px 0 ${INK},0 5px 0 ${INK},0 -5px 0 ${INK},5px 0 0 ${INK},-5px 0 0 ${INK},0 8px 20px rgba(0,0,0,.45)`;
const strokeMid = `-3px -3px 0 ${INK},3px -3px 0 ${INK},-3px 3px 0 ${INK},3px 3px 0 ${INK},0 3px 0 ${INK},0 -3px 0 ${INK},0 6px 14px rgba(0,0,0,.4)`;

const Butterfly: React.FC<{f: number; k: number; ang: number}> = ({f, k, ang}) => {
  const fl = 0.25 + 0.75 * Math.abs(Math.sin(f / 2 + k)), col = ["#ffffff", "#ffe7a6", "#f6c6d2"][k % 3];
  return <g transform={`rotate(${ang + 90}) scale(2.2)`}><g transform={`scale(${fl} 1)`}>
    <ellipse cx={-11} cy={-5} rx={11} ry={8} fill={col} stroke="#3b2a1a" strokeWidth={1.2} /><ellipse cx={11} cy={-5} rx={11} ry={8} fill={col} stroke="#3b2a1a" strokeWidth={1.2} />
    <ellipse cx={-8} cy={8} rx={7} ry={6} fill={col} stroke="#3b2a1a" strokeWidth={1.2} /><ellipse cx={8} cy={8} rx={7} ry={6} fill={col} stroke="#3b2a1a" strokeWidth={1.2} /></g>
    <rect x={-1.5} y={-10} width={3} height={22} rx={1.5} fill="#3b2a1a" /></g>;
};

export const Loslassen: React.FC = () => {
  const f = useCurrentFrame();
  const [hx, hy] = at(Math.max(f, 45));
  const wx = hx, wy = hy - 115;
  // ANGST: appears 1.9 s, crumbles left→right from 3.6 s
  const show = interpolate(f, [57, 70], [0, 1], {...C, easing: pop});
  const crumbleStart = 108;
  // butterflies rise out of the dust
  const bfly = (k: number, fr: number): [number, number] => {
    const side = k % 2 === 0 ? -1 : 1, t0 = 128 + k * 4;
    const a = interpolate(fr, [t0, t0 + 75], [0, 1], {...C, easing: Easing.in(Easing.sin)});
    const sx = wx + (random("bx" + k) - 0.5) * 300, sy = wy + (random("by" + k) - 0.5) * 60;
    const ex = side < 0 ? 60 + random("ex" + k) * 140 : 880 + random("ex" + k) * 140, ey = -120 - random("ey" + k) * 200;
    // sideways first (stays clear of her face), then up
    const x = sx + (ex - sx) * Math.min(1, a * 1.8), y = sy + (ey - sy) * Math.max(0, (a - 0.25) / 0.75) + Math.sin(fr / 5 + k) * 18;
    return [x, y];
  };
  const hookO = interpolate(f, [0, 8, 150, 162], [0, 1, 1, 0], C);
  const msgO = interpolate(f, [175, 190], [0, 1], C);
  const line = (txt: string, big: boolean, y: number, o: number, dy = 0) => (
    <div style={{position: "absolute", left: 90, width: 740, top: y, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: big ? 900 : 700, fontSize: big ? 68 : 58,
      lineHeight: 1.12, color: "white", textShadow: big ? strokeBig : strokeMid, opacity: o, translate: `0px ${dy}px`}}>{txt}</div>);
  return (
    <AbsoluteFill style={{background: "#111"}}>
      <Sequence durationInFrames={VID}><OffthreadVideo src={staticFile("hands.mp4")} style={{position: "absolute", width: W, height: H, objectFit: "cover"}} muted /></Sequence>
      {f >= VID && <Img src={staticFile("hands_last.jpg")} style={{position: "absolute", width: W, height: H, objectFit: "cover", scale: String(1 + (f - VID) * 0.0006)}} />}

      {/* ANGST as particles: solid at first, then blown away as dust */}
      <svg width={W} height={H} style={{position: "absolute"}}>
        {P.map(([px, py], k) => {
          const delay = crumbleStart + ((px + 310) / 620) * 26 + random("d" + k) * 2;
          if (f < delay) return null;
          const d = interpolate(f, [delay, delay + 40], [0, 1], {...C, easing: Easing.in(Easing.quad)});
          if (d >= 1) return null;
          const x = wx + px + d * (160 + random("vx" + k) * 260), y = wy + py - d * (60 + random("vy" + k) * 260) + Math.sin(f / 4 + k) * 6 * d;
          return <rect key={k} x={x - 1.8} y={y - 1.8} width={3.6 - 1.6 * d} height={3.6 - 1.6 * d} fill={d < 0.3 ? "#2e2622" : "#8a7f76"} opacity={1 - d} />;
        })}
        {new Array(10).fill(0).map((_, k) => {
          if (f < 128 + k * 4) return null;
          const [x, y] = bfly(k, f), [x2, y2] = bfly(k, f + 1);
          const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
          const s = interpolate(f, [128 + k * 4, 140 + k * 4], [0, 1], {...C, easing: out});
          return <g key={k} transform={`translate(${x} ${y}) scale(${s})`}><Butterfly f={f} k={k} ang={ang} /></g>;
        })}
      </svg>

      {(() => { const cut = interpolate(f, [crumbleStart, crumbleStart + 26], [0, 100], C);
        return <Img src={staticFile("angst.png")} style={{position: "absolute", left: wx - 310, top: wy - 110, width: 620, height: 220, opacity: show,
          scale: String(0.85 + 0.15 * show), clipPath: `inset(0 0 0 ${cut}%)`}} />; })()}
      {/* hook (bottom free area, never over her face) */}
      {line("WAS HÄLTST DU", true, 1290, hookO)}
      {line("IMMER NOCH FEST…", true, 1366, hookO)}
      {/* message */}
      {line("Manches darfst du", false, 1300, msgO, interpolate(f, [175, 190], [20, 0], {...C, easing: out}))}
      {line("einfach loslassen. 🦋", false, 1368, msgO, interpolate(f, [175, 190], [20, 0], {...C, easing: out}))}

      <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
    </AbsoluteFill>
  );
};
