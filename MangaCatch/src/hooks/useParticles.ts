// useParticles: React stateを使わずrefベースで管理（パフォーマンス最適化）
// DOM divではなくParticleCanvasでcanvas描画するため、setStateによる
// Reactリレンダリングを完全に排除する
import { useCallback, useRef } from "react";
import type { Particle } from "../types/game";

const SMALL_COUNT = 18;
const LARGE_COUNT = 7;

export const useParticles = () => {
    const particlesRef = useRef<Particle[]>([]);
    let nextId = 0;

    const createParticles = useCallback((x: number, y: number) => {
        const burst: Particle[] = [];
        for (let i = 0; i < SMALL_COUNT; i++) {
            burst.push({
                id: nextId++,
                x, y,
                vx: (Math.random() - 0.5) * 760,
                vy: (Math.random() - 0.9) * 760,
                life: 1,
                size: 6 + Math.random() * 12,
            });
        }
        for (let i = 0; i < LARGE_COUNT; i++) {
            burst.push({
                id: nextId++,
                x, y,
                vx: (Math.random() - 0.5) * 540,
                vy: (Math.random() - 0.9) * 540,
                life: 1,
                size: 16 + Math.random() * 22,
            });
        }
        particlesRef.current = [...particlesRef.current, ...burst];
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { particlesRef, createParticles };
};
