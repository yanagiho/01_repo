import { useEffect, useMemo, useRef, useState } from "react";
import { TitleBackgroundVideo } from "../TitleBackgroundVideo";

type Props = { onStart: () => void };

function buildLogoCandidates(): string[] {
  const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "./";
  const norm = (s: string) => (s.endsWith("/") ? s : s + "/");
  const names = [
    "assets/ui/mangacatch_title_logo.png",
    "assets/ui/title_logo.png",
    "assets/title_logo.png",
    "assets/mangacatch_title_logo.png",
    "assets/ui/mangacatch_logo.png",
  ];
  const bases = [norm(baseUrl), "./", "", "../", "../../"];
  const out: string[] = [];
  for (const b of bases) for (const n of names) out.push(b + n);
  return Array.from(new Set(out));
}

const COPYRIGHT_JP = "© Springbless";

export const TitleScene = ({ onStart }: Props) => {
  const startedRef = useRef(false);

  const startOnce = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    onStart();
  };

  const logoCandidates = useMemo(() => buildLogoCandidates(), []);
  const [logoIdx, setLogoIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") startOnce();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      onPointerDown={startOnce}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        userSelect: "none",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes blinkStart {
          0% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          100% { opacity: 0.25; transform: translateY(0); }
        }
      `}</style>

      {/* 背景動画 */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <TitleBackgroundVideo />
      </div>

      {/* UI */}
      <div style={{ textAlign: "center", width: "min(900px, 92vw)", zIndex: 2 }}>
        <div style={{ display: "grid", placeItems: "center" }}>
          <img
            src={logoCandidates[logoIdx]}
            alt="MANGA Catch!"
            onError={() => {
              if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
            }}
            style={{
              width: "min(640px, 84vw)",
              height: "auto",
              opacity: 0.98,
              filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.55))",
            }}
            draggable={false}
          />
        </div>

        {/* TOUCH TO START を大きく */}
        <div
          style={{
            marginTop: 52,
            display: "inline-block",
            padding: "22px 64px",
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.28)",
            background: "rgba(0,0,0,0.28)",
            fontSize: 34, // ★大きく
            fontWeight: 900,
            letterSpacing: 2,
            animation: "blinkStart 1.1s ease-in-out infinite",
            boxShadow: "0 0 22px rgba(0,238,187,0.18)",
          }}
        >
          TOUCH TO START
        </div>

        {/* ★注意文（※クリック…）は削除 */}
      </div>

      {/* コピーライト */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          opacity: 0.75,
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        {COPYRIGHT_JP}
      </div>
    </div>
  );
};