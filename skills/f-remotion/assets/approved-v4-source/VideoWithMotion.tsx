import {Video} from "@remotion/media";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {
  AiBlockedScene,
  EntryBarrierScene,
  LicenseScene,
  PaymentAccessScene,
  PhysicalBoundaryScene,
  VirtualPaymentScene,
} from "./MotionScenes";

export const MiniProgramPaymentVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "black"}}>
      <Video
        name="Original video and audio"
        src={staticFile("source.mp4")}
        durationInFrames={3099}
        objectFit="cover"
        style={{width: "100%", height: "100%"}}
      />

      <Sequence name="01 Payment access" durationInFrames={606}>
        <PaymentAccessScene />
      </Sequence>
      <Sequence name="02 Entry barrier" from={606} durationInFrames={450}>
        <EntryBarrierScene />
      </Sequence>
      <Sequence name="03 AI era payment block" from={1056} durationInFrames={572}>
        <AiBlockedScene />
      </Sequence>
      <Sequence name="04 Virtual payment" from={1628} durationInFrames={778}>
        <VirtualPaymentScene />
      </Sequence>
      <Sequence name="05 Physical goods boundary" from={2406} durationInFrames={460}>
        <PhysicalBoundaryScene />
      </Sequence>
      <Sequence name="06 License conclusion" from={2866} durationInFrames={233}>
        <LicenseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
