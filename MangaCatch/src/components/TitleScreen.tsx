import React from "react";

export const TitleScene: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, letterSpacing: 2, color: "#00eebb" }}>MANGA Catch</div>
        <div style={{ marginTop: 12, opacity: 0.8 }}>マウスでカゴを動かしてキャラをキャッチ</div>
        <button
          onClick={onStart}
          style={{
            marginTop: 24,
            padding: "14px 22px",
            fontSize: 18,
            borderRadius: 12,
            border: "2px solid #00eebb",
            background: "transparent",
            color: "#00eebb",
            cursor: "pointer",
          }}
        >
          START
        </button>
      </div>
    </div>
  );
};