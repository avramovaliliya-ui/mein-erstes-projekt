# Remotion-Vorlagen für @liliyaavramova.ki

Animierte Folien, Reels und Storys, gebaut mit Remotion (kostenlos für Einzelpersonen).
Hier liegt nur der Code. Bilder (public/) und Schriften werden beim Bauen eingesetzt und liegen NICHT hier.

- `Folie1.tsx` – Karussell-Folie: großes Wort hinter dem Kopf, Lupen-Kärtchen (Auge, Lippen, Haut), Schreibmaschinen-Text
- `Katalog.tsx` – 8 Effekte: Wort-für-Wort-Untertitel, Vorher/Nachher-Schieber, Fotokarten fächern, Wörter knallen rein, Zoom durchs Auge, Kreis & Pfeil zeichnen, Zahl zählt hoch, Chat-Blasen
- `Story.tsx` – 10 Story-Effekte (9:16): Emoji-Regen, Umfrage-Look, Doppelbelichtung, Ich & KI-Ich, 3D-Tiefe, 3D-Kippen, Wisch-Übergang, Vertigo-Zoom, Textmarker, Countdown
- `EffektMuster.tsx` – 3 Effekte mit Ausschnitt (cutout.png): Wort hinter dir, Buchstaben kreisen um dich (vorne/hinten), Aus dem Bild treten. Schriften als woff2 in public/ (pop600, pop900, pf700i)
- `KuecheReel.tsx` – fertiges 30-s-Reel auf Originalvideo (in.mp4): Hook, CapCut hinter ihr durchgestrichen, Zähler 20 Minuten, Chat-Blase, Ring aus Text, aus dem Handy steigen, Sticker-Ausschnitt mit Katze, Kommentar-Blase, Karaoke-Untertitel (kueche-words.json). Ausschnitte als public/cut/cNNNN.png (rembg pro Videobild)
- `Ring3D.tsx` – echter 3D-Text-Zylinder (3 Reihen, vorne/hinten getrennt für den Ausschnitt)
- `Reel2.tsx` – Küchen-Reel v2: sie redet ungestört, Effekte als Einschübe (Chat, 3D-Ring, aus dem Handy, Untertitel, Sticker, Kommentar). Falsche Wörter durch ElevenLabs-Stimme „Liliya DE“ ersetzt (public/tts4.wav), immer unter einem Einschub
- `Podcast.tsx` – Podcast-Vorlage nach ihrer Regel vom 18.10.: NUR Untertitel (Playfair 600 weiss, kommend grau, max. 4 Wörter, gleichmässig verteilt, unter dem Kinn/über dem Anhänger), Stillstände raus (glattes Durchsprechen), jeder Schnitt wechselt leicht 1,0 ↔ 1,04, „KI-GENERIERT“ klein unten links
- `Reaktion.tsx` – Reaktions-Format: oben Schnitt-Chaos / Chat / Effekt, unten sie redend; Effekte über den ganzen Bildschirm (public: kueche.mp4, reel2.mp4, muster.mp4)
- `Scroll.tsx` – „Gesicht oben, Handy scrollt“: kleine Karte mit ihr oben, Schritt-Wort, Handy mit Claude-Chat (Upload → Satz → „Mach ich.“ → Video), Ergebnis gross
- `Serie.tsx` – Serien-Muster „Kann Claude diesen Effekt nachbauen?“ nach ihren Vorbildern: sie redet vollformatig, Pille oben, „claude“ hinter dem Kopf (cut/), schräge schwebende Karten, Chat-Zeile, Untertitel klein + Schlüsselwort riesig gold, ROH/FERTIG-Karten
- `Serie2.tsx` – Folge 01 „OHNE KAMERA“, Effekte 1:1 nach ihren zwei Vorbildern (Kreator: Creme-Box, claude hinter Kopf, Handy-Karten, Chat-Feld, REC/FINAL EDIT, Video-Wand, Kommentar→Antwort; Anastasia: Hook-Collage mit Herzen, Wörter um den Kopf, FOLGE 01 + Profil-Karte, „kommentiere“, nächste Folge). Falsch gesprochene Namen über tts4.wav
- `Neu.tsx` – 10 neue Effekte: KI-Scanner (Gesichts-Tracking), Neon-Umriss (aus Ausschnitt), Karten wischen, Glas-Untertitel, Glas zerspringt, Glas-Handy folgt dem Finger (MediaPipe-Hand-Tracking → track.json), Streifen-Übergang, Lade-Balken, Instagram-Hinweise + Herzen, Kalender-Blatt

Bauen: `npm i` → Bilder in `public/` legen → `npx remotion render src/index.ts <Name> out.mp4`
