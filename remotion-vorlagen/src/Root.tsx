import React from "react";
import {Composition} from "remotion";
import {Folie1} from "./Folie1";
import {Katalog} from "./Katalog";
import {Story} from "./Story";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Folie1" component={Folie1} durationInFrames={225} fps={30} width={1080} height={1350} />
    <Composition id="Katalog" component={Katalog} durationInFrames={8 * 96} fps={30} width={1080} height={1350} />
    <Composition id="Story" component={Story} durationInFrames={10 * 96} fps={30} width={1080} height={1920} />
  </>
);
