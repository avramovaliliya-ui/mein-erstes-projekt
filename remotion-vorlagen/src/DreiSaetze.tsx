import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from "remotion";

// Reel "3 Sätze, die ich mir anhören musste" – 3 Seedance clips + hook, sentence cards, end card.
// Each sentence card is destroyed the same way she destroys hers: crumpled away, burnt, wiped off.
// public/: s1.mp4 (zerknüllen), s2.mp4 (verbrennen), s3.mp4 (wegwischen), s3_last.jpg (last frame of s3),
// seite.jpg (full-page screenshot of the prompt page),
// fonts pf600.woff2, pf600i.woff2 (Playfair Display), lato400.woff2, lato700.woff2
const PF = "PF", LATO = "LT";
const face = (fam: string, file: string, w: number, style = "normal") =>
  `@font-face{font-family:'${fam}';src:url('${staticFile(file)}') format('woff2');font-weight:${w};font-style:${style}}`;
const fontFace = face(PF, "pf600.woff2", 600) + face(PF, "pf600i.woff2", 600, "italic") + face(LATO, "lato400.woff2", 400) + face(LATO, "lato700.woff2", 700);

const W = 1080, H = 1920, CREME = "#F6F0E6", ROST = "#a14f37", INK = "#1C1917";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1), pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};

// clip lengths in frames (30 fps): 4.06 s, 5.06 s, 4.06 s, then end card
// end: card (75) → 3D phone with the prompt page (105)
const L1 = 122, L2 = 152, L3 = 122, CARD = 75, PHONE = 105, END = CARD + PHONE;
const S2 = L1, S3 = L1 + L2, E0 = L1 + L2 + L3;
export const DREI_DURATION = E0 + END;
const P0 = E0 + CARD;
const CUTS = [S2, S3, E0, P0];

const Box: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: CREME, borderRadius: 28, padding: "22px 30px 26px", textAlign: "center", textWrap: "balance", boxShadow: "0 10px 40px rgba(0,0,0,.28)", ...style}}>{children}</div>
);
const Row: React.FC<{top: number; style?: React.CSSProperties; children: React.ReactNode}> = ({top, style, children}) => (
  <div style={{position: "absolute", left: 90, width: 740, top, display: "flex", justifyContent: "center", ...style}}>{children}</div>
);

// hook: words pop in one by one, "anhören" gets a hand-drawn underline
const Hook: React.FC<{f: number}> = ({f}) => {
  const words = ["3", "Sätze,", "die", "ich", "mir", "anhören", "musste"];
  const o = interpolate(f, [50, 58], [1, 0], C);
  const box = interpolate(f, [0, 6], [0.92, 1], {...C, easing: out});
  const line = interpolate(f, [22, 34], [0, 1], {...C, easing: out});
  return (
    <Row top={1215} style={{opacity: o, scale: String(box)}}>
      <Box>
        <div style={{fontFamily: PF, fontWeight: 600, fontSize: 66, lineHeight: 1.12, color: INK}}>
          {words.map((w, k) => {
            const s = interpolate(f, [k * 2.5, k * 2.5 + 7], [0, 1], {...C, easing: pop});
            const acc = w === "anhören";
            return <span key={k} style={{display: "inline-block", position: "relative", margin: "0 9px", opacity: Math.min(1, s * 2), scale: String(0.6 + 0.4 * s),
              fontStyle: acc ? "italic" : "normal", color: acc ? ROST : INK}}>{w}
              {acc && <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{position: "absolute", left: 0, bottom: -14}}>
                <path d="M2 14 C 25 4, 55 22, 98 8" stroke={ROST} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} /></svg>}
            </span>;
          })}
        </div>
      </Box>
    </Row>
  );
};

// card with "SATZ n / 3" + sentence; effect decides how it leaves
type Fx = "crumple" | "burn" | "wipe";
const Satz: React.FC<{f: number; n: number; text: string; from: number; kill: number; fx: Fx}> = ({f, n, text, from, kill, fx}) => {
  if (f < from || f > kill + 40) return null;
  const inS = interpolate(f, [from, from + 10], [0, 1], {...C, easing: pop});
  const k = f - kill; // frames since destruction started
  let style: React.CSSProperties = {opacity: Math.min(1, inS * 1.5), scale: String(0.85 + 0.15 * inS)};
  let extra: React.ReactNode = null;
  const strike = interpolate(f, [kill - 14, kill - 4], [0, 1], {...C, easing: out});
  if (fx === "crumple") {
    // red strike-through, then the card squashes and flies off screen-right like her paper ball
    const p = interpolate(k, [0, 16], [0, 1], {...C, easing: Easing.in(Easing.cubic)});
    style = {...style, scale: String((0.85 + 0.15 * inS) * (1 - 0.75 * p)), rotate: `${p * 200}deg`, translate: `${p * 900}px ${-Math.sin(p * Math.PI) * 260}px`, borderRadius: 28 + p * 200, opacity: k > 16 ? 0 : 1};
  }
  let clip: string | undefined;
  if (fx === "burn") {
    // burns from the bottom up with a glowing edge and embers
    const b = interpolate(k, [0, 34], [0, 100], C);
    clip = `inset(0 0 ${b}% 0)`;
    if (k >= 0 && b < 100) extra = <div style={{position: "absolute", left: 0, right: 0, bottom: `${b}%`, height: 26, translate: "0 13px", borderRadius: 13,
      background: "linear-gradient(transparent, #ffb347 40%, #ff5a1f 60%, transparent)", filter: "blur(6px)", opacity: 0.95}} />;
  }
  if (fx === "wipe") {
    const w = interpolate(k, [0, 22], [0, 100], {...C, easing: Easing.inOut(Easing.quad)});
    clip = `inset(0 0 0 ${w}%)`;
    if (k >= 0 && w < 100) extra = <div style={{position: "absolute", top: -10, bottom: -10, left: `${w}%`, width: 90, translate: "-45px 0",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent)", filter: "blur(4px)"}} />;
  }
  return (
    <Row top={1265} style={style}>
      <div style={{position: "relative"}}>
        <Box style={{clipPath: clip}}>
          <div style={{display: "flex", justifyContent: "center", gap: 12}}>{[1, 2, 3].map((i) => (
            <div key={i} style={{width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: LATO, fontWeight: 700, fontSize: 22,
              background: i < n ? ROST : "transparent", color: i < n ? CREME : ROST, border: `3px solid ${i <= n ? ROST : "#DCCFBC"}`}}>{i < n ? "✓" : i}</div>))}</div>
          <div style={{position: "relative", fontFamily: PF, fontWeight: 600, fontSize: 52, lineHeight: 1.15, color: INK, marginTop: 10}}>„{text}“
            {fx === "crumple" && strike > 0 && <div style={{position: "absolute", left: -6, top: "52%", height: 7, borderRadius: 4, background: ROST, width: `calc(${strike * 100}% + 12px)`, rotate: "-2deg"}} />}
          </div>
        </Box>
        {extra}
      </div>
    </Row>
  );
};

// embers rising from the burning card
const Embers: React.FC<{f: number; start: number}> = ({f, start}) => {
  const k = f - start;
  if (k < 0 || k > 70) return null;
  return <svg width={W} height={H} style={{position: "absolute"}}>{new Array(36).fill(0).map((_, i) => {
    const t0 = random("e" + i) * 30, a = (k - t0) / 40;
    if (a < 0 || a > 1) return null;
    const x = 120 + random("x" + i) * 840 + Math.sin(k / 6 + i) * 20, y = 1560 - random("y" + i) * 120 - a * (380 + random("v" + i) * 300);
    return <circle key={i} cx={x} cy={y} r={3 + random("r" + i) * 4} fill={i % 3 ? "#ffb347" : "#ff6a2a"} opacity={(1 - a) * 0.95} />;
  })}</svg>;
};

// paper-ball "pow" lines when she crumples the card
const Burst: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  const k = f - at;
  if (k < 0 || k > 12) return null;
  const p = k / 12;
  return <svg width={W} height={H} style={{position: "absolute"}}>{new Array(8).fill(0).map((_, i) => {
    const ang = (i / 8) * Math.PI * 2, r1 = 60 + p * 90, r2 = r1 + 50 * (1 - p);
    return <line key={i} x1={x + Math.cos(ang) * r1} y1={y + Math.sin(ang) * r1} x2={x + Math.cos(ang) * r2} y2={y + Math.sin(ang) * r2} stroke="white" strokeWidth={8} strokeLinecap="round" opacity={1 - p} />;
  })}</svg>;
};

// behind the scenes: floating 3D phone, the prompt page scrolls on it
const PhoneScene: React.FC = () => {
  const t = useCurrentFrame();
  const enter = interpolate(t, [0, 20], [1300, 0], {...C, easing: out});
  const ry = interpolate(t, [0, PHONE], [-24, 14]);
  const fl = Math.sin(t / 12) * 12;
  const scroll = interpolate(t, [24, 95], [0, -2900], {...C, easing: Easing.inOut(Easing.quad)});
  const head = interpolate(t, [10, 22], [0, 1], {...C, easing: pop});
  return (
    <AbsoluteFill style={{perspective: 1600}}>
      <Img src={staticFile("s3_last.jpg")} style={{...full, filter: "blur(24px)", scale: "1.1"}} />
      <div style={{position: "absolute", left: 320, top: 470, width: 440, height: 900, borderRadius: 66, background: "#111", padding: 16, boxShadow: "0 50px 80px rgba(0,0,0,.4)",
        transform: `translateY(${enter + fl}px) rotateY(${ry}deg) rotateX(6deg)`}}>
        <div style={{position: "relative", width: 408, height: 868, borderRadius: 52, overflow: "hidden", background: CREME}}>
          <Img src={staticFile("seite.jpg")} style={{position: "absolute", left: 0, top: 0, width: 408, translate: `0 ${scroll}px`}} />
          <div style={{position: "absolute", left: 144, top: 14, width: 120, height: 34, borderRadius: 17, background: "#111"}} />
          <div style={{position: "absolute", inset: 0, background: `linear-gradient(${110 + ry}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.25) 45%, rgba(255,255,255,0) 60%)`}} />
        </div>
      </div>
      <Row top={270} style={{opacity: Math.min(1, head * 1.5), scale: String(0.8 + 0.2 * head)}}>
        <Box style={{padding: "16px 30px 20px"}}>
          <div style={{fontFamily: LATO, fontWeight: 400, fontSize: 30, color: INK}}>Clips: Seedance 2.5 in Higgsfield</div>
          <div style={{fontFamily: PF, fontWeight: 600, fontSize: 46, color: INK, marginTop: 4}}>Schnitt & Effekte: <span style={{fontStyle: "italic", color: ROST}}>Claude</span> ✨</div>
        </Box>
      </Row>
    </AbsoluteFill>
  );
};

export const DreiSaetze: React.FC = () => {
  const f = useCurrentFrame();
  const e = f - E0;
  // punch-in zoom + flash at every cut, small shake when she crumples the card
  const cut = CUTS.reduce((m, c) => (f >= c && f - c < m ? f - c : m), 99);
  const punch = interpolate(cut, [0, 9], [1.07, 1], {...C, easing: out});
  const flash = interpolate(cut, [0, 5], [0.55, 0], C);
  const shake = f >= 62 && f < 74 ? Math.sin(f * 2.3) * 7 : 0;
  // warm firelight pulse while the card burns
  const fire = interpolate(f, [S2 + 30, S2 + 45, S2 + 95, S2 + 115], [0, 1, 1, 0], C) * (0.75 + 0.25 * Math.sin(f * 1.7));
  const cam: React.CSSProperties = {scale: String(punch), translate: `${shake}px ${shake * 0.6}px`};
  return (
    <AbsoluteFill style={{background: "#111", overflow: "hidden"}}>
      <style>{fontFace}</style>
      <AbsoluteFill style={cam}>
        <Sequence durationInFrames={L1}><OffthreadVideo src={staticFile("s1.mp4")} style={full} /></Sequence>
        <Sequence from={S2} durationInFrames={L2}><OffthreadVideo src={staticFile("s2.mp4")} style={full} /></Sequence>
        <Sequence from={S3} durationInFrames={L3}><OffthreadVideo src={staticFile("s3.mp4")} style={full} /></Sequence>
        {e >= 0 && e < CARD && <Img src={staticFile("s3_last.jpg")} style={{...full, scale: String(1 + e * 0.0009)}} />}
      </AbsoluteFill>
      <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 30%, rgba(255,140,40,.35), transparent 60%)", mixBlendMode: "screen", opacity: fire}} />

      <Hook f={f} />
      <Satz f={f} n={1} text="Dafür hast du doch keine Zeit." from={56} kill={L1 - 18} fx="crumple" />
      <Burst f={f} at={62} x={540} y={1010} />
      <Satz f={f} n={2} text="Mit 38 fängt man nicht neu an." from={S2 + 2} kill={S2 + 68} fx="burn" />
      <Embers f={f} start={S2 + 66} />
      <Satz f={f} n={3} text="KI sieht bei dir eh fake aus." from={S3 + 2} kill={S3 + 62} fx="wipe" />

      {/* end card: lines rise in, "Geglaubt nicht mehr." gets underlined */}
      {e >= 0 && e < CARD && (() => {
        const a = interpolate(e, [4, 16], [0, 1], {...C, easing: out}), b = interpolate(e, [20, 32], [0, 1], {...C, easing: out});
        const u = interpolate(e, [32, 46], [0, 1], {...C, easing: out});
        return <>
          <Row top={1250} style={{opacity: a, translate: `0 ${(1 - a) * 30}px`}}>
            <Box>
              <div style={{fontFamily: PF, fontWeight: 600, fontSize: 56, lineHeight: 1.18, color: INK}}>Angehört hab ich sie.</div>
              <div style={{position: "relative", display: "inline-block", fontFamily: PF, fontStyle: "italic", fontWeight: 600, fontSize: 56, lineHeight: 1.18, color: ROST, opacity: b, translate: `0 ${(1 - b) * 20}px`}}>Geglaubt nicht mehr.
                <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{position: "absolute", left: 0, bottom: -12}}>
                  <path d="M2 14 C 25 4, 55 22, 98 8" stroke={ROST} strokeWidth={4} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - u} /></svg>
              </div>
            </Box>
          </Row>
        </>;
      })()}

      <Sequence from={P0} durationInFrames={PHONE}><PhoneScene /></Sequence>

      <AbsoluteFill style={{background: "white", opacity: flash}} />
      <div style={{position: "absolute", left: 60, top: 1830, color: "white", fontFamily: LATO, fontWeight: 700, fontSize: 24, letterSpacing: 3, textShadow: "0 1px 4px rgba(0,0,0,.6)"}}>KI-GENERIERT</div>
    </AbsoluteFill>
  );
};
