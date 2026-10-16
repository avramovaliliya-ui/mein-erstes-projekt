import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import words from "../public/words.json";

const W = 1080, H = 1920, GOLD = "#e8c27a", INK = "#1e1814";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const fontFace = `
@font-face{font-family:'PF';src:url('${staticFile("pf700.woff")}') format('woff');font-weight:700}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff")}') format('woff');font-weight:700;font-style:italic}`;
const stroke = `-4px -4px 0 ${INK},4px -4px 0 ${INK},-4px 4px 0 ${INK},4px 4px 0 ${INK},0 6px 18px rgba(0,0,0,.5)`;
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
type Wd = [string, number, number];
const WS = words as unknown as Wd[];

// talking person (video) and per-frame cutout of her
const Talk: React.FC<{style?: React.CSSProperties}> = ({style}) => <OffthreadVideo src={staticFile("talk.mp4")} style={{...full, ...style}} muted />;
const Cut: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const f = useCurrentFrame();
  const i = Math.min(309, Math.floor((f / 30) * 24));
  return <Img src={staticFile(`cut/${String(i).padStart(4, "0")}.webp`)} style={{...full, ...style}} />;
};

// karaoke captions on the real speech
const Captions: React.FC<{top: number}> = ({top}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  let cur = -1;
  WS.forEach((w, k) => { if (t >= w[1] - 0.05) cur = k; });
  if (cur < 0 || t > WS[cur][2] + 0.4) return null;
  // group into chunks of 3 words
  const g = Math.floor(cur / 3) * 3;
  const chunk = WS.slice(g, g + 3);
  return (
    <div style={{position: "absolute", left: 90, width: 740, top, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 82, lineHeight: 1.1}}>
      {chunk.map((w, k) => {
        const idx = g + k; const on = idx === cur; const shown = idx <= cur;
        const s = on ? interpolate(t, [w[1], w[1] + 0.12], [1.35, 1.12], {...C, easing: out}) : 1;
        return <span key={k} style={{display: "inline-block", margin: "0 10px", color: on ? GOLD : "white", textShadow: stroke, opacity: shown ? 1 : 0.0, scale: String(s)}}>
          {w[0].replace(/[.,!]/g, "").toUpperCase()}</span>;
      })}
    </div>
  );
};

const zoomPunch = (t: number, hits: number[]) => {
  let z = 1;
  hits.forEach((h) => { z += interpolate(t, [h, h + 0.12, h + 0.9], [0, 0.12, 0.08], C) * (t >= h ? 1 : 0); });
  return z;
};

export const TalkDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const imgs = ["u02.jpg", "u14.jpg", "u18.jpg", "u10.jpg", "u17.jpg"];
  // phases
  const pipP = interpolate(t, [6.3, 6.7], [0, 1], {...C, easing: out}) * (1 - interpolate(t, [11.95, 12.3], [0, 1], {...C, easing: out}));
  const flash = interpolate(t, [12.05, 12.12, 12.5], [0, 1, 0], C);
  return (
    <AbsoluteFill style={{background: "#111"}}>
      <style>{fontFace}</style>

      {/* A: 0–2.1 punch-in on talking + selfie card pops */}
      <Sequence from={0} durationInFrames={Math.round(2.1 * fps)} premountFor={fps}>
        <Talk style={{scale: String(zoomPunch(t, [0.58, 1.14]))}} />
        <div style={{position: "absolute", left: 640, top: 300, width: 340, height: 460, border: "10px solid white", borderRadius: 14, overflow: "hidden", rotate: "6deg",
          boxShadow: "0 20px 40px rgba(0,0,0,.4)", scale: String(interpolate(t, [0.55, 0.9], [0, 1], {...C, easing: pop}))}}>
          <Img src={staticFile("selfie.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
          <div style={{position: "absolute", bottom: 8, width: "100%", textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "white", textShadow: stroke}}>📱 Handy</div>
        </div>
      </Sequence>

      {/* B: 2.1–4.6 her images fan out BEHIND her while she talks */}
      <Sequence from={Math.round(2.1 * fps)} durationInFrames={Math.round(2.5 * fps)} premountFor={fps}>
        <Talk />
        {imgs.map((s, k) => {
          const t0 = 2.3 + k * 0.22;
          return <div key={k} style={{position: "absolute", left: 700, top: 330, width: 290, height: 480, border: "10px solid white", borderRadius: 14, overflow: "hidden",
            transformOrigin: "50% 140%", rotate: `${(k - 2) * 12 * interpolate(t, [3.4, 3.9], [0, 1], {...C, easing: out})}deg`,
            translate: interpolate(t, [t0, t0 + 0.35], ["0px -900px", "0px 0px"], {...C, easing: out}), boxShadow: "0 20px 40px rgba(0,0,0,.4)"}}>
            <Img src={staticFile(s)} style={{width: "100%", height: "100%", objectFit: "cover"}} /></div>;
        })}
        <Cut />
      </Sequence>

      {/* C: 4.6–6.3 big word behind her */}
      <Sequence from={Math.round(4.6 * fps)} durationInFrames={Math.round(1.7 * fps)} premountFor={fps}>
        <Talk style={{scale: "1.08"}} />
        <div style={{position: "absolute", width: W, top: 160, textAlign: "center", fontFamily: "PF", fontWeight: 700, fontSize: 420, color: "rgba(255,250,240,.95)",
          translate: interpolate(t, [4.7, 5.2], ["0px 300px", "0px 0px"], {...C, easing: out}), opacity: interpolate(t, [4.7, 5.0], [0, 1], C)}}>TEXT</div>
        <Cut style={{scale: "1.08"}} />
      </Sequence>

      {/* D: 6.3–12 screen content full, she talks in a circle (picture in picture) */}
      <Sequence from={Math.round(6.3 * fps)} durationInFrames={Math.round(5.7 * fps)} premountFor={fps}>
        {/* 6.3–8.3 her images swap fast */}
        {t < 8.3 && <Img src={staticFile(`u${String(1 + (Math.floor((t - 6.3) / 0.25) % 20)).padStart(2, "0")}.jpg`)} style={{...full, scale: String(interpolate((t - 6.3) % 0.25, [0, 0.25], [1.06, 1]))}} />}
        {/* 8.3–9.4 Baukasten screen recording */}
        {t >= 8.3 && t < 9.4 && <OffthreadVideo src={staticFile("rec.mp4")} startFrom={Math.round(6 * fps)} style={full} muted />}
        {/* 9.4–12 result reveal with 3D tilt */}
        {t >= 9.4 && <AbsoluteFill style={{background: "linear-gradient(170deg,#e9ddd3,#c99b8f)", perspective: 1600}}>
          <div style={{position: "absolute", left: 170, top: 240, width: 740, height: 1180, borderRadius: 30, overflow: "hidden", border: "12px solid white", boxShadow: "0 40px 80px rgba(0,0,0,.4)",
            transform: `rotateY(${interpolate(t, [9.4, 10.4], [-50, 6], {...C, easing: out})}deg)`}}>
            <Img src={staticFile("u01.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} /></div></AbsoluteFill>}
      </Sequence>
      {pipP > 0 && <div style={{position: "absolute", left: 1080 - 60 - 360 * pipP - (1 - pipP) * 360, top: 1920 - 520 - (1 - pipP) * 0, width: 360, height: 360,
        borderRadius: 200, overflow: "hidden", border: `8px solid ${GOLD}`, boxShadow: "0 20px 40px rgba(0,0,0,.45)", scale: String(0.3 + 0.7 * pipP)}}>
        <OffthreadVideo src={staticFile("talk.mp4")} style={{width: 360, height: 640, objectFit: "cover", marginTop: -90}} muted /></div>}

      {/* E: 12– Fertig, freeze + emoji burst */}
      <Sequence from={Math.round(12 * fps)} premountFor={fps}>
        <Talk style={{scale: "1.15"}} />
        {new Array(16).fill(0).map((_, k) => {
          const a = (k / 16) * Math.PI * 2, d = interpolate(t, [12.05, 12.7], [0, 520 + random("r" + k) * 200], {...C, easing: out});
          return <div key={k} style={{position: "absolute", left: W / 2 + Math.cos(a) * d - 40, top: 1150 + Math.sin(a) * d * 0.7, fontSize: 80, opacity: interpolate(t, [12.6, 13.1], [1, 0], C)}}>
            {["✨", "🤍", "🔥", "😍"][k % 4]}</div>;
        })}
      </Sequence>

      <Captions top={1180} />
      <AbsoluteFill style={{background: "white", opacity: flash}} />
      <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
      <Sequence from={0}><AudioTrack /></Sequence>
    </AbsoluteFill>
  );
};

import {Audio} from "remotion";
const AudioTrack = () => <Audio src={staticFile("talk.mp4")} />;
