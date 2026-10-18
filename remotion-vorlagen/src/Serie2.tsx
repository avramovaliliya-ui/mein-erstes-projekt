import React from "react";
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

// Serien-Folge nach ihren zwei Vorbildern, Effekt für Effekt nachgebaut, mit ihrem Material.
// Kreator-Video: Creme-Box oben, "claude" hinter dem Kopf, Handy-Karten von links, Chat-Feld, REC/FINAL-EDIT-Karte,
// Video-Wand hinter ihr, Kommentar-Feld → Antwort, Folgen-Karte. Anastasia: Hook-Collage mit Herzen,
// Wörter um den Kopf, "FOLGE 01" schmal + Profil-Karte, "kommentiere" in Schreibschrift, Karte "nächste Folge".
const W = 1080, H = 1920, FPS = 30, LEMON = "#f3dc4a", INK = "#141414", CREAM = "#f3efe6", ORANGE = "#d97757";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const f = (s: number) => Math.round(s * FPS);
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'Osw';src:url('${staticFile("osw700.woff2")}') format('woff2');font-weight:700}
@font-face{font-family:'Mono';src:url('${staticFile("mono400.woff2")}') format('woff2');font-weight:400}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff2")}') format('woff2');font-weight:700;font-style:italic}`;
const sh = "0 2px 6px rgba(0,0,0,.45), 0 0 20px rgba(0,0,0,.35)";

// Schnittliste aus dem Küchen-Video. tts = Ton aus ihrer ElevenLabs-Stimme statt Original (falsch gesprochene Namen)
type Seg = {a: number; b: number; tts?: [number, number]; scene: string};
const SEGS: Seg[] = [
  {a: 0.0, b: 3.1, scene: "hook"},
  {a: 3.1, b: 5.2, scene: "capcut"},
  {a: 11.4, b: 13.35, scene: "woerter"},
  {a: 14.1, b: 16.6, scene: "chat"},
  {a: 16.75, b: 18.95, scene: "ergebnis"},
  {a: 21.33, b: 24.29, tts: [5.4, 7.4], scene: "wand"},
  {a: 25.0, b: 26.35, scene: "frage"},
  {a: 27.35, b: 29.4, tts: [7.38, 9.33], scene: "kommentar"},
];
let acc = 0;
const TL = SEGS.map((s) => { const r = {...s, at: acc}; acc += s.b - s.a; return r; });
export const SERIE2_TOTAL = f(acc);
type S = (typeof TL)[number];

const Basis: React.FC<{s: S}> = ({s}) => <OffthreadVideo src={staticFile("kueche.mp4")} startFrom={f(s.a)} muted={!!s.tts} style={{position: "absolute", width: W, height: H}} />;
const Cut: React.FC<{a: number}> = ({a}) => {
  const n = Math.round((useCurrentFrame() / FPS + a) * 24) + 1; // Ausschnitte liegen in 24 fps vor
  return <Img src={staticFile(`cut/c${String(n).padStart(4, "0")}.png`)} style={{position: "absolute", width: W, height: H}} />;
};
const appear = (fr: number, d = 0) => ({opacity: interpolate(fr - d, [0, 4], [0, 1], C), scale: String(interpolate(fr - d, [0, 8], [0.6, 1], {...C, easing: pop}))});

// Untertitel wie beim Kreator: kleine weisse Zeile, darunter das wichtige Wort riesig in Zitronengelb
const Cap: React.FC<{small: string; big?: string; bigAt?: number; s: S; top: number; left?: number; width?: number}> = ({small, big, bigAt = 0, s, top, left = 90, width = 740}) => {
  const fr = useCurrentFrame(), t = fr / FPS + s.a;
  return <div style={{position: "absolute", left, width, top, textAlign: "center", lineHeight: 0.98}}>
    <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 54, letterSpacing: -1, color: "white", textShadow: sh, ...appear(fr)}}>{small}</div>
    {big && t >= bigAt && <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 104, letterSpacing: -3, color: LEMON, textShadow: sh,
      scale: String(interpolate(t, [bigAt, bigAt + 0.16], [0.5, 1], {...C, easing: pop}))}}>{big}</div>}
  </div>;
};

// Handy-Karte: gerader Bildschirm mit dünnem weissem Rand, rutscht von der Seite rein
const Karte: React.FC<{x: number; y: number; w: number; h: number; rot?: number; from?: "left" | "right"; d?: number; children: React.ReactNode; rec?: boolean; label?: string; gold?: boolean}> =
({x, y, w, h, rot = 0, from = "left", d = 0, children, rec, label, gold}) => {
  const fr = useCurrentFrame() - d;
  const dx = interpolate(fr, [0, 10], [from === "left" ? -w - x - 40 : W - x + 40, 0], {...C, easing: out});
  return <div style={{position: "absolute", left: x + dx, top: y + Math.sin(fr / 12) * 5, width: w, height: h, rotate: `${rot}deg`, borderRadius: 26, overflow: "hidden",
    border: "5px solid rgba(255,255,255,.95)", boxShadow: "0 22px 48px rgba(0,0,0,.45)", background: "#000", opacity: fr < 0 ? 0 : 1}}>
    {children}
    {rec && <div style={{position: "absolute", left: 14, top: 12, fontFamily: "Mono", fontSize: 20, color: "white", display: "flex", alignItems: "center", gap: 6}}>
      <span style={{width: 10, height: 10, borderRadius: 5, background: "#ff3b30", opacity: fr % 20 < 12 ? 1 : 0.3}} />REC</div>}
    {label && <div style={{position: "absolute", left: "50%", bottom: 14, translate: "-50% 0", padding: "4px 14px", background: gold ? LEMON : "rgba(0,0,0,.75)",
      color: gold ? INK : "white", fontFamily: "Mono", fontSize: 22, letterSpacing: 3, border: gold ? "none" : "1px solid rgba(255,255,255,.6)", whiteSpace: "nowrap"}}>{label}</div>}
  </div>;
};
const Clip: React.FC<{src: string; at: number; w: number; h: number}> = ({src, at, w, h}) =>
  <OffthreadVideo src={staticFile(src)} startFrom={f(at)} muted style={{width: w, height: h, objectFit: "cover"}} />;

// Creme-Box oben wie beim Kreator
const Box: React.FC<{text: string[]}> = ({text}) => (
  <div style={{position: "absolute", left: 160, top: 262, padding: "18px 30px 18px 26px", borderRadius: 18, background: CREAM, display: "flex", gap: 16, alignItems: "center",
    boxShadow: "0 8px 22px rgba(0,0,0,.18)"}}>
    <span style={{color: ORANGE, fontSize: 46, lineHeight: 1}}>✳</span>
    <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 33, lineHeight: 1.12, color: INK, letterSpacing: -0.5}}>{text.map((l) => <div key={l}>{l}</div>)}</div>
  </div>
);

// ===== Szenen =====
const TILES: [string, number, number, number, number, number, string][] = [
  // Quelle, Startzeit, x, y, w, h, Herz-Zahl
  ["reel2.mp4", 19.9, 40, 300, 330, 440, "38K"], ["muster.mp4", 1.8, 700, 280, 330, 440, "21,6K"],
  ["reel2.mp4", 25.6, 30, 1250, 300, 420, "10,2K"], ["muster.mp4", 9.6, 380, 1420, 300, 400, "52K"], ["podcast.mp4", 3, 730, 1250, 320, 430, "17K"],
];
const Hook: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  return <>
    <Basis s={s} />
    {TILES.map(([src, at, x, y, w, h, likes], i) => (
      <div key={i} style={{position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", ...appear(fr, i * 3), boxShadow: "0 10px 28px rgba(0,0,0,.35)"}}>
        <Clip src={src} at={at} w={w} h={h} />
        <div style={{position: "absolute", left: 12, bottom: 12, padding: "6px 12px", borderRadius: 10, background: "white", fontFamily: "Pop", fontWeight: 600, fontSize: 22, color: INK,
          ...appear(fr, 14 + i * 4)}}>♡ {likes}</div>
      </div>))}
    <Cut a={s.a} />
    <div style={{position: "absolute", left: 90, width: 740, top: 960, lineHeight: 0.92, ...appear(fr, 6)}}>
      <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 54, color: "white", textShadow: sh, marginLeft: 40}}>mit Claude</div>
      <div style={{fontFamily: "Osw", fontWeight: 700, fontSize: 128, color: "white", textShadow: sh, letterSpacing: 1}}>VIRALE EFFEKTE</div>
      <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 54, color: "white", textShadow: sh, textAlign: "right", marginRight: 30}}>ohne CapCut</div>
    </div>
  </>;
};
const Chaos = () => {
  const fr = useCurrentFrame();
  const cols = ["#5b8def", "#e0a03c", "#4fb38a", "#c8649a", "#8a6de0", "#40c0d0"];
  return <AbsoluteFill style={{background: "#141418"}}>
    <div style={{position: "absolute", left: 30, top: 50, right: 30, height: 230, borderRadius: 10, overflow: "hidden"}}><Clip src="kueche.mp4" at={6} w={290} h={516} /></div>
    {cols.map((c, t) => Array.from({length: 4}, (_, k) => <div key={`${t}${k}`} style={{position: "absolute", left: 10 + k * 78 + ((k * 13 + t * 7 + Math.floor(fr / 3) * 5) % 20) - 10,
      top: 310 + t * 34, width: 62, height: 26, borderRadius: 5, background: c}} />))}
    <div style={{position: "absolute", left: (fr * 11) % 320, top: 300, width: 3, height: 210, background: "white"}} />
    <div style={{position: "absolute", left: 14, top: 14, fontFamily: "Mono", fontSize: 22, color: "#ff6b6b"}}>03:12:47</div>
  </AbsoluteFill>;
};
const Capcut: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const wordOn = fr < 28;
  return <>
    <Basis s={s} />
    {wordOn && <div style={{position: "absolute", left: 0, width: W, top: 300, textAlign: "center", fontFamily: "Pop", fontWeight: 900, fontSize: 230, letterSpacing: -10, color: "white",
      textShadow: "0 10px 30px rgba(0,0,0,.25)", opacity: interpolate(fr, [0, 3, 24, 28], [0, 1, 1, 0], C)}}>claude</div>}
    <Cut a={s.a} />
    {!wordOn && <Box text={["Kann Claude diesen", "Video-Effekt nachbauen?"]} />}
    <Karte x={40} y={830} w={330} h={590} d={8}><Chaos /></Karte>
    <Cap s={s} small="ich nutze kein" big="CapCut mehr." bigAt={4.28} top={1150} left={330} width={560} />
  </>;
};
// Wörter erscheinen nacheinander rund um den Kopf (Anastasia)
// links neben dem Gesicht und unter dem Kinn, nie auf dem Gesicht
const WORT: [string, number, number, number][] = [["heute", 11.52, 90, 520], ["sage", 11.94, 100, 660], ["ich", 12.16, 120, 800], ["nur,", 12.36, 100, 940], ["was", 12.7, 330, 1110], ["ich", 12.78, 500, 1110], ["will.", 12.96, 620, 1110]];
const Woerter: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame(), t = fr / FPS + s.a;
  return <>
    <Basis s={s} />
    {WORT.map(([w, at, x, y], i) => t >= at && <div key={i} style={{position: "absolute", left: x, top: y, fontFamily: "Pop", fontWeight: 600, fontSize: 52, color: "white", textShadow: sh,
      scale: String(interpolate(t, [at, at + 0.15], [0.4, 1], {...C, easing: pop}))}}>{w}</div>)}
  </>;
};
// Chat-Feld + "FOLGE 01" schmal + Profil-Karte
const SATZ = "Mach einen 3D-Ring aus Text um mich";
const Chat: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const n = Math.floor(interpolate(fr, [4, 50], [0, SATZ.length], C));
  return <>
    <Basis s={s} />
    <Box text={["Kann Claude diesen", "Video-Effekt nachbauen?"]} />
    <div style={{position: "absolute", left: 80, top: 520, ...appear(fr)}}>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 30, color: "white", textShadow: sh}}>meine</div>
      <div style={{fontFamily: "Osw", fontWeight: 700, fontSize: 120, lineHeight: 0.95, color: "white", textShadow: sh}}>FOLGE 01</div>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 40, color: "white", textShadow: sh}}>ohne Kamera</div>
    </div>
    <div style={{position: "absolute", left: 80, top: 800, width: 420, padding: 18, borderRadius: 8, background: "white", display: "flex", gap: 14, alignItems: "center",
      boxShadow: "0 10px 26px rgba(0,0,0,.3)", ...appear(fr, 8)}}>
      <div style={{width: 76, height: 76, borderRadius: 38, overflow: "hidden", flexShrink: 0}}><Img src={staticFile("stadt.jpg")} style={{width: 76, height: 135, objectFit: "cover", marginTop: -8}} /></div>
      <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 20, color: INK, lineHeight: 1.3}}><b style={{fontWeight: 900}}>liliyaavramova.ki</b><br />Online-Business mit KI · Schritt für Schritt<br />0 € Starter-Paket ↓</div>
    </div>
    <div style={{position: "absolute", left: 110, width: 860, top: 1230, borderRadius: 30, background: "rgba(26,26,28,.95)", padding: "26px 28px 20px", boxShadow: "0 20px 44px rgba(0,0,0,.5)",
      ...appear(fr, 2)}}>
      <div style={{display: "flex", gap: 14, alignItems: "center", fontFamily: "Pop", fontWeight: 600, fontSize: 40, color: "white"}}>
        <span style={{color: ORANGE, fontSize: 44}}>✳</span>{SATZ.slice(0, n)}<span style={{opacity: fr % 14 < 7 ? 1 : 0, fontWeight: 400}}>|</span></div>
      <div style={{display: "flex", justifyContent: "space-between", marginTop: 22}}>
        <span style={{width: 50, height: 50, borderRadius: 25, border: "2px solid #666", color: "#bbb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32}}>+</span>
        <span style={{width: 54, height: 54, borderRadius: 14, background: "#f3efe6", color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900}}>↑</span>
      </div>
    </div>
  </>;
};
const Ergebnis: React.FC<{s: S}> = ({s}) => (<>
  <Basis s={s} />
  <Karte x={610} y={1120} w={260} h={460} rot={3} from="right" d={4} rec label="FINAL EDIT" gold><Clip src="reel2.mp4" at={20.2} w={260} h={462} /></Karte>
  <Cap s={s} small="ich steige aus dem" big="Handy." bigAt={18.2} top={1220} left={70} width={520} />
</>);
// Video-Wand hinter ihr (Kreator „26 effects“)
const WAND: [string, number][] = [["reel2.mp4", 19.9], ["muster.mp4", 1.5], ["podcast.mp4", 2], ["reel2.mp4", 25.4], ["muster.mp4", 5.5], ["reel2.mp4", 29.2], ["muster.mp4", 9.4], ["podcast.mp4", 7], ["reel2.mp4", 15.5], ["muster.mp4", 3]];
const Wand: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const y = -fr * 2.2;
  return <>
    <AbsoluteFill style={{background: "#111"}}>
      {WAND.map(([src, at], i) => <div key={i} style={{position: "absolute", left: (i % 3) * 362 + 4, top: Math.floor(i / 3) * 520 + (i % 3 === 1 ? 160 : 0) + y + 40, width: 350, height: 500, overflow: "hidden", borderRadius: 10, opacity: 0.85}}>
        <Clip src={src} at={at} w={350} h={622} /></div>)}
    </AbsoluteFill>
    <Cut a={s.a} />
    <Cap s={s} small="und Claude schneidet" big="alles." bigAt={22.9} top={1180} />
  </>;
};
const Frage: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  const n = Math.floor(interpolate(fr, [10, 34], [0, 6], C));
  return <>
    <Basis s={s} />
    <Cap s={s} small="willst du wissen," big="wie?" bigAt={25.96} top={1060} />
    <div style={{position: "absolute", left: 220, width: 640, top: 1360, borderRadius: 40, padding: "16px 22px", background: "rgba(20,20,22,.92)", border: "2px solid rgba(255,255,255,.5)",
      display: "flex", alignItems: "center", gap: 16, ...appear(fr, 6)}}>
      <span style={{width: 44, height: 44, borderRadius: 22, background: "#888"}} />
      <span style={{flex: 1, fontFamily: "Pop", fontWeight: 900, fontSize: 40, color: "white"}}>{"CLAUDE".slice(0, n)}<span style={{opacity: fr % 14 < 7 ? 1 : 0}}>|</span></span>
      <span style={{width: 46, height: 46, borderRadius: 23, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900}}>↑</span>
    </div>
  </>;
};
const Kommentar: React.FC<{s: S}> = ({s}) => {
  const fr = useCurrentFrame();
  return <>
    <Basis s={s} />
    <div style={{position: "absolute", left: 90, width: 740, top: 1110, textAlign: "center", ...appear(fr)}}>
      <div style={{fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 92, color: "white", textShadow: sh, lineHeight: 0.9}}>kommentiere</div>
      <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 54, color: "white", textShadow: sh}}>„CLAUDE“</div>
    </div>
    <div style={{position: "absolute", left: 200, width: 680, top: 1330, ...appear(fr, 2)}}>
      <div style={{display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 22px", borderRadius: 26, background: "rgba(20,20,22,.92)", color: "white"}}>
        <span style={{fontFamily: "Pop", fontSize: 22, opacity: 0.7}}>du</span><span style={{fontFamily: "Pop", fontWeight: 900, fontSize: 40}}>CLAUDE</span><span style={{color: "#ff3b6b", fontSize: 30}}>♥</span></div>
      <div style={{marginTop: 12, marginLeft: 50, width: 440, padding: "14px 18px", borderRadius: 20, background: "rgba(20,20,22,.92)", color: "white", fontFamily: "Pop", fontSize: 22, ...appear(fr, 12)}}>
        <b style={{fontWeight: 900}}>liliyaavramova.ki</b><br />hat dir den Link geschickt 🤍<br />
        <span style={{display: "inline-block", marginTop: 8, padding: "6px 16px", borderRadius: 14, background: "white", color: INK, fontWeight: 600}}>🔗 Öffnen</span></div>
    </div>
    <div style={{position: "absolute", left: 40, top: 560, width: 220, ...appear(fr, 22)}}>
      <div style={{width: 220, height: 300, overflow: "hidden", border: "4px solid white", boxShadow: "0 12px 28px rgba(0,0,0,.4)"}}><Clip src="muster.mp4" at={9.8} w={220} h={391} /></div>
      <div style={{fontFamily: "Osw", fontWeight: 700, fontSize: 30, color: "white", textShadow: sh, marginTop: 6}}>NÄCHSTE FOLGE</div>
    </div>
  </>;
};
const SZ: Record<string, React.FC<{s: S}>> = {hook: Hook, capcut: Capcut, woerter: Woerter, chat: Chat, ergebnis: Ergebnis, wand: Wand, frage: Frage, kommentar: Kommentar};

export const Serie2: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <style>{fontFace}</style>
    {TL.map((s, i) => { const Z = SZ[s.scene]; return <Sequence key={i} from={f(s.at)} durationInFrames={f(s.at + s.b - s.a) - f(s.at)}>
      <Z s={s} />{s.tts && <Audio src={staticFile("tts4.wav")} startFrom={f(s.tts[0])} volume={1.15} />}</Sequence>; })}
    <div style={{position: "absolute", left: 40, top: 1856, fontFamily: "Pop", fontWeight: 600, fontSize: 22, letterSpacing: 2, color: "white", textShadow: "0 1px 4px rgba(0,0,0,.8)"}}>KI-GENERIERT</div>
  </AbsoluteFill>
);
