import { useState, useEffect, useRef, useCallback } from 'react';
import type { FallingItem } from '../types/game';
import { CHARACTER_MASTER } from '../constants/master';

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
    const laneTimers = useRef([0, 0, 0, 0, 0]);

    // ゲーム開始時のリセット
    const resetGame = useCallback(() => {
        setItems([]);
        setScore(0);
        setTimer(30);
        setIsHit(false);
        catchCount.current = {};
        laneTimers.current = [0, 0, 0, 0, 0];
        nextId.current = 0;
    }, []);

    // シーンがGAMEになったらリセット
    useEffect(() => {
        if (scene === 'GAME') {
            resetGame();
        }
    }, [scene, resetGame]);

    // ゲームループ
    useEffect(() => {
        if (scene !== "GAME") return;

        const interval = setInterval(() => {
            // タイマー減算
            setTimer(t => Math.max(0, t - 0.016));

            // 倍率適用
            const currentMultiplier = speedMultiplier;

            // レーンタイマーの減算
            const tick = 1 * currentMultiplier;
            laneTimers.current = laneTimers.current.map(lt => Math.max(0, lt - tick));

            // スポーンロジック
            if (Math.random() < 0.12 * currentMultiplier) {
                const laneIndex = Math.floor(Math.random() * 5);
                if (laneTimers.current[laneIndex] <= 0) {
                    const char = CHARACTER_MASTER[Math.floor(Math.random() * CHARACTER_MASTER.length)];
                    setItems(prev => [...prev, {
                        id: nextId.current++,
                        baseX: (window.innerWidth / 5 * laneIndex) + (window.innerWidth / 10),
                        x: 0,
                        y: -250,
                        char,
                        time: 0,
                        swaySpeed: 2.2,
                        swayAmp: 50,
                        speed: 7.5
                    }]);
                    // クールダウン
                    laneTimers.current[laneIndex] = 45 / currentMultiplier;
                }
            }

            // 移動 & 当たり判定
            setItems(prev => prev.map(item => {
                const newTime = item.time + 0.016;
                const newY = item.y + (item.speed * currentMultiplier);
                const newX = item.baseX + Math.sin(newTime * item.swaySpeed) * item.swayAmp;
                const pY = window.innerHeight - 80;

                // 当たり判定
                if (newY > pY - 80 && newY < pY + 20 && Math.abs(newX - playerX) < 110) {
                    setScore(s => s + item.char.score);
                    catchCount.current[item.char.id] = (catchCount.current[item.char.id] || 0) + 1;
                    setIsHit(true);
                    setTimeout(() => setIsHit(false), 100);

                    // コールバック呼び出し (副作用)
                    onCatch(newX, newY + 50);

                    return null;
                }
                return { ...item, y: newY, x: newX, time: newTime };
            }).filter((i): i is FallingItem => i !== null && i.y < window.innerHeight + 150));

        }, 16);

        return () => clearInterval(interval);
    }, [scene, playerX, speedMultiplier, onCatch]);

    return { items, score, timer, isHit, catchCount, resetGame };
};
