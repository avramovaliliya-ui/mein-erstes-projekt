import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from "remotion";
import pts from "./fishpts.json";

const W = 1080, H = 1920, C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1), out = Easing.bezier(0.16, 1, 0.3, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
const SEG = 96; // 3.2 s per effect
const Badge = () => <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>;
const Label: React.FC<{n: string}> = ({n}) => <div style={{position: "absolute", left: 90, top: 260, padding: "10px 24px", borderRadius: 40, background: "white", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 34, color: "#1e1814", boxShadow: "0 10px 24px rgba(0,0,0,.3)"}}>{n}</div>;

// 1 — 3D gold letters (extruded, turning)
const Gold3D = () => {
  const f = useCurrentFrame();
  const ry = interpolate(f, [0, SEG], [-38, 30]);
  const s = interpolate(f, [0, 14], [0.2, 1], {...C, easing: pop});
  const layers = 26;
  return (<AbsoluteFill>
    <Img src={staticFile("u09.jpg")} style={full} />
    <div style={{position: "absolute", left: 90, top: 1130, width: 740, height: 380, perspective: 1400}}>
      <div style={{position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${ry}deg) rotateX(12deg) scale(${s})`}}>
        {new Array(layers).fill(0).map((_, i) => (
          <div key={i} style={{position: "absolute", inset: 0, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 300, lineHeight: "380px",
            transform: `translateZ(${-i * 3.4}px)`, color: i === 0 ? "transparent" : `hsl(38, 60%, ${42 - i * 1.2}%)`,
            backgroundImage: i === 0 ? "linear-gradient(170deg,#fff6d8 0%,#f2cd78 35%,#b98a2e 60%,#ffe9a8 80%,#a87822 100%)" : undefined,
            WebkitBackgroundClip: i === 0 ? "text" : undefined}}>KI</div>))}
      </div>
    </div>
    <Label n="3D-Gold" />
  </AbsoluteFill>);
};

// 2 — cookie letters (baked texture + chocolate chips), letters pop in
const Cookie = () => {
  const f = useCurrentFrame();
  const word = "SÜSS".split("");
  return (<AbsoluteFill>
    <Img src={staticFile("u18.jpg")} style={full} />
    <svg width={W} height={H} style={{position: "absolute"}}>
      <defs>
        <filter id="dough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="9" result="n2" />
          <feDiffuseLighting in="n2" surfaceScale="4" lightingColor="#f1c27d" result="lit"><feDistantLight azimuth="235" elevation="50" /></feDiffuseLighting>
          <feComposite in="lit" in2="rough" operator="in" result="tex" />
          <feGaussianBlur in="rough" stdDeviation="6" result="b" /><feOffset in="b" dy="10" result="sh" />
          <feFlood floodColor="#3a2412" floodOpacity="0.55" /><feComposite in2="sh" operator="in" result="shadow" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="rough" /><feMergeNode in="tex" /></feMerge>
        </filter>
      </defs>
      {word.map((ch, i) => {
        const x = 175 + i * 185, s = interpolate(f, [4 + i * 6, 16 + i * 6], [0, 1], {...C, easing: pop});
        const rot = (random("c" + i) - 0.5) * 16;
        return (<g key={i} transform={`translate(${x} 1420) rotate(${rot}) scale(${s})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight={900} fontSize={250} fill="#c9873f" filter="url(#dough)">{ch}</text>
          {new Array(5).fill(0).map((_, k) => <ellipse key={k} cx={(random(`x${i}${k}`) - 0.5) * 90} cy={-40 - random(`y${i}${k}`) * 130} rx={11} ry={8} fill="#3b2213"
            transform={`rotate(${random(`r${i}${k}`) * 90})`} />)}
        </g>);
      })}
    </svg>
    <Label n="Cookie-Buchstaben" />
  </AbsoluteFill>);
};

// 3 — water letters: drops fall, then glossy liquid word appears
const Water = () => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [22, 40], [0, 1], {...C, easing: out});
  return (<AbsoluteFill>
    <Img src={staticFile("u13.jpg")} style={full} />
    <svg width={W} height={H} style={{position: "absolute"}}>
      <defs>
        <filter id="wet" x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b" />
          <feSpecularLighting in="b" surfaceScale="7" specularConstant="1.1" specularExponent="28" lightingColor="#ffffff" result="spec"><fePointLight x="300" y="900" z="260" /></feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feMorphology in="SourceAlpha" operator="erode" radius="5" result="er" />
          <feComposite in="SourceAlpha" in2="er" operator="out" result="edge" />
          <feFlood floodColor="#0d2a3a" floodOpacity="0.55" /><feComposite in2="edge" operator="in" result="edgeC" />
          <feGaussianBlur in="edgeC" stdDeviation="2" result="edgeS" />
          <feFlood floodColor="#cfeaff" floodOpacity="0.18" /><feComposite in2="SourceAlpha" operator="in" result="body" />
          <feMerge><feMergeNode in="body" /><feMergeNode in="edgeS" /><feMergeNode in="specIn" /></feMerge>
        </filter>
        <filter id="drop"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b" />
          <feSpecularLighting in="b" surfaceScale="5" specularExponent="22" lightingColor="#fff" result="s"><fePointLight x="300" y="600" z="200" /></feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
          <feFlood floodColor="#cfeaff" floodOpacity="0.3" /><feComposite in2="SourceAlpha" operator="in" result="bd" />
          <feMerge><feMergeNode in="bd" /><feMergeNode in="si" /></feMerge></filter>
      </defs>
      {new Array(14).fill(0).map((_, k) => {
        const t0 = random("d" + k) * 16, x = 150 + random("x" + k) * 620;
        const y = interpolate(f, [t0, t0 + 14], [200, 1330], {...C, easing: Easing.in(Easing.quad)});
        const o = interpolate(f, [t0 + 13, t0 + 18], [1, 0], C);
        return <ellipse key={k} cx={x} cy={y} rx={16} ry={22} fill="#fff" filter="url(#drop)" opacity={o} />;
      })}
      <g opacity={fill} transform={`translate(460 1420) scale(${0.9 + 0.1 * fill}) translate(-460 -1420)`}>
        <text x={460} y={1440} textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight={900} fontSize={250} fill="#fff" filter="url(#wet)">ECHT?</text>
      </g>
      {[0, 1, 2].map((r) => { const p = interpolate(f, [24 + r * 5, 50 + r * 5], [0, 1], C);
        return p > 0 && p < 1 ? <ellipse key={r} cx={460} cy={1470} rx={120 + 330 * p} ry={22 + 50 * p} fill="none" stroke="white" strokeWidth={4 * (1 - p)} opacity={0.8} /> : null; })}
    </svg>
    <Label n="Wassertropfen" />
  </AbsoluteFill>);
};

// 4 — fish swim in, form the word, then swim away
const Fish = () => {
  const f = useCurrentFrame();
  const P = pts as number[][];
  const pos = (k: number, fr: number) => {
    const [tx, ty] = P[k];
    const sx = -200 - random("sx" + k) * 500, sy = 900 + random("sy" + k) * 900;
    const a = interpolate(fr, [0, 44 + random("d" + k) * 10], [0, 1], {...C, easing: out});
    const away = interpolate(fr, [74, 96], [0, 1], {...C, easing: Easing.in(Easing.quad)});
    const wig = Math.sin(fr / 4 + k) * 5 * (1 - a * 0.6);
    return [sx + (tx - sx) * a + away * (900 + random("ax" + k) * 300), sy + (ty - sy) * a + wig + Math.sin(k + fr / 7) * 40 * (1 - a) - away * 160];
  };
  return (<AbsoluteFill>
    <Img src={staticFile("u14.jpg")} style={full} />
    <svg width={W} height={H} style={{position: "absolute"}}>
      {P.map((_, k) => {
        const [x, y] = pos(k, f), [x2, y2] = pos(k, f + 1);
        const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
        const still = Math.hypot(x2 - x, y2 - y) < 0.6;
        const tail = Math.sin(f / 2 + k) * 18;
        const col = k % 3 === 0 ? "#ff8a3d" : k % 3 === 1 ? "#ffb347" : "#ffd27a";
        return (<g key={k} transform={`translate(${x} ${y}) rotate(${still ? 0 : ang})`}>
          <path d={`M-12 0 L-24 -9 L-21 0 L-24 9 Z`} fill={col} transform={`rotate(${tail} -12 0)`} />
          <ellipse cx={0} cy={0} rx={14} ry={8} fill={col} stroke="#7a3a10" strokeWidth={1.5} />
          <circle cx={7} cy={-2} r={2} fill="#1e1814" />
        </g>);
      })}
    </svg>
    <Label n="Fische formen ein Wort" />
  </AbsoluteFill>);
};

export const Buchstaben: React.FC = () => (
  <AbsoluteFill style={{background: "#111"}}>
    <Sequence durationInFrames={SEG}><Gold3D /></Sequence>
    <Sequence from={SEG} durationInFrames={SEG}><Cookie /></Sequence>
    <Sequence from={SEG * 2} durationInFrames={SEG}><Water /></Sequence>
    <Sequence from={SEG * 3} durationInFrames={SEG}><Fish /></Sequence>
    <Badge />
  </AbsoluteFill>
);
