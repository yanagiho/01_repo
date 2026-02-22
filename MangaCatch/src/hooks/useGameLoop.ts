import { useState, useEffect, useRef, useCallback } from 'react';
import type { FallingItem } from '../types/game';
import { getEnabledCharacters } from '../constants/master';

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
        if (scene === 'GAME') resetGame();
    }, [scene, resetGame]);

    useEffect(() => {
        if (scene !== 'GAME') return;

        const interval = setInterval(() => {
            setTimer((t) => Math.max(0, t - 0.016));

            const m = Math.max(0.7, Math.min(2.0, speedMultiplier || 1.0));
            laneTimers.current = laneTimers.current.map((lt) => Math.max(0, lt - 1 * m));

            // spawn（enabledのみ）
            if (Math.random() < 0.12 * m) {
                const laneIndex = Math.floor(Math.random() * 5);
                if (laneTimers.current[laneIndex] <= 0) {
                    const pool = getEnabledCharacters();
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

                    laneTimers.current[laneIndex] = 45 / m;
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
                            Math.abs(newX - playerX) < 110;

                        if (hit) {
                            setScore((s) => s + item.char.score);
                            catchCount.current[item.char.id] = (catchCount.current[item.char.id] || 0) + 1;

                            setIsHit(true);
                            setTimeout(() => setIsHit(false), 100);

                            onCatch(newX, newY + 50);
                            return null;
                        }

                        return { ...item, y: newY, x: newX, time: newTime };
                    })
                    .filter((i): i is FallingItem => i !== null && i.y < window.innerHeight + 200)
            );
        }, 16);

        return () => clearInterval(interval);
    }, [scene, playerX, speedMultiplier, onCatch]);

    return { items, score, timer, isHit, catchCount, resetGame };
};