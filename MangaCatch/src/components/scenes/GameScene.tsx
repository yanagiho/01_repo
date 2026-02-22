import React, { useEffect } from "react";
import { useGameLoop } from "../../hooks/useGameLoop";
import { CharacterImage } from "../CharacterImage";

export const GameScene: React.FC<{
    playerX: number;
    speedMultiplier: number;
    playerCount: number;
    onEnd: (score: number, counts: Record<string, number>) => void;
    onCreateParticles: (x: number, y: number) => void;
}> = ({ playerX, speedMultiplier, playerCount, onEnd, onCreateParticles }) => {
    const { items, score, timer, isHit, catchCount } = useGameLoop(
        "GAME",
        playerX,
        speedMultiplier,
        onCreateParticles
    );

    useEffect(() => {
        if (timer <= 0) onEnd(score, catchCount.current);
    }, [timer, score, onEnd, catchCount]);

    const basketW = 220;
    const basketH = 90;
    const basketY = window.innerHeight - 80;

    return (
        <div style={{ position: "absolute", inset: 0 }}>
            {items.map((item) => (
                <div
                    key={item.id}
                    style={{ position: "absolute", left: item.x, top: item.y, transform: "translate(-50%,-50%)" }}
                >
                    <CharacterImage
                        char={item.char}
                        style={{ width: 170, height: 170, objectFit: "contain", filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.6))" }}
                    />
                    <div style={{ marginTop: 6, fontSize: 12, color: "#cfcfcf", textAlign: "center", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>
                        {item.char.artist} / {item.char.name}
                    </div>
                </div>
            ))}

            <div
                style={{
                    position: "absolute",
                    left: playerX,
                    top: basketY,
                    width: basketW,
                    height: basketH,
                    transform: "translate(-50%,-50%)",
                    borderRadius: 18,
                    border: "3px solid rgba(0,238,187,0.9)",
                    background: "rgba(0,0,0,0.25)",
                    boxShadow: isHit ? "0 0 35px rgba(0,238,187,0.9)" : "0 0 10px rgba(0,0,0,0.4)",
                }}
            />

            <div style={{ position: "absolute", left: 20, top: 16, fontFamily: "monospace", fontSize: 16, color: "#00eebb" }}>
                <div>SCORE: {score}</div>
                <div>TIME: {Math.max(0, timer).toFixed(1)}</div>
                <div>PLAYERS: {playerCount} / SPEED x{speedMultiplier.toFixed(2)}</div>
            </div>
        </div>
    );
};