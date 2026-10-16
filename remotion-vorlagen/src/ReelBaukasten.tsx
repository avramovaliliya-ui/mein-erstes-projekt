import React from "react";
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import wMain from "../public/words.json";
import wCta from "../public/words_cta.json";

const W = 1080, H = 1920, GOLD = "#e8c27a", INK = "#1e1814", RED = "#e0463c";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const stroke = `-4px -4px 0 ${INK},4px -4px 0 ${INK},-4px 4px 0 ${INK},4px 4px 0 ${INK},0 6px 18px rgba(0,0,0,.5)`;
const fontFace = `@font-face{font-family:'PF';src:url('${staticFile("pf700.woff")}') format('woff');font-weight:700}`;
const full: React.CSSProperties = {position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"};
type Wd = [string, number, number];
const CTA_AT = 13.0;
const ALL: Wd[] = [...(wMain as unknown as Wd[]), ...(wCta as unknown as Wd[]).map((w) => [w[0], w[1] + CTA_AT, w[2] + CTA_AT] as Wd)];
const BK = ["bk_02.jpg", "bk_07.jpg", "bk_10.jpg", "bk_08.jpg", "bk_12.jpg"];

// "at" = start second of the surrounding Sequence, so mouth stays in sync with the voice
const Talk: React.FC<{at: number; style?: React.CSSProperties}> = ({at, style}) => <OffthreadVideo src={staticFile("talk.mp4")} startFrom={Math.round(at * 30)} style={{...full, ...style}} muted />;
const Cut: React.FC<{at: number; style?: React.CSSProperties}> = ({at, style}) => {
  const f = useCurrentFrame() + Math.round(at * 30);
  const i = Math.min(309, Math.floor((f / 30) * 24));
  return <Img src={staticFile(`cut/${String(i).padStart(4, "0")}.webp`)} style={{...full, ...style}} />;
};

const Captions: React.FC<{t: number; top: number}> = ({t, top}) => {
  let cur = -1;
  ALL.forEach((w, k) => { if (t >= w[1] - 0.05) cur = k; });
  if (cur < 0 || t > ALL[cur][2] + 0.45) return null;
  // chunk = words of the same sentence, max 3
  let g = cur; while (g > 0 && cur - g < 2 && !/[.!?]$/.test(ALL[g - 1][0]) && ALL[g][1] - ALL[g - 1][2] < 0.35) g--;
  const chunk = ALL.slice(g, cur + 1);
  return (
    <div style={{position: "absolute", left: 90, width: 740, top, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 84, lineHeight: 1.08}}>
      {chunk.map((w, k) => {
        const on = g + k === cur;
        const s = on ? interpolate(t, [w[1], w[1] + 0.12], [1.3, 1.08], {...C, easing: out}) : 1;
        const key = /foto|chatgpt|text|kopierst|fertig|baukasten|gratis/i.test(w[0]);
        return <span key={k} style={{display: "inline-block", margin: "0 10px", color: on && key ? GOLD : "white", textShadow: stroke, scale: String(s)}}>
          {w[0].replace(/[.,!]/g, "").toUpperCase()}</span>;
      })}
    </div>
  );
};

const Pip: React.FC<{p: number; at?: number}> = ({p, at = 0}) => p <= 0 ? null : (
  <div style={{position: "absolute", left: 790 - 0, top: 1240, width: 250, height: 250, borderRadius: 140, overflow: "hidden", border: `7px solid ${GOLD}`,
    boxShadow: "0 18px 40px rgba(0,0,0,.45)", scale: String(p), opacity: Math.min(1, p * 2)}}>
    <OffthreadVideo src={staticFile("talk.mp4")} startFrom={Math.round(at * 30)} style={{position: "absolute", width: 340, height: 604, left: -40, top: -2, maxWidth: "none"}} muted />
  </div>
);

export const ReelBaukasten: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const sec = (a: number) => Math.round(a * fps);
  const pip = interpolate(t, [6.3, 6.65], [0, 1], {...C, easing: pop}) * (1 - interpolate(t, [11.9, 12.1], [0, 1], C));
  const flash = interpolate(t, [12.05, 12.1, 12.45], [0, 0.9, 0], C) + interpolate(t, [12.95, 13.0, 13.25], [0, 0.7, 0], C);
  return (
    <AbsoluteFill style={{background: "#111"}}>
      <style>{fontFace}</style>

      {/* 0–2.1 Handyfoto: punch zoom + selfie polaroid */}
      <Sequence from={0} durationInFrames={sec(2.1)} premountFor={fps}>
        <Talk at={0} style={{scale: String(1 + interpolate(t, [0.55, 0.7], [0, 0.1], C) + interpolate(t, [1.12, 1.25], [0, 0.06], C))}} />
        <div style={{position: "absolute", left: 650, top: 300, width: 340, height: 470, background: "white", padding: "14px 14px 60px", rotate: "7deg",
          boxShadow: "0 24px 50px rgba(0,0,0,.45)", scale: String(interpolate(t, [0.5, 0.85], [0, 1], {...C, easing: pop}))}}>
          <Img src={staticFile("selfie.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
          <div style={{position: "absolute", left: 0, bottom: 10, width: "100%", textAlign: "center", fontFamily: "PF", fontWeight: 700, fontSize: 34, color: INK}}>Handyfoto 📱</div>
        </div>
      </Sequence>

      {/* 2.1–3.4 before/after slider */}
      <Sequence from={sec(2.1)} durationInFrames={sec(1.3)} premountFor={fps}>
        <Img src={staticFile("bk_02.jpg")} style={full} />
        {(() => { const x = interpolate(t, [2.25, 3.2], [W, 0], {...C, easing: out}); return (<>
          <div style={{position: "absolute", left: 0, top: 0, width: x, height: H, overflow: "hidden"}}><Img src={staticFile("selfie.jpg")} style={{...full, objectPosition: "50% 30%"}} /></div>
          <div style={{position: "absolute", left: x - 5, top: 0, width: 10, height: H, background: "white", boxShadow: "0 0 25px rgba(0,0,0,.4)"}} />
          <div style={{position: "absolute", left: x - 45, top: 900, width: 90, height: 90, borderRadius: 45, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40}}>⇆</div>
        </>); })()}
        <Pip p={1} at={2.1} />
      </Sequence>

      {/* 3.4–4.6 results fan out behind her */}
      <Sequence from={sec(3.4)} durationInFrames={sec(1.2)} premountFor={fps}>
        <Talk at={3.4} />
        {(() => {
          const ang0 = interpolate(t, [3.4, 4.6], [0, Math.PI * 0.9], C);
          const items = BK.map((src, k) => {
            const a = ang0 + (k / BK.length) * Math.PI * 2;
            const depth = Math.sin(a); // >0 front (below chin), <0 behind head
            const x = 540 + Math.cos(a) * 430, y = 420 + depth * 400;
            const sc = 0.78 + 0.32 * (depth + 1) / 2;
            const appear = interpolate(t, [3.4 + k * 0.06, 3.65 + k * 0.06], [0, 1], {...C, easing: pop});
            return {src, k, depth, x, y, sc: sc * appear};
          });
          const card = (o: {src: string; k: number; x: number; y: number; sc: number}) => (
            <div key={o.k} style={{position: "absolute", left: o.x - 100, top: o.y - 135, width: 200, height: 270, border: "8px solid white", borderRadius: 14, overflow: "hidden",
              boxShadow: "0 16px 34px rgba(0,0,0,.4)", scale: String(o.sc)}}>
              <Img src={staticFile(o.src)} style={{width: "100%", height: "100%", objectFit: "cover"}} /></div>);
          return (<>
            {items.filter((o) => o.depth < 0).map(card)}
            <Cut at={3.4} />
            {items.filter((o) => o.depth >= 0).map(card)}
          </>);
        })()}
      </Sequence>

      {/* 4.6–6.3 big TEXT behind her */}
      <Sequence from={sec(4.6)} durationInFrames={sec(1.7)} premountFor={fps}>
        <Talk at={4.6} style={{scale: String(interpolate(t, [4.6, 6.3], [1.04, 1.1], C))}} />
        <div style={{position: "absolute", width: W, top: 150, textAlign: "center", fontFamily: "PF", fontWeight: 700, fontSize: 420, color: "rgba(255,250,240,.96)",
          translate: interpolate(t, [4.7, 5.15], ["0px 320px", "0px 0px"], {...C, easing: out}), opacity: interpolate(t, [4.7, 4.95], [0, 1], C)}}>TEXT</div>
        <Cut at={4.6} style={{scale: String(interpolate(t, [4.6, 6.3], [1.04, 1.1], C))}} />
      </Sequence>

      {/* 6.3–8.3 Baukasten settings, she in circle */}
      <Sequence from={sec(6.3)} durationInFrames={sec(2.0)} premountFor={fps}>
        <AbsoluteFill style={{translate: interpolate(t, [6.3, 6.6], ["1080px 0px", "0px 0px"], {...C, easing: out})}}>
          <OffthreadVideo src={staticFile("rec.mp4")} startFrom={sec(6)} playbackRate={1.3} style={full} muted />
        </AbsoluteFill>
      </Sequence>

      {/* 8.3–9.4 zoom on Kopieren + red circle + tap */}
      <Sequence from={sec(8.3)} durationInFrames={sec(1.1)} premountFor={fps}>
        {(() => {
          const z = interpolate(t, [8.3, 8.65], [1, 1.9], {...C, easing: out});
          const cx = 883, cy = 1275;
          const x0 = Math.min(Math.max(cx * z - 540, 0), W * z - W), y0 = Math.min(Math.max(cy * z - 760, 0), H * z - H);
          const bx = cx * z - x0, by = cy * z - y0;
          const d = interpolate(t, [8.5, 8.85], [1, 0], {...C, easing: out});
          const rip = interpolate(t, [8.9, 9.3], [0, 1], C);
          return (<>
            <Img src={staticFile("rec9.png")} style={{position: "absolute", left: -x0, top: -y0, width: W * z, height: H * z}} />
            <svg width={W} height={H} style={{position: "absolute"}}>
              <ellipse cx={bx} cy={by} rx={240} ry={95} fill="none" stroke={RED} strokeWidth={12} pathLength={1} strokeDasharray={1} strokeDashoffset={d} />
              {rip > 0 && rip < 1 && <circle cx={bx} cy={by} r={30 + 90 * rip} fill="none" stroke="white" strokeWidth={10 * (1 - rip)} />}
            </svg>
            <div style={{position: "absolute", left: bx - 30, top: by + 10, fontSize: 90, rotate: "-20deg", opacity: interpolate(t, [8.75, 8.9], [0, 1], C)}}>👆</div>
          </>);
        })()}
      </Sequence>

      {/* 9.4–12 ChatGPT screenshot slides up, then result tilts in 3D */}
      <Sequence from={sec(9.4)} durationInFrames={sec(2.6)} premountFor={fps}>
        <AbsoluteFill style={{background: "linear-gradient(170deg,#efe6dd,#cfa597)", perspective: 1600}}>
          <Img src={staticFile("gpt.jpg")} style={{position: "absolute", left: 70, top: 120, width: 940, borderRadius: 26, boxShadow: "0 30px 60px rgba(0,0,0,.35)",
            translate: interpolate(t, [9.4, 9.75], ["0px 1900px", "0px 0px"], {...C, easing: out}), opacity: 1 - interpolate(t, [10.8, 11.0], [0, 1], C)}} />
          <div style={{position: "absolute", left: 170, top: 230, width: 740, height: 1180, borderRadius: 30, overflow: "hidden", border: "12px solid white", boxShadow: "0 40px 80px rgba(0,0,0,.4)",
            opacity: interpolate(t, [10.8, 11.0], [0, 1], C), transform: `rotateY(${interpolate(t, [10.8, 11.6], [-55, 5], {...C, easing: out})}deg)`}}>
            <Img src={staticFile("bk_10.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} /></div>
        </AbsoluteFill>
      </Sequence>

      {/* 12–13 Fertig: grid pop */}
      <Sequence from={sec(12)} durationInFrames={sec(1.0)} premountFor={fps}>
        <AbsoluteFill style={{background: "#f3ece4"}}>
          {new Array(12).fill(0).map((_, k) => {
            const s = interpolate(t, [12.05 + k * 0.03, 12.3 + k * 0.03], [0, 1], {...C, easing: pop});
            return <div key={k} style={{position: "absolute", left: 30 + (k % 3) * 343, top: 150 + Math.floor(k / 3) * 405, width: 333, height: 395, borderRadius: 14, overflow: "hidden",
              border: "6px solid white", scale: String(s), rotate: `${(random("r" + k) - 0.5) * 6}deg`}}>
              <Img src={staticFile(`bk_${String(k + 1).padStart(2, "0")}.jpg`)} style={{width: "100%", height: "100%", objectFit: "cover"}} /></div>;
          })}
        </AbsoluteFill>
      </Sequence>

      {/* 13– CTA */}
      <Sequence from={sec(CTA_AT)} premountFor={fps}>
        <OffthreadVideo src={staticFile("cta.mp4")} style={full} volume={1.9} />
        {(() => {
          const s = interpolate(t, [13.3, 13.6], [0, 1], {...C, easing: pop});
          return (<div style={{position: "absolute", left: 90, top: 1350, width: 560, padding: "22px 30px", borderRadius: 30, background: "white", boxShadow: "0 18px 40px rgba(0,0,0,.35)",
            display: "flex", alignItems: "center", gap: 22, scale: String(s), transformOrigin: "0% 50%"}}>
            <Img src={staticFile("selfie.jpg")} style={{width: 74, height: 74, borderRadius: 37, objectFit: "cover"}} />
            <div style={{fontFamily: "Poppins, sans-serif", lineHeight: 1.15}}>
              <div style={{fontSize: 26, color: "#888"}}>Kommentar</div>
              <div style={{fontSize: 52, fontWeight: 800, color: INK}}>FOTO 🤍</div>
            </div>
          </div>);
        })()}
        <div style={{position: "absolute", left: 660, top: 1360, fontSize: 110, translate: `0px ${Math.sin(f / 5) * 14}px`, opacity: interpolate(t, [13.6, 13.8], [0, 1], C)}}>👇</div>
      </Sequence>

      <Pip p={t >= 6.3 && t < 12 ? pip : 0} />
      <Captions t={t} top={t >= CTA_AT ? 1080 : 1150} />
      <AbsoluteFill style={{background: "white", opacity: flash}} />
      <div style={{position: "absolute", left: 40, top: 1860, padding: "4px 12px", borderRadius: 8, background: "black", color: "white", fontFamily: "Poppins, sans-serif", fontSize: 24}}>KI-generiert</div>
      <Audio src={staticFile("talk.mp4")} />
    </AbsoluteFill>
  );
};
