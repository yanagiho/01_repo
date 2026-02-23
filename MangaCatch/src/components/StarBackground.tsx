// MangaCatch/src/components/StarBackground.tsx
import React from "react";

export const StarBackground: React.FC = () => {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <style>{`
        @keyframes starScrollA { from { background-position: 0px 0px; } to { background-position: 0px 800px; } }
        @keyframes starScrollB { from { background-position: 0px 0px; } to { background-position: 0px 1400px; } }
      `}</style>

      {/* ベース（暗め宇宙） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 30%, #081018 0%, #000 60%)",
        }}
      />

      {/* 星層A（小粒） */}
      <div
        style={{
          position: "absolute",
          inset: -200,
          backgroundImage:
            "radial-gradient(circle at 10px 10px, rgba(255,255,255,0.55) 1px, rgba(0,0,0,0) 1.6px)",
          backgroundSize: "26px 26px",
          opacity: 0.55,
          animation: "starScrollA 18s linear infinite",
        }}
      />

      {/* 星層B（大粒） */}
      <div
        style={{
          position: "absolute",
          inset: -300,
          backgroundImage:
            "radial-gradient(circle at 16px 16px, rgba(255,255,255,0.7) 1.6px, rgba(0,0,0,0) 2.3px)",
          backgroundSize: "58px 58px",
          opacity: 0.35,
          animation: "starScrollB 30s linear infinite",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};