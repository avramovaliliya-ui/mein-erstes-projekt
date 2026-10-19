import React from "react";
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";

// Folge 01 „Ich sage es – es passiert“: ein Befehl, ein Effekt. Video mit Effekten kommt aus sag.py (24 fps),
// hier nur Texte, Zähler, Abschluss und Ton.
export const SAG_TOTAL = 448;
const RED = "#e8344d";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const pop = Easing.bezier(0.34, 1.56, 0.64, 1);
const fontFace = `
@font-face{font-family:'Pop';src:url('${staticFile("pop600.woff2")}') format('woff2');font-weight:600}
@font-face{font-family:'Pop';src:url('${staticFile("pop900.woff2")}') format('woff2');font-weight:900}
@font-face{font-family:'PF';src:url('${staticFile("pf700i.woff2")}') format('woff2');font-weight:700;font-style:italic}`;
const sh = "0 3px 14px rgba(0,0,0,.55)";
const glass: React.CSSProperties = {background: "rgba(20,20,20,.38)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
  border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 34};

// Befehle: Text, Start, Ende, Nummer
const CMDS: [string, number, number, number][] = [
  ["„Ich verschwinde.“", 55, 125, 1],
  ["„Schnipp. Neuer Ort.“", 159, 205, 2],
  ["„Ich bin überall.“", 209, 268, 3],
  ["„Stopp.“", 274, 340, 4],
];

const Befehl: React.FC<{t: string; a: number; b: number}> = ({t, a, b}) => {
  const fr = useCurrentFrame();
  const s = interpolate(fr, [a, a + 9], [0.6, 1], {...C, easing: pop});
  const o = interpolate(fr, [a, a + 5, b - 6, b], [0, 1, 1, 0], C);
  const words = t.split(" ");
  return (
    <div style={{position: "absolute", left: 90, right: 90, top: 1330, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${s})`}}>
      <div style={{...glass, padding: "26px 40px", display: "flex", alignItems: "center", gap: 22}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: RED, boxShadow: `0 0 14px ${RED}`, opacity: Math.floor(fr / 6) % 2 ? 1 : 0.35}} />
        <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 62, color: "white", textShadow: sh, letterSpacing: -1}}>
          {words.map((w, i) => (
            <span key={i} style={{opacity: interpolate(fr, [a + i * 5, a + i * 5 + 4], [0.25, 1], C)}}>{w} </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Sag: React.FC = () => {
  const fr = useCurrentFrame();
  const cur = CMDS.find(([, a, b]) => fr >= a - 4 && fr < b + 20);
  const titleO = interpolate(fr, [0, 6, 46, 54], [0, 1, 1, 0], C);
  const endA = 346;
  const e1 = interpolate(fr, [endA, endA + 10], [0, 1], {...C, easing: pop});
  const e2 = interpolate(fr, [endA + 30, endA + 40], [0, 1], {...C, easing: pop});
  const cta = interpolate(fr, [endA + 58, endA + 68], [0, 1], {...C, easing: pop});
  const typed = "CLAUDE".slice(0, Math.max(0, Math.floor((fr - endA - 70) / 3)));
  return (
    <AbsoluteFill style={{background: "black"}}>
      <style>{fontFace}</style>
      <OffthreadVideo src={staticFile("sag_fx.mp4")} style={{width: 1080, height: 1920}} muted />
      <Audio src={staticFile("sag_sfx.wav")} />

      {/* Serien-Kopf */}
      <div style={{position: "absolute", left: 90, top: 250, display: "flex", gap: 14, opacity: interpolate(fr, [0, 8], [0, 1], C)}}>
        <div style={{...glass, borderRadius: 22, padding: "10px 22px", fontFamily: "Pop", fontWeight: 900, fontSize: 30, color: "white", letterSpacing: 2}}>FOLGE 01</div>
        {cur && fr >= 55 && (
          <div style={{...glass, borderRadius: 22, padding: "10px 22px", fontFamily: "Pop", fontWeight: 600, fontSize: 30, color: "white"}}>
            Befehl {cur[3]} von 4
          </div>
        )}
      </div>

      {/* Titel */}
      <div style={{position: "absolute", left: 90, right: 90, top: 1250, textAlign: "center", opacity: titleO,
        transform: `translateY(${interpolate(fr, [0, 10], [30, 0], {...C, easing: pop})}px)`}}>
        <div style={{fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 92, color: "white", textShadow: sh, lineHeight: 1.05}}>Ich sage es –</div>
        <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 88, color: "white", textShadow: sh, letterSpacing: -2}}>
          und es <span style={{color: RED}}>passiert.</span>
        </div>
      </div>

      {CMDS.map(([t, a, b]) => <Befehl key={a} t={t} a={a} b={b} />)}

      {/* Abschluss */}
      {fr >= endA && (
        <div style={{position: "absolute", left: 90, right: 90, top: 1180, textAlign: "center"}}>
          <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 70, color: "white", textShadow: sh, letterSpacing: -1, opacity: e1, transform: `scale(${0.8 + 0.2 * e1})`}}>
            Das alles hat <span style={{color: "#f0a07a"}}>Claude</span> gebaut.
          </div>
          <div style={{fontFamily: "PF", fontStyle: "italic", fontWeight: 700, fontSize: 56, color: "white", textShadow: sh, marginTop: 14, opacity: e2}}>
            Ich habe nur gesagt, was ich will.
          </div>
          <div style={{...glass, marginTop: 40, padding: "22px 30px", display: "flex", alignItems: "center", gap: 20, opacity: cta, transform: `translateY(${(1 - cta) * 40}px)`, textAlign: "left"}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: "linear-gradient(135deg,#f0a07a,#e8344d)"}} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: "Pop", fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,.75)"}}>Schreib in die Kommentare</div>
              <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 52, color: "white"}}>
                {typed}<span style={{opacity: Math.floor(fr / 8) % 2}}>|</span>
              </div>
            </div>
            <div style={{fontFamily: "Pop", fontWeight: 900, fontSize: 30, color: RED}}>Senden</div>
          </div>
        </div>
      )}

      {/* Kennzeichnung */}
      <div style={{position: "absolute", left: 40, bottom: 40, fontFamily: "Pop", fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,.85)", textShadow: sh}}>KI-generiert</div>
    </AbsoluteFill>
  );
};
