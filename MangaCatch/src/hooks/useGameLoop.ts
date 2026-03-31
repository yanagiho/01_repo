import { useEffect, useMemo, useRef, useState } from "react";
import { getEnabledCharacters } from "../constants/master";
import type { CharacterData } from "../constants/master";
import type { MutableRefObject } from "react";

export type FallingItem = {
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
    itemsRef: MutableRefObject<FallingItem[]>;
    isHitRef: MutableRefObject<boolean>;
    score: number;
    timer: number;
    isHit: boolean;
    catchCount: MutableRefObject<Record<string, number>>;
    scoreRef: MutableRefObject<number>;
    playerXs: number[];
};

const GAME_TIME_SEC = 30;
const CHAR_SIZE = 255;
const CATCH_RADIUS = 220;
const PLAYER_Y_OFFSET = 200;
const BASE_FALL_SPEED = 320;
const SPAWN_INTERVAL_MS = 444;

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
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(GAME_TIME_SEC);
    const [isHit, setIsHit] = useState(false);

    const catchCount = useRef<Record<string, number>>({});
    const itemsRef = useRef<FallingItem[]>([]);
    const isHitRef = useRef(false);
    const scoreRef = useRef(0);

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

            itemsRef.current = [];
            scoreRef.current = 0;
            isHitRef.current = false;
            setScore(0);
            setTimer(GAME_TIME_SEC);
            setIsHit(false);
            catchCount.current = {};
            lastRef.current = 0;
            spawnRef.current = 0;
            startedAtRef.current = 0;
            return;
        }

        itemsRef.current = [];
        scoreRef.current = 0;
        isHitRef.current = false;
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

                itemsRef.current = [it, ...itemsRef.current].slice(0, 16);
            }

            // フィジクス＋当たり判定（全プレイヤー）
            const survived: FallingItem[] = [];
            let addScore = 0;

            for (const it of itemsRef.current) {
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
                    addScore += it.char.score;
                    const id = (it.char as any).id as string;
                    catchCount.current[id] = (catchCount.current[id] || 0) + 1;
                    onCatchFxRef.current(nx, ny + CHAR_SIZE / 2);
                    isHitRef.current = true;
                    setIsHit(true);
                    if (hitTimerRef.current) window.clearTimeout(hitTimerRef.current);
                    hitTimerRef.current = window.setTimeout(() => {
                        isHitRef.current = false;
                        setIsHit(false);
                    }, 160);
                    continue;
                }

                survived.push({ ...it, x: nx, y: ny });
            }

            // itemsRefを更新（Canvas描画はGameScene側のRAFが直接参照する）
            itemsRef.current = survived;
            if (addScore > 0) {
                scoreRef.current += addScore;
                setScore(scoreRef.current);
            }

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

    return { itemsRef, isHitRef, score, timer, isHit, catchCount, scoreRef, playerXs };
}