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

export interface CharacterManifestItem {
    type_id: string;
    character_name_ja: string;
    work_title_ja: string;
    artist_name_ja: string;
    character_name_en: string;
    work_title_en: string;
    artist_name_en: string;
    assets: {
        cover: {
            canonical: string;
            current: string;
        };
        character: {
            canonical: string;
            current: string;
            missing: boolean;
        };
    };
    score: number;
    rarity_tier: "common" | "uncommon" | "rare" | "super_rare";
    rarity_point: number;
    weight: number;
    recommend_text: string;
}