// MangaCatch/src/types/game.ts
import type { CharacterData } from "../constants/master";

export type SceneType =
    | "TITLE"
    | "TUTORIAL_VIDEO"
    | "GAME"
    | "RESULT"
    | "RECOMMEND"
    | "PHOTO"
    | "RANKING";

export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
}

export interface FallingItem {
    id: number;
    baseX: number;
    x: number;
    y: number;
    char: CharacterData;
    time: number;
    swaySpeed: number;
    swayAmp: number;
    speed: number;
}

export interface RankingEntry {
    score: number;
    bestCharId: string;
    achieved_at: number;
}