import { useEffect } from "react";
import { useGameLoop } from "../../hooks/useGameLoop";
import { CharacterImage } from "../CharacterImage";
import { CatcherImage } from "../CatcherImage";

export const GameScene: React.FC<{
    scene: string;
    playerX: number;
    speedMultiplier: number;
    playerCount: number;
    onEnd: (score: number, counts: Record<string, number>) => void;
    onCatchFx: (x: number, y: number) => void;
}> = ({ scene, playerX, speedMultiplier, onEnd, onCatchFx }) => {
    const { items, score, timer, isHit, catchCount } = useGameLoop(
        scene,
        playerX,
        speedMultiplier,
        onCatchFx
    );

    useEffect(() => {
        if (scene === "GAME" && timer <= 0) onEnd(score, catchCount.current);
    }, [scene, timer, score, onEnd, catchCount]);

    const total = 30;
    const ratio = Math.max(0, Math.min(1, timer / total));

    const catcherY = window.innerHeight - 80;

    // キャラ 1.5倍
    const CHAR_SIZE = 255;

    // ★光の輪（=カゴ画像を拡大表示）
    const RING_D = 620;

    // ★カゴ（同じ画像を通常サイズで表示）
    const BASKET_W = 280;
    const BASKET_H = 130;

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

            {/* 右上：スコア（装飾） */}
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

            {/* タイマーバー */}
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

            {/* 残り時間 */}
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
                {timer.toFixed(1)}
            </div>

            {/* 落下キャラ（上部欠け修正：最低yをクランプ） */}
            {items.map((it) => {
                const y = Math.max(it.y, CHAR_SIZE / 2 + 2);
                return (
                    <CharacterImage
                        key={it.id}
                        char={it.char}
                        style={{
                            position: "absolute",
                            left: it.x,
                            top: y,
                            width: CHAR_SIZE,
                            height: CHAR_SIZE,
                            transform: "translate(-50%, -50%)",
                            objectFit: "contain",
                            filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.62))",
                            pointerEvents: "none",
                            zIndex: 14,
                        }}
                    />
                );
            })}

            {/* ★光の輪（=カゴ画像の拡大表示） */}
            <CatcherImage
                style={{
                    position: "absolute",
                    left: playerX,
                    top: catcherY,
                    width: RING_D,
                    height: RING_D,
                    transform: "translate(-50%, -50%)",
                    objectFit: "contain",
                    pointerEvents: "none",
                    zIndex: 12,

                    // “輪”っぽく：少し透過＋光る
                    opacity: 0.85,
                    filter: isHit
                        ? "drop-shadow(0 0 34px rgba(255,255,255,0.75)) drop-shadow(0 0 64px rgba(0,238,187,0.60))"
                        : "drop-shadow(0 0 24px rgba(0,238,187,0.40))",
                }}
            />

            {/* ★カゴ（同じ画像を通常サイズで前面に） */}
            <CatcherImage
                style={{
                    position: "absolute",
                    left: playerX,
                    top: catcherY,
                    width: BASKET_W,
                    height: BASKET_H,
                    transform: "translate(-50%, -50%)",
                    objectFit: "contain",
                    pointerEvents: "none",
                    zIndex: 15,

                    // ヒット時だけ強めに光る
                    filter: isHit
                        ? "drop-shadow(0 0 26px rgba(0,238,187,0.95))"
                        : "drop-shadow(0 12px 14px rgba(0,0,0,0.55))",
                    transition: "filter 120ms linear",
                }}
            />
        </div>
    );
};