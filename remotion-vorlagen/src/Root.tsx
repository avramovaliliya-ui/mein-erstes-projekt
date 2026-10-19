import React from "react";
import {Composition} from "remotion";
import {Reaktion, TOTAL} from "./Reaktion";
import {Scroll, SCROLL_TOTAL} from "./Scroll";
import {Serie, SERIE_TOTAL} from "./Serie";
import {Serie2, SERIE2_TOTAL} from "./Serie2";
import {Neu, NEU_TOTAL} from "./Neu";
import {Sag, SAG_TOTAL} from "./Sag";
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Sag" component={Sag} durationInFrames={SAG_TOTAL} fps={24} width={1080} height={1920} />
  <Composition id="Neu" component={Neu} durationInFrames={NEU_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="Serie2" component={Serie2} durationInFrames={SERIE2_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="Serie" component={Serie} durationInFrames={SERIE_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="Scroll" component={Scroll} durationInFrames={SCROLL_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="Reaktion" component={Reaktion} durationInFrames={TOTAL} fps={30} width={1080} height={1920} /></>
);
