/**
 * MangaCatch Constants (based on spec v1.3)
 */

export const SCREEN_WIDTH = 1920;
export const SCREEN_HEIGHT = 1080;

export const MAX_PLAYERS = 3;

// デフォルト設定値
export const DEFAULT_TIME_LIMIT_SEC = 30;
export const DEFAULT_SELECTION_ZONE_HEIGHT = 240;
export const DEFAULT_RING_RADIUS = 150; // 仕様に記載がないが一般的な値、config.jsonで調整可能
export const DEFAULT_SPAWN_INTERVAL_SEC = 0.60;
export const DEFAULT_FALL_SPEED_PX_PER_SEC = 600;

// OSC設定
export const OSC_ADDRESS = '/mangacatch/players';
export const OSC_PORT = 7000;

// 退出判定 (Spec: 1.5 seconds no detection)
export const PLAYER_LEAVE_TIMEOUT_MS = 1500;

// 参加確定までのフレーム数 (Spec: consecutive_frames_required: 2)
export const PLAYER_JOIN_FRAMES_REQUIRED = 2;

// シーン遷移（デフォルト秒数）
export const SCENE_DURATIONS: Record<string, number> = {
    TITLE: 0, // マニュアル/外部入力待ち
    TUTORIAL_VIDEO: 15, // 仮
    COUNTDOWN: 3,
    PLAY: 30,
    RESULT: 10,
    RECOMMEND: 10,
    PHOTO_TIME: 20,
    DAILY_RANKING: 15,
};

// レアリティ設定
export const RARITY_TIERS = {
    common: { tier: 1, rarity_point: 1 },
    rare: { tier: 2, rarity_point: 3 },
    super_rare: { tier: 3, rarity_point: 6 },
} as const;
