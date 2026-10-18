import React from "react";
import {interpolate} from "remotion";

// Echter 3D-Zylinder aus Text: drei Reihen, Buchstaben stehen auf einem Zylinder um die Person.
// Vorne/hinten getrennt, damit der Ausschnitt der Person dazwischen liegen kann.
const cw = (c: string) => (c === " " ? 0.32 : c === "·" ? 0.42 : c === "I" ? 0.34 : "MW".includes(c) ? 0.95 : 0.7);
export type Row = {text: string; size: number; y: number; dir: 1 | -1};
export const DEFAULT_ROWS: Row[] = [
  {text: "EIN SATZ · ", size: 42, y: -78, dir: 1},
  {text: "OHNE CAPCUT · NUR CLAUDE · ", size: 74, y: 0, dir: -1},
  {text: "EIN SATZ · ", size: 42, y: 82, dir: 1},
];

export const Ring3D: React.FC<{t: number; cx: number; cy: number; r: number; front: boolean; rows?: Row[]; scale?: number; opacity?: number; tilt?: number}> =
({t, cx, cy, r, front, rows = DEFAULT_ROWS, scale = 1, opacity = 1, tilt = -16}) => (
  <div style={{position: "absolute", left: cx, top: cy, width: 0, height: 0, perspective: 1500, opacity}}>
    <div style={{transformStyle: "preserve-3d", transform: `scale(${scale}) rotateX(${tilt}deg)`}}>
      {rows.map((row, ri) => {
        // Text passt genau x-mal um den Zylinder, Buchstaben nach ungefährer Breite verteilt
        const widths = row.text.split("").map(cw);
        const unit = widths.reduce((a, b) => a + b, 0) * row.size;
        const reps = Math.max(1, Math.round((Math.PI * 2 * r) / unit));
        const k = (Math.PI * 2) / (reps * unit);
        const spin = row.dir * t * 0.9;
        const chars: {ch: string; a: number}[] = [];
        let acc = 0;
        for (let q = 0; q < reps; q++) row.text.split("").forEach((ch, j) => {
          const w = widths[j] * row.size;
          chars.push({ch, a: (acc + w / 2) * k + spin});
          acc += w;
        });
        return chars.map(({ch, a}, i) => {
          if (ch === " ") return null;
          const depth = Math.cos(a);
          if ((depth >= 0) !== front) return null;
          const fade = front ? 1 : interpolate(depth, [-1, 0], [0.35, 0.6]);
          return <div key={`${ri}-${i}`} style={{position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) translateY(${row.y}px) rotateY(${(a * 180) / Math.PI}deg) translateZ(${r}px)`,
            fontFamily: "Pop", fontWeight: 900, fontSize: row.size, lineHeight: 1, color: "#fffaf2", opacity: fade,
            filter: front ? "drop-shadow(0 6px 10px rgba(0,0,0,.45))" : "blur(1.2px)", whiteSpace: "pre"}}>{ch}</div>;
        });
      })}
    </div>
  </div>
);
