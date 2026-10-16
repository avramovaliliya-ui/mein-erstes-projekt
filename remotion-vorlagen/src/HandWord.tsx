import React from "react";
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, random, staticFile, useCurrentFrame} from "remotion";
import TR from "./handtrack.json";

const W = 1080, H = 1920, C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1), pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const T = TR as number[][];

// hand midpoint at a given composition frame (video is 24 fps, comp 30 fps)
const at = (f: number) => {
  const p = (f / 30) * 24, i = Math.min(T.length - 1, Math.floor(p)), j = Math.min(T.length - 1, i + 1), u = p - Math.floor(p);
  return [T[i][0] + (T[j][0] - T[i][0]) * u, T[i][1] + (T[j][1] - T[i][1]) * u];
};

export const HandWord: React.FC<{word?: string}> = ({word = "MUT"}) => {
  const f = useCurrentFrame();
  const [hx, hy] = at(Math.max(f, 45)); // before 1.5 s the hands are not both up yet
  const wx = hx, wy = hy - 120; // word floats just above the palms
  const appear = interpolate(f, [52, 66], [0, 1], {...C, easing: pop});
  const glow = 0.6 + 0.4 * Math.sin(f / 5);
  return (
    <AbsoluteFill style={{background: "#111"}}>
      <OffthreadVideo src={staticFile("hands.mp4")} style={{position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"}} muted />
      <svg width={W} height={H} style={{position: "absolute"}}>
        <defs><filter id="g"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <g filter="url(#g)">
          {new Array(46).fill(0).map((_, k) => {
            const sx = 140 + random("x" + k) * 800, sy = 1250 + random("y" + k) * 550;
            const tx = wx + (random("t" + k) - 0.5) * 300, ty = wy + (random("u" + k) - 0.5) * 90;
            const a = interpolate(f, [10 + random("d" + k) * 16, 58], [0, 1], {...C, easing: out});
            const x = sx + (tx - sx) * a + Math.sin(f / 6 + k) * 12 * (1 - a), y = sy + (ty - sy) * a + Math.cos(f / 7 + k) * 12 * (1 - a);
            const o = interpolate(f, [0, 10, 60, 72], [0, 1, 1, 0.25], C) * (0.5 + 0.5 * Math.sin(f / 2 + k));
            return <path key={k} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#fff3c4" opacity={o} transform={`translate(${x} ${y}) scale(${0.7 + random("s" + k) * 0.8})`} />;
          })}
        </g>
      </svg>
      <div style={{position: "absolute", left: wx - 300, top: wy - 90, width: 600, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 150, lineHeight: "180px",
        backgroundImage: "linear-gradient(170deg,#fff8de 0%,#f3cf7a 40%,#b8862c 70%,#ffe7a0 100%)", WebkitBackgroundClip: "text", color: "transparent",
        filter: `drop-shadow(0 0 ${14 * glow}px rgba(255,214,120,.9)) drop-shadow(0 6px 10px rgba(80,50,10,.45))`,
        scale: String(appear), opacity: Math.min(1, appear * 1.5), translate: `0px ${interpolate(f, [52, 66], [40, 0], C)}px`}}>{word}</div>
      <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
    </AbsoluteFill>
  );
};
