import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Sequence} from "remotion";

const fontFace = `
@font-face{font-family:'PF';src:url('${staticFile("pf700.woff")}') format('woff');font-weight:700;font-style:normal}
@font-face{font-family:'PF';src:url('${staticFile("pf400.woff")}') format('woff');font-weight:400;font-style:normal}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff")}') format('woff');font-weight:700;font-style:italic}
`;
const W = 1080, H = 1350;
const GOLD = "#e8c27a";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const spring = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

// background portrait + cutout share the same slow zoom
const Zoomed: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{scale: interpolate(frame, [0, durationInFrames], [1, 1.07], clamp), transformOrigin: "50% 45%"}}>
      {children}
    </AbsoluteFill>
  );
};

const Lens: React.FC<{src: string; x: number; y: number; fx: number; fy: number; start: number; label: string}> = ({src, x, y, fx, fy, start, label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t0 = start * fps;
  const r = 140;
  const p = interpolate(frame, [t0, t0 + 0.5 * fps], [0, 1], {...clamp, easing: spring});
  const line = interpolate(frame, [t0 - 0.35 * fps, t0], [0, 1], {...clamp, easing: smooth});
  const inner = interpolate(frame, [t0, t0 + 3 * fps], [1.0, 1.25], clamp);
  const lx = fx + (x - fx) * line, ly = fy + (y - fy) * line;
  return (
    <>
      <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0}}>
        <circle cx={fx} cy={fy} r={10 * Math.min(1, line * 2)} fill="none" stroke={GOLD} strokeWidth={3} />
        <line x1={fx} y1={fy} x2={lx} y2={ly} stroke={GOLD} strokeWidth={2.5} />
      </svg>
      <div style={{position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden",
        border: `5px solid ${GOLD}`, boxShadow: "0 18px 40px rgba(0,0,0,0.35)", scale: String(p), opacity: Math.min(1, p * 1.5)}}>
        <Img src={staticFile(src)} style={{width: "100%", height: "100%", objectFit: "cover", scale: String(inner)}} />
      </div>
      <div style={{position: "absolute", left: x - 120, top: y + r + 14, width: 240, textAlign: "center", fontFamily: "Poppins, sans-serif",
        fontSize: 26, fontWeight: 600, letterSpacing: 3, color: "white", textShadow: "0 2px 6px rgba(0,0,0,0.7)", opacity: p}}>{label}</div>
    </>
  );
};

export const Folie1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const l1 = "Diese Frau gibt es nicht.";
  const n = Math.round(interpolate(frame, [0.6 * fps, 1.8 * fps], [0, l1.length], clamp));
  const stroke = "-3px -3px 0 #1e1814, 3px -3px 0 #1e1814, -3px 3px 0 #1e1814, 3px 3px 0 #1e1814, 0 4px 14px rgba(0,0,0,.5)";
  return (
    <AbsoluteFill style={{backgroundColor: "#d9d8d4"}}>
      <style>{fontFace}</style>
      <Zoomed>
        <Img src={staticFile("portrait.jpg")} style={{width: W, height: H, objectFit: "cover"}} />
      </Zoomed>
      {/* big word rises behind her head */}
      <div style={{position: "absolute", left: 0, width: W, top: -40, textAlign: "center", fontFamily: "PF", fontWeight: 700, fontSize: 330,
        color: "rgba(255,250,240,0.93)", letterSpacing: -4,
        translate: interpolate(frame, [0.2 * fps, 1.4 * fps], ["0px 260px", "0px 0px"], {...clamp, easing: smooth}),
        opacity: interpolate(frame, [0.2 * fps, 0.9 * fps], [0, 1], clamp)}}>ECHT?</div>
      <Zoomed>
        <Img src={staticFile("cutout.png")} style={{width: W, height: H, objectFit: "cover"}} />
      </Zoomed>
      {/* macro lenses: eye, lips, ear */}
      <Sequence from={0} premountFor={fps}>
        <Lens src="eye.jpg" x={880} y={330} fx={548} fy={617} start={2.3} label="AUGE" />
        <Lens src="lips.jpg" x={880} y={760} fx={445} fy={866} start={3.2} label="LIPPEN" />
        <Lens src="cheek.jpg" x={180} y={560} fx={350} fy={770} start={4.1} label="HAUT" />
      </Sequence>
      {/* text */}
      <div style={{position: "absolute", left: 70, top: 1085, fontFamily: "PF", fontWeight: 400, fontSize: 60, color: "white", textShadow: stroke}}>
        {l1.slice(0, n)}
      </div>
      <div style={{position: "absolute", left: 70, top: 1165, fontFamily: "PF", fontWeight: 700, fontStyle: "italic", fontSize: 88, color: GOLD, textShadow: stroke,
        transformOrigin: "0% 50%", scale: String(interpolate(frame, [5.0 * fps, 5.4 * fps], [0, 1], {...clamp, easing: spring}))}}>
        Oder doch?
      </div>
      <div style={{position: "absolute", left: 30, top: 1300, padding: "4px 12px", borderRadius: 8, background: "black", color: "white",
        fontFamily: "Poppins, sans-serif", fontSize: 22}}>KI-generiert</div>
      <div style={{position: "absolute", right: 40, top: 1296, fontFamily: "Poppins, sans-serif", fontSize: 26, fontWeight: 600, color: "white",
        textShadow: "0 2px 6px rgba(0,0,0,.7)", opacity: interpolate(frame, [6 * fps, 6.4 * fps], [0, 1], clamp),
        translate: `${Math.sin(frame / 4) * 8}px 0px`}}>weiter wischen &gt;&gt;</div>
    </AbsoluteFill>
  );
};
