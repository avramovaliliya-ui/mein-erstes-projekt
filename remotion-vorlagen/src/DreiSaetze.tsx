import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

// Reel "3 Sätze, die ich mir anhören musste" – 3 Seedance clips + hook, sentence captions, end card.
// public/: s1.mp4 (zerknüllen), s2.mp4 (verbrennen), s3.mp4 (wegwischen), s3_last.jpg (last frame of s3),
// fonts pf600.woff2, pf600i.woff2 (Playfair Display), lato400.woff2, lato700.woff2
const PF = "PF", LATO = "LT";
const face = (fam: string, file: string, w: number, style = "normal") =>
  `@font-face{font-family:'${fam}';src:url('${staticFile(file)}') format('woff2');font-weight:${w};font-style:${style}}`;
const fontFace = face(PF, "pf600.woff2", 600) + face(PF, "pf600i.woff2", 600, "italic") + face(LATO, "lato400.woff2", 400) + face(LATO, "lato700.woff2", 700);

const W = 1080, H = 1920, CREME = "#F6F0E6", ROST = "#a14f37", INK = "#1C1917";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};

// clip lengths in frames (30 fps): 4.06 s, 5.06 s, 4.06 s, then end card
const L1 = 122, L2 = 152, L3 = 122, END = 105;
export const DREI_DURATION = L1 + L2 + L3 + END;

// fade + slide in, fade out
const useIn = (from: number, to: number) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 8, to - 6, to], [0, 1, 1, 0], C);
  const dy = interpolate(f, [from, from + 12], [24, 0], {...C, easing: out});
  return {opacity: o, translate: `0px ${dy}px`};
};

const Panel: React.FC<{top: number; from: number; to: number; children: React.ReactNode}> = ({top, from, to, children}) => {
  const a = useIn(from, to);
  return (
    <div style={{position: "absolute", left: 70, width: W - 140, top, display: "flex", justifyContent: "center", ...a}}>
      <div style={{background: CREME, borderRadius: 28, padding: "26px 40px 30px", textAlign: "center", textWrap: "balance", boxShadow: "0 10px 40px rgba(0,0,0,.28)"}}>{children}</div>
    </div>
  );
};

// "1 / 3" + the sentence in quotes
const Satz: React.FC<{n: number; text: string; from: number; to: number}> = ({n, text, from, to}) => (
  <Panel top={1390} from={from} to={to}>
    <div style={{fontFamily: LATO, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: ROST}}>SATZ {n} / 3</div>
    <div style={{fontFamily: PF, fontWeight: 600, fontSize: 60, lineHeight: 1.15, color: INK, marginTop: 8}}>„{text}“</div>
  </Panel>
);

export const DreiSaetze: React.FC = () => {
  const f = useCurrentFrame();
  const e = f - (L1 + L2 + L3);
  return (
    <AbsoluteFill style={{background: "#111"}}>
      <style>{fontFace}</style>
      <Sequence durationInFrames={L1}><OffthreadVideo src={staticFile("s1.mp4")} style={full} /></Sequence>
      <Sequence from={L1} durationInFrames={L2}><OffthreadVideo src={staticFile("s2.mp4")} style={full} /></Sequence>
      <Sequence from={L1 + L2} durationInFrames={L3}><OffthreadVideo src={staticFile("s3.mp4")} style={full} /></Sequence>
      {e >= 0 && <Img src={staticFile("s3_last.jpg")} style={{...full, scale: String(1 + e * 0.0008)}} />}
      {e >= 0 && <AbsoluteFill style={{background: "linear-gradient(transparent 45%, rgba(20,14,10,.55) 75%)", opacity: interpolate(e, [0, 12], [0, 1], C)}} />}

      {/* hook: readable from frame 0, lower third, never over her face */}
      <Panel top={1330} from={-8} to={58}>
        <div style={{fontFamily: PF, fontWeight: 600, fontSize: 78, lineHeight: 1.1, color: INK}}>
          3 Sätze, die ich mir <span style={{fontStyle: "italic", color: ROST}}>anhören</span> musste
        </div>
      </Panel>

      <Satz n={1} text="Dafür hast du doch keine Zeit." from={58} to={L1 - 4} />
      <Satz n={2} text="Mit 38 fängt man nicht neu an." from={L1 + 2} to={L1 + 112} />
      <Satz n={3} text="KI sieht bei dir eh fake aus." from={L1 + L2 + 2} to={L1 + L2 + 84} />

      {/* end card */}
      <Panel top={1110} from={L1 + L2 + L3 + 4} to={DREI_DURATION + 10}>
        <div style={{fontFamily: PF, fontWeight: 600, fontSize: 60, lineHeight: 1.15, color: INK}}>
          Angehört hab ich sie.<br /><span style={{fontStyle: "italic", color: ROST}}>Geglaubt nicht mehr.</span>
        </div>
      </Panel>
      <Panel top={1380} from={L1 + L2 + L3 + 26} to={DREI_DURATION + 10}>
        <div style={{fontFamily: PF, fontWeight: 600, fontSize: 50, lineHeight: 1.2, color: INK}}>Welchen Satz würdest du verbrennen?</div>
        <div style={{fontFamily: LATO, fontWeight: 400, fontSize: 34, color: ROST, marginTop: 14}}>Alle Prompts: kommentiere <b>PROMPT</b></div>
      </Panel>

      <div style={{position: "absolute", left: 40, top: 60, padding: "6px 14px", borderRadius: 8, background: "rgba(0,0,0,.55)", color: "white", fontFamily: LATO, fontSize: 26}}>KI-generiert</div>
    </AbsoluteFill>
  );
};
