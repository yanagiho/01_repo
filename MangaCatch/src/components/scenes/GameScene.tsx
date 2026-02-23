// MangaCatch/src/components/scenes/GameScene.tsx
import React, { useEffect } from "react";
import { useGameLoop } from "../../hooks/useGameLoop";
import { CharacterImage } from "../CharacterImage";

export const GameScene: React.FC<{
    scene: string;
    playerX: number;
    speedMultiplier: number;
    playerCount: number;
    onEnd: (score: number, counts: Record<string, number>) => void;
    onCatchFx: (x: number, y: number) => void;
}> = ({ scene, playerX, speedMultiplier, playerCount, onEnd, onCatchFx }) => {
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
    const basketY = window.innerHeight - 80;

    // バーは画面幅の1/3
    const barW = Math.floor(window.innerWidth / 3);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            {/* 左上：小さめステータス */}
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: 16,
                    zIndex: 20,
                    fontFamily: "monospace",
                    color: "rgba(0,238,187,0.9)",
                    fontSize: 12,
                    opacity: 0.85,
                }}
            >
                PLAYERS: {playerCount} / SPEED x{speedMultiplier.toFixed(2)}
            </div>

            {/* ★右上：スコアを大きく */}
            <div
                style={{
                    position: "absolute",
                    right: 20,
                    top: 14,
                    zIndex: 20,
                    fontFamily: "monospace",
                    fontSize: 44,
                    fontWeight: 800,
                    color: "#00eebb",
                    textShadow: "0 3px 10px rgba(0,0,0,0.75)",
                    pointerEvents: "none",
                }}
            >
                {score}
            </div>

            {/* タイマーバー（上部中央：幅1/3） */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: 18,
                    width: barW,
                    height: 14,
                    borderRadius: 10,
                    border: "1px solid rgba(0,238,187,0.8)",
                    background: "rgba(0,0,0,0.35)",
                    zIndex: 20,
                }}
            >
                <div
                    style={{
                        width: `${ratio * 100}%`,
                        height: "100%",
                        borderRadius: 10,
                        background: "rgba(0,238,187,0.85)",
                        transition: "width 120ms linear",
                    }}
                />
            </div>

            {/* 残り時間：バーの下で大きく */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: 40,
                    fontFamily: "monospace",
                    fontSize: 34,
                    fontWeight: 800,
                    color: "#00eebb",
                    opacity: 0.95,
                    zIndex: 20,
                    textShadow: "0 3px 10px rgba(0,0,0,0.75)",
                    pointerEvents: "none",
                }}
            >
                {timer.toFixed(1)}
            </div>

            {/* 落下 */}
            {items.map((it) => (
                <CharacterImage
                    key={it.id}
                    char={it.char}
                    style={{
                        position: "absolute",
                        left: it.x,
                        top: it.y,
                        width: 170,
                        height: 170,
                        transform: "translate(-50%, -50%)",
                        objectFit: "contain",
                        filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.6))",
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* カゴ */}
            <div
                style={{
                    position: "absolute",
                    left: playerX,
                    top: basketY,
                    width: 220,
                    height: 90,
                    transform: "translate(-50%, -50%)",
                    borderRadius: 18,
                    border: "3px solid rgba(0,238,187,0.9)",
                    background: "rgba(0,0,0,0.25)",
                    boxShadow: isHit ? "0 0 35px rgba(0,238,187,0.9)" : "0 0 10px rgba(0,0,0,0.4)",
                    transition: "box-shadow 120ms linear",
                }}
            />
        </div>
    );
};