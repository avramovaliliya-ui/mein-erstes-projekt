import React from "react";
import {Composition, registerRoot} from "remotion";
import {DreiSaetze, DREI_DURATION} from "./DreiSaetze";

// own entry, so this reel renders on its own: npx remotion render src/drei.ts DreiSaetze out.mp4
const Root: React.FC = () => React.createElement(Composition, {id: "DreiSaetze", component: DreiSaetze, durationInFrames: DREI_DURATION, fps: 30, width: 1080, height: 1920});
registerRoot(Root);
