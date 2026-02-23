// MangaCatch/src/hooks/useGameLoop.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { FallingItem } from "../types/game";
import { getEnabledCharacters, type CharacterData } from "../constants/master";

function pickWeighted(pool: CharacterData[]): CharacterData {
    const total = pool.reduce((s, c) => s + (c.weight || 1), 0);
    let r = Math.random() * total;
    for (const c of pool) {
        r -= c.weight || 1;
        if (r <= 0) return c;
    }
    return pool[pool.length - 1];
}

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

export const useGameLoop = (
    scene: string,
    playerX: number,
    speedMultiplier: number,
    onCatchFx: (x: number, y: number) => void
) => {
    const [items, setItems] = useState<FallingItem[]>([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(30);
    const [isHit, setIsHit] = useState(false);

    const catchCount = useRef<Record<string, number>>({});
    const nextId = useRef(0);
    const laneTimers = useRef<number[]>([0, 0, 0, 0, 0]);

    // ★propsで変わる値はrefへ（interval安定化）
    const playerXRef = useRef(playerX);
    const speedRef = useRef(speedMultiplier);
    const onCatchRef = useRef(onCatchFx);

    useEffect(() => {
        playerXRef.current = playerX;
    }, [playerX]);

    useEffect(() => {
        speedRef.current = speedMultiplier;
    }, [speedMultiplier]);

    useEffect(() => {
        onCatchRef.current = onCatchFx;
    }, [onCatchFx]);

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
        if (scene !== "GAME") return;

        resetGame();

        const interval = window.setInterval(() => {
            const m = Math.max(0.7, Math.min(2.0, speedRef.current || 1.0));

            // timer
            setTimer((t) => Math.max(0, t - 0.016));

            // lane cooldown
            laneTimers.current = laneTimers.current.map((lt) => Math.max(0, lt - 1 * m));

            // spawn
            if (Math.random() < 0.12 * m) {
                const lane = Math.floor(Math.random() * 5);
                if (laneTimers.current[lane] <= 0) {
                    const pool = getEnabledCharacters();
                    const char = pickWeighted(pool);

                    // ★揺れのバリエーションを大きく（幅も速度も個体差）
                    const swayAmp = rand(18, 160) * (Math.random() < 0.25 ? 1.35 : 1.0); // たまに大きく
                    const swaySpeed = rand(1.2, 4.2);
                    const fallSpeed = rand(6.8, 9.6);

                    setItems((prev) => [
                        ...prev,
                        {
                            id: nextId.current++,
                            baseX: (window.innerWidth / 5) * lane + window.innerWidth / 10,
                            x: 0,
                            y: -250,
                            char,
                            time: 0,
                            swaySpeed,
                            swayAmp,
                            speed: fallSpeed,
                        },
                    ]);

                    laneTimers.current[lane] = 45 / m;
                }
            }

            // move + hit
            setItems((prev) =>
                prev
                    .map((item) => {
                        const newTime = item.time + 0.016;
                        const newY = item.y + item.speed * m;
                        const newX = item.baseX + Math.sin(newTime * item.swaySpeed) * item.swayAmp;

                        const basketY = window.innerHeight - 80;
                        const hit =
                            newY > basketY - 80 &&
                            newY < basketY + 20 &&
                            Math.abs(newX - playerXRef.current) < 110;

                        if (hit) {
                            setScore((s) => s + item.char.score);
                            catchCount.current[item.char.id] = (catchCount.current[item.char.id] || 0) + 1;

                            setIsHit(true);
                            setTimeout(() => setIsHit(false), 100);

                            onCatchRef.current(newX, newY + 50);
                            return null;
                        }

                        return { ...item, y: newY, x: newX, time: newTime };
                    })
                    .filter((i): i is FallingItem => i !== null && i.y < window.innerHeight + 200)
            );
        }, 16);

        return () => window.clearInterval(interval);
    }, [scene, resetGame]);

    return { items, score, timer, isHit, catchCount, resetGame };
};