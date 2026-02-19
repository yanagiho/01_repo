// src/game/scenes.ts
// 修正: ここに 'type' を追加しました
import { CHARACTER_MASTER, getCharacterData, type CharacterData } from '../constants/master';

export type SceneType =
    | 'BOOT' | 'TITLE' | 'TUTORIAL' | 'GAME' | 'RESULT' | 'RECOMMEND' | 'PHOTO' | 'RANKING';

const SCENE_DURATIONS: Partial<Record<SceneType, number>> = {
    BOOT: 1,
    TUTORIAL: 5,
    GAME: 30,      // 30秒プレイ
    RESULT: 5,     // リザルト表示
    RECOMMEND: 6,  // 推薦画面
    PHOTO: 10,     // 撮影タイム
    RANKING: 8     // ランキング
};

export class SceneManager {
    public currentScene: SceneType = 'BOOT';
    public score: number = 0;
    public stateTimer: number = 0;

    // 取得履歴 { "chara_001": 5, "chara_002": 1 ... }
    public catchCounts: Record<string, number> = {};

    // 今回のベストキャラ（推薦用）
    public bestCharacter: CharacterData | null = null;

    public constructor() {
        this.reset();
    }

    public reset() {
        this.currentScene = 'BOOT';
        this.score = 0;
        this.stateTimer = 0;
        this.catchCounts = {};
        this.bestCharacter = null;
    }

    public triggerStart() {
        if (this.currentScene === 'TITLE') {
            this.transitionTo('TUTORIAL');
        }
    }

    // スコア加算
    public addScore(points: number) {
        this.score += points;
    }

    // キャッチ記録
    public recordCatch(charId: string) {
        if (!this.catchCounts[charId]) {
            this.catchCounts[charId] = 0;
        }
        this.catchCounts[charId]++;
    }

    public update(deltaTime: number) {
        this.stateTimer += deltaTime;
        const duration = SCENE_DURATIONS[this.currentScene];
        if (duration && this.stateTimer >= duration) {
            this.nextScene();
        }
    }

    private nextScene() {
        switch (this.currentScene) {
            case 'BOOT': this.transitionTo('TITLE'); break;
            case 'TITLE': break;
            case 'TUTORIAL': this.transitionTo('GAME'); break;
            case 'GAME':
                this.calculateBestCharacter(); // ゲーム終了時に集計
                this.transitionTo('RESULT');
                break;
            case 'RESULT': this.transitionTo('RECOMMEND'); break;
            case 'RECOMMEND': this.transitionTo('PHOTO'); break;
            case 'PHOTO':
                this.saveRanking(); // 撮影終了後にランキング保存
                this.transitionTo('RANKING');
                break;
            case 'RANKING': this.transitionTo('TITLE'); break;
            default: this.transitionTo('TITLE'); break;
        }
    }

    private transitionTo(next: SceneType) {
        this.currentScene = next;
        this.stateTimer = 0;

        if (next === 'GAME') {
            this.score = 0;
            this.catchCounts = {};
            this.bestCharacter = null;
        }
        console.log(`Scene: ${next}`);
    }

    // 一番多く取ったキャラを計算
    private calculateBestCharacter() {
        let maxCount = -1;
        let bestId = "";

        // 集計
        Object.keys(this.catchCounts).forEach(id => {
            if (this.catchCounts[id] > maxCount) {
                maxCount = this.catchCounts[id];
                bestId = id;
            }
        });

        // 0個の場合はランダムに1人選出（エラー回避）
        if (bestId === "") {
            bestId = CHARACTER_MASTER[Math.floor(Math.random() * CHARACTER_MASTER.length)].id;
        }

        this.bestCharacter = getCharacterData(bestId) || null;
    }

    // ランキング保存（簡易localStorage版）
    private saveRanking() {
        // 日付キーを作成（日次リセット用）
        const today = new Date().toLocaleDateString();
        const key = `mangacatch_ranking_${today}`;

        const rawData = localStorage.getItem(key);
        let ranking: number[] = rawData ? JSON.parse(rawData) : [];

        ranking.push(this.score);
        // 降順ソート
        ranking.sort((a, b) => b - a);
        // Top30のみ保持
        ranking = ranking.slice(0, 30);

        localStorage.setItem(key, JSON.stringify(ranking));
    }
}