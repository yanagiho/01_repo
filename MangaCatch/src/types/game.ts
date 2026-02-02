/**
 * MangaCatch Core Type Definitions (based on spec v1.3)
 */

/**
 * シーン定義
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

/**
 * レアリティ情報
 */
export type RarityTier = 'common' | 'rare' | 'super_rare';

export interface RarityInfo {
    tier: RarityTier;
    rarity_point: number;
}

/**
 * キャラクタ/アイテム定義 (manifest.json準拠)
 */
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
    // spec.yaml にあるスコアや重みなどの情報
    score: number;
    rarity_tier: RarityTier;
    rarity_point: number;
    weight: number;
    recommend_text: string;
}

/**
 * OSC ペイロード (10 float fixed length)
 * [frame, x1, y1, id1, x2, y2, id2, x3, y3, id3]
 */
export interface OSCPlayerSignal {
    x: number; // 0.0 - 1.0 (normalized)
    y: number; // 0.0 - 1.0 (normalized)
    id: number; // 1 - 3
}

export interface OSCPayload {
    frame: number;
    players: OSCPlayerSignal[];
}

/**
 * ゲーム内プレイヤ（リング）の状態
 */
export interface PlayerState {
    id: number; // 1, 2, or 3
    active: boolean;
    x: number; // Screen px
    y: number; // Screen px
    score: number;
    lastDetectedTime: number;
}

/**
 * 落下するキャラクタの個体情報
 */
export interface FallingCharacter {
    id: string; // unique instance id
    type_id: string;
    x: number;
    y: number;
    speed: number;
    wobbleOffset: number;
    spawnTime: number;
}

/**
 * ランキングエントリ
 */
export interface RankingEntry {
    total_score: number;
    rarity_sum: number;
    achieved_at: number; // timestamp
}
