import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";

export const F_REMOTION_FONT = "Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif";
export const F_REMOTION_COLORS = {
  blue: "#1d95ff",
  green: "#42df82",
  red: "#ff626b",
  amber: "#f1b94d",
} as const;
const DEFAULT_ACCENT = F_REMOTION_COLORS.blue;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const OverlayShell: React.FC<{
  children: ReactNode;
  durationInFrames: number;
  name?: string;
  accentTint?: string;
  safeSide?: "left" | "right";
  gradientStrength?: number;
}> = ({
  children,
  durationInFrames,
  name = "Semantic overlay",
  accentTint = "rgba(29,149,255,0.22)",
  safeSide = "left",
  gradientStrength = 0.68,
}) => {
  const frame = useCurrentFrame();
  const direction = safeSide === "left" ? "90deg" : "270deg";

  return (
    <AbsoluteFill
      name={name}
      style={{
        opacity: interpolate(
          frame,
          [0, 18, durationInFrames - 26, durationInFrames - 1],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [EASE_OUT, Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          },
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${direction}, rgba(3,7,12,${gradientStrength}) 0%, rgba(3,7,12,${gradientStrength * 0.68}) 30%, rgba(3,7,12,0.12) 54%, transparent 78%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${direction}, ${accentTint} 0%, transparent 58%)`,
          mixBlendMode: "color",
          opacity: 0.55,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{
  children: ReactNode;
  start: number;
  end: number;
  fadeFrames?: number;
  name?: string;
}> = ({children, start, end, fadeFrames = 20, name = "Stage"}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        inset: 0,
        opacity: interpolate(
          frame,
          [start, start + fadeFrames, end - fadeFrames, end],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [EASE_OUT, Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          },
        ),
      }}
    >
      {children}
    </Interactive.Div>
  );
};

export const FadeMove: React.FC<{
  children: ReactNode;
  start: number;
  enterFrames?: number;
  from?: string;
  name?: string;
  style?: CSSProperties;
}> = ({
  children,
  start,
  enterFrames = 30,
  from = "-24px 10px",
  name = "Animated element",
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        ...style,
        opacity: interpolate(frame, [start, start + enterFrames * 0.8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        translate: interpolate(frame, [start, start + enterFrames], [from, "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        scale: interpolate(frame, [start, start + enterFrames], [0.975, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
          output: "perceptual-scale",
        }),
        transformOrigin: "left center",
      }}
    >
      {children}
    </Interactive.Div>
  );
};

export const SectionHeader: React.FC<{
  label?: string;
  index?: string;
  title: string;
  micro?: string;
  start?: number;
  accent?: string;
  name?: string;
  style?: CSSProperties;
}> = ({
  label,
  index,
  title,
  micro,
  start = 4,
  accent = DEFAULT_ACCENT,
  name = "Section header",
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left: "4%",
        top: "6%",
        paddingLeft: 25,
        fontFamily: F_REMOTION_FONT,
        ...style,
        opacity: interpolate(frame, [start, start + 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        translate: interpolate(frame, [start, start + 30], ["-20px 0px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 1,
          width: 4,
          height: interpolate(frame, [start, start + 22], [0, 56], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          }),
          borderRadius: 4,
          backgroundColor: accent,
        }}
      />
      {label || index ? (
        <div style={{color: accent, fontSize: 28, fontWeight: 900, letterSpacing: 5}}>
          {[label, index].filter(Boolean).join(" · ")}
        </div>
      ) : null}
      <div style={{marginTop: label || index ? 10 : 0, color: "white", fontSize: 29, fontWeight: 850}}>
        {title}
      </div>
      {micro ? (
        <div
          style={{
            marginTop: 20,
            color: "rgba(255,255,255,0.62)",
            fontSize: 17,
            fontWeight: 750,
            letterSpacing: 4,
          }}
        >
          {micro}
        </div>
      ) : null}
    </Interactive.Div>
  );
};

export const InfoPanel: React.FC<{
  children: ReactNode;
  start: number;
  accent?: string;
  name?: string;
  from?: string;
  style?: CSSProperties;
}> = ({
  children,
  start,
  accent = DEFAULT_ACCENT,
  name = "Information panel",
  from = "0px 20px",
  style,
}) => (
  <FadeMove start={start} from={from} name={name} style={{position: "absolute", ...style}}>
    <div
      style={{
        minHeight: 92,
        display: "flex",
        alignItems: "center",
        padding: "20px 24px",
        borderRadius: 14,
        border: `1px solid ${accent}88`,
        backgroundColor: "rgba(5,7,13,0.86)",
        boxShadow: "0 18px 46px rgba(0,0,0,0.24)",
        color: "white",
        fontFamily: F_REMOTION_FONT,
      }}
    >
      <div
        style={{
          width: 4,
          height: 56,
          flex: "0 0 auto",
          marginRight: 20,
          borderRadius: 4,
          backgroundColor: accent,
        }}
      />
      {children}
    </div>
  </FadeMove>
);

export const GrowLine: React.FC<{
  start: number;
  length: number;
  direction?: "vertical" | "horizontal";
  accent?: string;
  style?: CSSProperties;
}> = ({start, length, direction = "vertical", accent = DEFAULT_ACCENT, style}) => {
  const frame = useCurrentFrame();
  const amount = interpolate(frame, [start, start + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <div
      style={{
        position: "absolute",
        width: direction === "vertical" ? 3 : length * amount,
        height: direction === "vertical" ? length * amount : 3,
        borderRadius: 4,
        backgroundColor: accent,
        boxShadow: `0 0 12px ${accent}66`,
        ...style,
      }}
    />
  );
};
