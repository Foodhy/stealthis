import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TITLE = "Memories";
const PHOTOS = [
  { w: 2, h: 2, gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)", label: "Featured" },
  { w: 1, h: 1, gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)", label: "Travel" },
  { w: 1, h: 1, gradient: "linear-gradient(135deg, #10b981, #34d399)", label: "Nature" },
  { w: 1, h: 2, gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", label: "Portrait" },
  { w: 1, h: 1, gradient: "linear-gradient(135deg, #ef4444, #f87171)", label: "Food" },
  { w: 2, h: 1, gradient: "linear-gradient(135deg, #ec4899, #f472b6)", label: "Panorama" },
  { w: 1, h: 1, gradient: "linear-gradient(135deg, #14b8a6, #2dd4bf)", label: "Urban" },
  { w: 1, h: 1, gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)", label: "Art" },
];

const CELL = 120;
const GAP = 8;

// Manually position photos in a masonry-like grid
const POSITIONS = [
  { col: 0, row: 0 }, // 2x2 featured
  { col: 2, row: 0 }, // 1x1
  { col: 3, row: 0 }, // 1x1
  { col: 2, row: 1 }, // 1x2
  { col: 3, row: 1 }, // 1x1
  { col: 0, row: 2 }, // 2x1
  { col: 3, row: 2 }, // 1x1
  { col: 2, row: 2 }, // 1x1 (moved from col 3 to avoid overlap)
];

const PhotoCard: React.FC<{
  photo: (typeof PHOTOS)[number];
  pos: (typeof POSITIONS)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ photo, pos, index, frame, fps }) => {
  const delay = 15 + index * 8;
  const f = Math.max(0, frame - delay);
  const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 12, stiffness: 120 } });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotate = spring({
    frame: f,
    fps,
    from: -5 + index * 2,
    to: 0,
    config: { damping: 14, stiffness: 100 },
  });

  const x = pos.col * (CELL + GAP);
  const y = pos.row * (CELL + GAP);
  const w = photo.w * CELL + (photo.w - 1) * GAP;
  const h = photo.h * CELL + (photo.h - 1) * GAP;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 12,
        overflow: "hidden",
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: photo.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            fontSize: photo.w > 1 ? 20 : 14,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {photo.label}
        </span>
      </div>
    </div>
  );
};

export const PhotoCollage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 14, stiffness: 100 },
  });

  const totalW = 4 * CELL + 3 * GAP;
  const totalH = 3 * CELL + 2 * GAP;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 35,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 40,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: totalW,
          height: totalH,
          transform: "translate(-50%, -40%)",
        }}
      >
        {PHOTOS.map((photo, i) => (
          <PhotoCard key={i} photo={photo} pos={POSITIONS[i]} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PhotoCollage"
      component={PhotoCollage}
      durationInFrames={180}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
