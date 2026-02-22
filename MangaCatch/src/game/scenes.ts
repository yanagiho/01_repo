import type { SceneType, RankingEntry } from "../types/game";
import { getCharacterById, getEnabledCharacters } from "../constants/master";

export type SceneType =
    | "TITLE"
    | "TUTORIAL_VIDEO"
    | "GAME"
    | "RESULT"
    | "RECOMMEND"
    | "PHOTO"
    | "RANKING";

const DURATIONS: Partial<Record<SceneType, number>> = {
    // TITLE は TitleScene 側で自動 start するのでここでは遷移しない（＝onStartで進む）
    RESULT: 4.0,
    RECOMMEND: 6.0,
    PHOTO: 10.0,
    RANKING: 8.0,
};

export class SceneManager {
    public currentScene: SceneType = "TITLE";
    public stateTimer = 0;

    public score = 0;
    public catchCounts: Record<string, number> = {};
    public bestCharId: string | null = null;

    public triggerStart() {
        if (this.currentScene === "TITLE") {
            this.transitionTo("TUTORIAL_VIDEO");
        }
    }

    public finishTutorialVideo() {
        if (this.currentScene === "TUTORIAL_VIDEO") {
            this.transitionTo("GAME");
        }
    }

    public finishGame(score: number, counts: Record<string, number>) {
        this.score = score;
        this.catchCounts = counts;
        this.bestCharId = this.calculateBestCharId();
        this.transitionTo("RESULT");
    }

    public update(dt: number) {
        this.stateTimer += dt;

        // GAME / TUTORIAL_VIDEO は外部トリガー（動画終了／ゲーム終了）で遷移
        if (this.currentScene === "GAME" || this.currentScene === "TUTORIAL_VIDEO") return;

        const dur = DURATIONS[this.currentScene];
        if (dur != null && this.stateTimer >= dur) {
            this.nextScene();
        }
    }

    private nextScene() {
        switch (this.currentScene) {
            case "RESULT":
                this.transitionTo("RECOMMEND");
                break;
            case "RECOMMEND":
                this.transitionTo("PHOTO");
                break;
            case "PHOTO":
                this.saveRanking();
                this.transitionTo("RANKING");
                break;
            case "RANKING":
                this.resetToTitle();
                break;
            default:
                break;
        }
    }

    private transitionTo(next: SceneType) {
        this.currentScene = next;
        this.stateTimer = 0;

        if (next === "GAME") {
            this.score = 0;
            this.catchCounts = {};
            this.bestCharId = null;
        }
    }

    private resetToTitle() {
        this.currentScene = "TITLE";
        this.stateTimer = 0;
        this.score = 0;
        this.catchCounts = {};
        this.bestCharId = null;
    }

    private calculateBestCharId(): string {
        let max = -1;
        let bestId = "";

        for (const [id, c] of Object.entries(this.catchCounts)) {
            if (c > max) {
                max = c;
                bestId = id;
            }
        }

        if (!bestId) {
            const pool = getEnabledCharacters();
            bestId = pool[Math.floor(Math.random() * pool.length)].id;
        }

        // 念のため存在確認
        if (!getCharacterById(bestId)) {
            const pool = getEnabledCharacters();
            bestId = pool[Math.floor(Math.random() * pool.length)].id;
        }

        return bestId;
    }

    private saveRanking() {
        const bestCharId = this.bestCharId ?? this.calculateBestCharId();

        const entry: RankingEntry = {
            score: this.score,
            bestCharId,
            achieved_at: Date.now(),
        };

        const key = `mangacatch_ranking_${new Date().toLocaleDateString()}`;
        const raw = localStorage.getItem(key);

        let list: RankingEntry[] = [];
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    list = parsed.map((x: any) => {
                        if (typeof x === "number") return { score: x, bestCharId, achieved_at: 0 };
                        if (typeof x?.score === "number" && typeof x?.bestCharId === "string") {
                            return { score: x.score, bestCharId: x.bestCharId, achieved_at: x.achieved_at ?? 0 };
                        }
                        return { score: 0, bestCharId, achieved_at: 0 };
                    });
                }
            } catch {
                list = [];
            }
        }

        list.push(entry);
        list.sort((a, b) => b.score - a.score);
        list = list.slice(0, 30);
        localStorage.setItem(key, JSON.stringify(list));
    }
}