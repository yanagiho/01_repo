import { useEffect } from "react";
import { useGameLoop } from "../../hooks/useGameLoop";
import * as CharMod from "../CharacterImage";
import * as CatcherMod from "../CatcherImage";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export const GameScene: React.FC<{
  scene: string;
  playerXs: number[];
  speedMultiplier: number;
  playerCount: number;
  onEnd: (score: number, counts: Record<string, number>) => void;
  onCatchFx: (x: number, y: number) => void;
}> = ({ scene, playerXs, speedMultiplier, onEnd, onCatchFx }) => {
  const CharacterImageComp = (CharMod as any).CharacterImage ?? (CharMod as any).default;
  const CatcherImageComp = (CatcherMod as any).CatcherImage ?? (CatcherMod as any).default;

  const { items, score, timer, isHit, catchCount } = useGameLoop(
    scene,
    playerXs,
    speedMultiplier,
    onCatchFx
  );

  useEffect(() => {
    if (scene === "GAME" && timer <= 0) onEnd(score, catchCount.current);
  }, [scene, timer, score, onEnd, catchCount]);

  const total = 30;
  const ratio = Math.max(0, Math.min(1, timer / total));

  const catcherY = window.innerHeight - 200;
  const CHAR_SIZE = 255;
  const BIG_CATCHER_D = 420;
  const barW = Math.floor(window.innerWidth / 3);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <style>{`
        @keyframes scorePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          right: 18,
          top: 12,
          zIndex: 30,
          fontFamily: "monospace",
          fontSize: 76,
          fontWeight: 900,
          color: "#00eebb",
          textShadow: "0 4px 16px rgba(0,0,0,0.85)",
          padding: "6px 14px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.28)",
          border: "2px solid rgba(0,238,187,0.35)",
          boxShadow: "0 0 26px rgba(0,238,187,0.18)",
          animation: isHit ? "scorePulse 260ms ease-in-out 1" : "none",
          pointerEvents: "none",
        }}
      >
        {score}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 18,
          width: barW,
          height: 18,
          borderRadius: 12,
          border: "2px solid rgba(0,238,187,0.8)",
          background: "rgba(0,0,0,0.35)",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            borderRadius: 12,
            background: "rgba(0,238,187,0.88)",
            transition: "width 120ms linear",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 44,
          fontFamily: "monospace",
          fontSize: 46,
          fontWeight: 900,
          color: "#00eebb",
          textShadow: "0 3px 12px rgba(0,0,0,0.85)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {Math.max(0, Math.ceil(timer))}
      </div>

      {items.map((it) => {
        const age = (performance.now() - it.bornAt) / 1000;
        const t = clamp(age / 0.22, 0, 1);
        const opacity = 0.15 + 0.85 * t;
        const scale = 0.92 + 0.08 * t;
        const y = Math.max(it.y, CHAR_SIZE / 2 + 2);

        return CharacterImageComp ? (
          <CharacterImageComp
            key={it.id}
            char={it.char}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: CHAR_SIZE,
              height: CHAR_SIZE,
              transform: `translate(${it.x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
              objectFit: "contain",
              opacity,
              filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.62))",
              pointerEvents: "none",
              zIndex: 14,
              willChange: "transform, opacity",
            }}
          />
        ) : null;
      })}

      {CatcherImageComp
        ? playerXs.map((px, i) => (
            <CatcherImageComp
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: BIG_CATCHER_D,
                height: BIG_CATCHER_D,
                transform: `translate(${px}px, ${catcherY}px) translate(-50%, -50%)`,
                objectFit: "contain",
                pointerEvents: "none",
                zIndex: 12,
                opacity: 0.92,
                willChange: "transform",
                filter: isHit
                  ? "drop-shadow(0 0 34px rgba(255,255,255,0.75)) drop-shadow(0 0 64px rgba(0,238,187,0.60))"
                  : "drop-shadow(0 0 24px rgba(0,238,187,0.40))",
              }}
            />
          ))
        : null}
    </div>
  );
};
