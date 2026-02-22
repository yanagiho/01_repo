import type { CharacterData } from "../constants/master";

export type Scene =
    | "TITLE"
    | "TUTORIAL"
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
    life: number; // 0..1
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
    achieved_at: number;
    bestCharId: string;
}