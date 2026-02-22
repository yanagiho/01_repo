import { useState, useEffect, useRef, useCallback } from "react";
import type { FallingItem } from "../types/game";
import { getEnabledCharacters, type CharacterData } from "../constants/master";

export const useGameLoop = (
    scene: string,
    playerX: number,
    speedMultiplier: number,
    onCatch: (x: number, y: number) => void
) => {
    const [items, setItems] = useState<FallingItem[]>([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(30);
    const [isHit, setIsHit] = useState(false);

    // キャッチカウント（リザルト集計用）
    const catchCount = useRef<Record<string, number>>({});

    const nextId = useRef(0);
    const laneTimers = useRef<number[]>([0, 0, 0, 0, 0]);

    const resetGame = useCallback(() => {
        setItems([]);
        setScore(0);
        setTimer(30);
        setIsHit(false);
        catchCount.current = {};
        laneTimers.current = [0, 0, 0, 0, 0];
        nextId.current = 0;
    }, []);

    useEffect(() => {
        if (scene === "GAME") resetGame();
    }, [scene, resetGame]);

    useEffect(() => {
        if (scene !== "GAME") return;

        const interval = setInterval(() => {
            // タイマー減算
            setTimer((t) => Math.max(0, t - 0.016));

            const currentMultiplier = speedMultiplier;

            // レーンタイマーの減算
            const tick = 1 * currentMultiplier;
            laneTimers.current = laneTimers.current.map((lt) => Math.max(0, lt - tick));

            // スポーン（enabledのみ）
            if (Math.random() < 0.12 * currentMultiplier) {
                const laneIndex = Math.floor(Math.random() * 5);
                if (laneTimers.current[laneIndex] <= 0) {
                    const pool: CharacterData[] = getEnabledCharacters();
                    const char = pool[Math.floor(Math.random() * pool.length)];

                    setItems((prev) => [
                        ...prev,
                        {
                            id: nextId.current++,
                            baseX: (window.innerWidth / 5) * laneIndex + window.innerWidth / 10,
                            x: 0,
                            y: -250,
                            char,
                            time: 0,
                            swaySpeed: 2.2,
                            swayAmp: 50,
                            speed: 7.5,
                        },
                    ]);

                    // クールダウン
                    laneTimers.current[laneIndex] = 45 / currentMultiplier;
                }
            }

            // 移動 & 当たり判定
            setItems((prev) =>
                prev
                    .map((item) => {
                        const newTime = item.time + 0.016;
                        const newY = item.y + item.speed * currentMultiplier;
                        const newX = item.baseX + Math.sin(newTime * item.swaySpeed) * item.swayAmp;
                        const pY = window.innerHeight - 80;

                        // 当たり判定
                        if (newY > pY - 80 && newY < pY + 20 && Math.abs(newX - playerX) < 110) {
                            setScore((s) => s + item.char.score);

                            const id = item.char.id;
                            catchCount.current[id] = (catchCount.current[id] || 0) + 1;

                            setIsHit(true);
                            setTimeout(() => setIsHit(false), 100);

                            onCatch(newX, newY + 50);
                            return null;
                        }

                        return { ...item, y: newY, x: newX, time: newTime };
                    })
                    .filter((i): i is FallingItem => i !== null && i.y < window.innerHeight + 150)
            );
        }, 16);

        return () => clearInterval(interval);
    }, [scene, playerX, speedMultiplier, onCatch]);

    return { items, score, timer, isHit, catchCount, resetGame };
};