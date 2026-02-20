/**
 * MangaCatch Core Type Definitions (based on spec v1.3)
 */

export type SceneType =
    | 'TITLE'
    | 'TUTORIAL_VIDEO'
    | 'COUNTDOWN'
    | 'PLAY'
    | 'RESULT'
    | 'RECOMMEND'
    | 'PHOTO_TIME'
    | 'DAILY_RANKING';

export type RarityTier = 'common' | 'rare' | 'super_rare';

export interface RarityInfo {
    tier: RarityTier;
    rarity_point: number;
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
    rarity_tier: RarityTier;
    rarity_point: number;
    weight: number;
    recommend_text: string;
}

export interface OSCPlayerSignal {
    x: number; // 0.0 - 1.0
    y: number; // 0.0 - 1.0
    id: number; // 1 - 3
}

export interface OSCPayload {
    frame: number;
    players: OSCPlayerSignal[];
}

export interface PlayerState {
    id: number;
    active: boolean;
    x: number;
    y: number;
    score: number;
    lastDetectedTime: number;
}

export interface FallingCharacter {
    id: string;
    type_id: string;
    x: number;
    y: number;
    speed: number;
    wobbleOffset: number;
    spawnTime: number;
}

export interface RankingEntry {
    total_score: number;
    rarity_sum: number;
    achieved_at: number; // timestamp
}

import type { CharacterData } from '../constants/master';

export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    color: string;
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
