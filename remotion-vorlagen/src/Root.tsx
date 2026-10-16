import React from "react";
import {Composition} from "remotion";
import {Folie1} from "./Folie1";
import {Katalog} from "./Katalog";
import {Story} from "./Story";
import {TalkDemo} from "./Talk";
import {ReelBaukasten} from "./ReelBaukasten";
import {Buchstaben} from "./Buchstaben";
import {Schwarm} from "./Schwarm";
import {Magie} from "./Magie";
import {HandWord} from "./HandWord";
import {Loslassen} from "./Loslassen";
import {Puffy} from "./Puffy";
import {Brennen} from "./Brennen";
import {StoryB1, StoryB2, StoryB3, StoryB4} from "./StoryBaukasten";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Folie1" component={Folie1} durationInFrames={225} fps={30} width={1080} height={1350} />
    <Composition id="Katalog" component={Katalog} durationInFrames={8 * 96} fps={30} width={1080} height={1350} />
    <Composition id="ReelBaukasten" component={ReelBaukasten} durationInFrames={528} fps={30} width={1080} height={1920} />
    <Composition id="TalkDemo"component={TalkDemo} durationInFrames={393} fps={30} width={1080} height={1920} />
    <Composition id="Buchstaben" component={Buchstaben} durationInFrames={384} fps={30} width={1080} height={1920} />
    <Composition id="Schwarm" component={Schwarm} durationInFrames={630} fps={30} width={1080} height={1920} />
    <Composition id="Magie" component={Magie} durationInFrames={525} fps={30} width={1080} height={1920} />
    <Composition id="HandWord" component={HandWord} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="Loslassen" component={Loslassen} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="Puffy" component={Puffy} durationInFrames={225} fps={30} width={1080} height={1920} />
    <Composition id="Brennen" component={Brennen} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="StoryB1" component={StoryB1} durationInFrames={180} fps={30} width={1080} height={1920} />
    <Composition id="StoryB2" component={StoryB2} durationInFrames={180} fps={30} width={1080} height={1920} />
    <Composition id="StoryB3" component={StoryB3} durationInFrames={210} fps={30} width={1080} height={1920} />
    <Composition id="StoryB4" component={StoryB4} durationInFrames={210} fps={30} width={1080} height={1920} />
    <Composition id="Story"component={Story} durationInFrames={10 * 96} fps={30} width={1080} height={1920} />
  </>
);
