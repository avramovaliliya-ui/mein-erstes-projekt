# Remotion-Vorlagen für @liliyaavramova.ki

Animierte Folien, Reels und Storys, gebaut mit Remotion (kostenlos für Einzelpersonen).
Hier liegt nur der Code. Bilder (public/) und Schriften werden beim Bauen eingesetzt und liegen NICHT hier.

- `Folie1.tsx` – Karussell-Folie: großes Wort hinter dem Kopf, Lupen-Kärtchen (Auge, Lippen, Haut), Schreibmaschinen-Text
- `Katalog.tsx` – 8 Effekte: Wort-für-Wort-Untertitel, Vorher/Nachher-Schieber, Fotokarten fächern, Wörter knallen rein, Zoom durchs Auge, Kreis & Pfeil zeichnen, Zahl zählt hoch, Chat-Blasen
- `DreiSaetze.tsx` – Reel „3 Sätze, die ich mir anhören musste“: 3 Seedance-Clips + Hook, Satz-Karten, Schluss mit Frage. Bauen: `npx remotion render src/drei.ts DreiSaetze out.mp4`
- `Story.tsx` – 10 Story-Effekte (9:16): Emoji-Regen, Umfrage-Look, Doppelbelichtung, Ich & KI-Ich, 3D-Tiefe, 3D-Kippen, Wisch-Übergang, Vertigo-Zoom, Textmarker, Countdown

Bauen: `npm i` → Bilder in `public/` legen → `npx remotion render src/index.ts <Name> out.mp4`
