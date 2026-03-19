import { useEffect, useMemo, useRef, useState } from "react";
import { getEnabledCharacters } from "../constants/master";
import type { CharacterData } from "../constants/master";
import type { MutableRefObject } from "react";

type FallingItem = {
    id: string;
    char: CharacterData;
    x: number;
    y: number;
    bornAt: number;
    swayAmp: number;
    swaySpd: number;
    swayPhase: number;
    baseX: number;
};

type UseGameLoopReturn = {
    items: FallingItem[];
    score: number;
    timer: number;
    isHit: boolean;
    catchCount: MutableRefObject<Record<string, number>>;
    playerXs: number[];
};

const GAME_TIME_SEC = 30;
const CHAR_SIZE = 255;
const CATCH_RADIUS = 220;
const PLAYER_Y_OFFSET = 200;
const BASE_FALL_SPEED = 320;
const SPAWN_INTERVAL_MS = 400;
// ReactのDOM更新を30fpsに制限（60fps setItemsはWindows低スペックで重すぎる）
const RENDER_INTERVAL_MS = 1000 / 30;

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}
function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

export function useGameLoop(
    scene: string,
    playerXs: number[],
    speedMultiplier: number,
    onCatchFx: (x: number, y: number) => void
): UseGameLoopReturn {
    const [items, setItems] = useState<FallingItem[]>([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(GAME_TIME_SEC);
    const [isHit, setIsHit] = useState(false);

    const catchCount = useRef<Record<string, number>>({});

    const playerXsRef = useRef(playerXs);
    useEffect(() => {
        playerXsRef.current = playerXs;
    }, [playerXs]);

    const speedRef = useRef(speedMultiplier);
    useEffect(() => {
        speedRef.current = speedMultiplier;
    }, [speedMultiplier]);

    const onCatchFxRef = useRef(onCatchFx);
    useEffect(() => {
        onCatchFxRef.current = onCatchFx;
    }, [onCatchFx]);

    const rafRef = useRef<number | null>(null);
    const lastRef = useRef<number>(0);
    const spawnRef = useRef<number>(0);
    const hitTimerRef = useRef<number | null>(null);
    const startedAtRef = useRef<number>(0);

    const pool = useMemo(() => getEnabledCharacters(), []);

    useEffect(() => {
        if (scene !== "GAME") {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;

            if (hitTimerRef.current) window.clearTimeout(hitTimerRef.current);
            hitTimerRef.current = null;

            setItems([]);
            setScore(0);
            setTimer(GAME_TIME_SEC);
            setIsHit(false);
            catchCount.current = {};
            lastRef.current = 0;
            spawnRef.current = 0;
            startedAtRef.current = 0;
            return;
        }

        setItems([]);
        setScore(0);
        setTimer(GAME_TIME_SEC);
        setIsHit(false);
        catchCount.current = {};

        const now0 = performance.now();
        lastRef.current = now0;
        startedAtRef.current = now0;
        spawnRef.current = 0;

        const step = (now: number) => {
            const prev = lastRef.current || now;
            const frameDt = now - prev;

            // 30fps cap: ReactのsetItems呼び出しを制限してDOM更新コストを削減
            if (frameDt < RENDER_INTERVAL_MS) {
                rafRef.current = requestAnimationFrame(step);
                return;
            }

            const rawDt = frameDt / 1000;
            const dt = Math.min(0.2, Math.max(0, rawDt));
            lastRef.current = now;

            const elapsed = (now - startedAtRef.current) / 1000;
            const remain = Math.max(0, GAME_TIME_SEC - elapsed);
            setTimer(remain);

            if (remain <= 0) {
                rafRef.current = null;
                return;
            }

            const w = window.innerWidth;
            const h = window.innerHeight;

            const playerY = h - PLAYER_Y_OFFSET;
            const pxs = playerXsRef.current;

            const sp = clamp(speedRef.current || 1, 0.4, 3.0);
            const vy = BASE_FALL_SPEED * sp;

            // スポーンとフィジクスを1回のsetItemsにバッチ化（パフォーマンス最適化）
            setItems((cur) => {
                let next = cur;

                // スポーン
                spawnRef.current += dt * 1000;
                if (spawnRef.current >= SPAWN_INTERVAL_MS && pool.length > 0) {
                    spawnRef.current = spawnRef.current % SPAWN_INTERVAL_MS;

                    const char = pool[Math.floor(Math.random() * pool.length)];
                    const margin = 40;
                    const baseX = rand(margin, w - margin);

                    const it: FallingItem = {
                        id: `${now}_${Math.random().toString(16).slice(2)}`,
                        char,
                        x: baseX,
                        y: -CHAR_SIZE / 2,
                        bornAt: now,
                        swayAmp: rand(30, 170),
                        swaySpd: rand(1.0, 3.0),
                        swayPhase: rand(0, Math.PI * 2),
                        baseX,
                    };

                    next = [it, ...cur].slice(0, 18);
                }

                // フィジクス＋当たり判定（全プレイヤー）
                const survived: FallingItem[] = [];
                let addScore = 0;

                for (const it of next) {
                    const age = (now - it.bornAt) / 1000;
                    const sway = Math.sin(it.swayPhase + age * it.swaySpd) * it.swayAmp;

                    const nx = clamp(it.baseX + sway, 20, w - 20);
                    const ny = it.y + vy * dt;

                    if (ny > h + CHAR_SIZE) continue;

                    let caught = false;
                    for (const px of pxs) {
                        const dist = Math.hypot(nx - px, ny - playerY);
                        if (dist <= CATCH_RADIUS) {
                            caught = true;
                            break;
                        }
                    }

                    if (caught) {
                        addScore += 10;
                        const id = (it.char as any).id as string;
                        catchCount.current[id] = (catchCount.current[id] || 0) + 1;
                        onCatchFxRef.current(nx, ny + CHAR_SIZE / 2);
                        setIsHit(true);
                        if (hitTimerRef.current) window.clearTimeout(hitTimerRef.current);
                        hitTimerRef.current = window.setTimeout(() => setIsHit(false), 160);
                        continue;
                    }

                    survived.push({ ...it, x: nx, y: ny });
                }

                if (addScore > 0) setScore((s) => s + addScore);
                return survived;
            });

            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;

            if (hitTimerRef.current) window.clearTimeout(hitTimerRef.current);
            hitTimerRef.current = null;
        };
    }, [scene, pool]);

    return { items, score, timer, isHit, catchCount, playerXs };
}