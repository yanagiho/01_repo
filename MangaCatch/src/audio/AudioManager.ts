// MangaCatch/src/audio/AudioManager.ts
type BgmKind = "ui" | "game";

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "./";
    return b.endsWith("/") ? b : b + "/";
}
function assetUrl(path: string): string {
    const p = path.replace(/^\//, "");
    if (typeof window !== "undefined" && window.location?.protocol === "file:") {
        return "./" + p;
    }
    return baseUrl() + p;
}

class AudioAsset {
    private idx = 0;
    private el: HTMLAudioElement;

    constructor(private candidates: string[], private loop: boolean, private volume: number) {
        this.el = new Audio();
        this.el.loop = loop;
        this.el.volume = volume;
        this.el.preload = "auto";
        this.setSrc(0);
        this.el.addEventListener("error", () => this.tryNext());
    }

    private setSrc(i: number) {
        this.idx = i;
        this.el.src = this.candidates[this.idx];
        this.el.load();
    }

    private tryNext() {
        if (this.idx + 1 < this.candidates.length) this.setSrc(this.idx + 1);
        else console.warn("[AudioAsset] failed all candidates:", this.candidates);
    }

    async play() {
        try {
            await this.el.play();
            return true;
        } catch {
            return false;
        }
    }

    pause() {
        this.el.pause();
    }

    stop() {
        this.el.pause();
        try { this.el.currentTime = 0; } catch { }
    }

    setVolume(v: number) {
        this.el.volume = v;
    }

    setMuted(m: boolean) {
        this.el.muted = m;
    }

    get element() {
        return this.el;
    }
}

export class AudioManager {
    private static _instance: AudioManager | null = null;
    static get instance(): AudioManager {
        if (!this._instance) this._instance = new AudioManager();
        return this._instance;
    }

    private unlocked = false;
    private needsUnmute = false;

    private bgmUi: AudioAsset;
    private bgmGame: AudioAsset;

    private seClickBase: HTMLAudioElement;
    private seCatchBase: HTMLAudioElement;

    private jingleEnd: AudioAsset;
    private currentBgm: BgmKind | null = null;

    private constructor() {
        const uiCandidates = Array.from(new Set([
            assetUrl("assets/audio/bgm_ui_loop.mp3"),
            "./assets/audio/bgm_ui_loop.mp3",
            "assets/audio/bgm_ui_loop.mp3",
        ]));
        const gameCandidates = Array.from(new Set([
            assetUrl("assets/audio/bgm_game_loop.mp3"),
            "./assets/audio/bgm_game_loop.mp3",
            "assets/audio/bgm_game_loop.mp3",
        ]));

        this.bgmUi = new AudioAsset(uiCandidates, true, 0.55);
        this.bgmGame = new AudioAsset(gameCandidates, true, 0.55);

        this.seClickBase = new Audio(assetUrl("assets/audio/se_click.wav"));
        this.seCatchBase = new Audio(assetUrl("assets/audio/se_catch.wav"));
        this.seClickBase.preload = "auto";
        this.seCatchBase.preload = "auto";
        this.seClickBase.volume = 0.8;
        this.seCatchBase.volume = 0.9;

        const jCandidates = Array.from(new Set([
            assetUrl("assets/audio/jingle_game_end.mp3"),
            "./assets/audio/jingle_game_end.mp3",
            "assets/audio/jingle_game_end.mp3",
        ]));
        this.jingleEnd = new AudioAsset(jCandidates, false, 0.85);
    }

    isUnlocked() {
        return this.unlocked;
    }

    // ★起動直後に呼ぶ：鳴れる環境では最初からBGMが鳴る
    // 鳴れない環境では、ミュートで先に再生 → 最初のクリックで音が出る
    async tryAutoplayUiBgm() {
        if (this.currentBgm) return;

        this.bgmUi.setMuted(false);
        const ok = await this.bgmUi.play();
        if (ok) {
            this.currentBgm = "ui";
            this.needsUnmute = false;
            return;
        }

        // だめなら “ミュートなら通る” ケースを狙う
        this.bgmUi.setMuted(true);
        const okMuted = await this.bgmUi.play();
        if (okMuted) {
            this.currentBgm = "ui";
            this.needsUnmute = true; // unlockで解除
        }
    }

    // タイトルクリック（ユーザー操作）内で呼ぶ
    async unlock() {
        if (this.unlocked) {
            // 既にunlock済みでも、必要ならミュート解除だけする
            if (this.needsUnmute) {
                this.bgmUi.setMuted(false);
                this.needsUnmute = false;
            }
            return;
        }
        this.unlocked = true;

        // 無音再生でアンロック（環境によって必要）
        try {
            const a = new Audio();
            a.src =
                "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
            await a.play().catch(() => { });
            a.pause();
        } catch { }

        // SE先読み
        this.seClickBase.load();
        this.seCatchBase.load();

        // ミュート再生していたら解除
        if (this.needsUnmute) {
            this.bgmUi.setMuted(false);
            this.needsUnmute = false;
        }

        // unlock後に「再生できていない」なら確実にUI BGMを起動
        if (this.currentBgm === "ui") {
            this.bgmUi.setMuted(false);
            await this.bgmUi.play();
        }
    }

    playSeClick() {
        if (!this.unlocked) return;
        const a = this.seClickBase.cloneNode(true) as HTMLAudioElement;
        a.volume = this.seClickBase.volume;
        a.play().catch(() => { });
    }

    playSeCatch() {
        if (!this.unlocked) return;
        const a = this.seCatchBase.cloneNode(true) as HTMLAudioElement;
        a.volume = this.seCatchBase.volume;
        a.play().catch(() => { });
    }

    async playBgm(kind: BgmKind) {
        if (this.currentBgm === kind) return;

        if (this.currentBgm === "ui") this.bgmUi.pause();
        if (this.currentBgm === "game") this.bgmGame.pause();

        this.currentBgm = kind;

        if (kind === "ui") {
            this.bgmUi.setMuted(!this.unlocked && this.needsUnmute);
            await this.bgmUi.play();
        } else {
            this.bgmGame.setMuted(false);
            await this.bgmGame.play();
        }
    }

    // ゲーム終了：BGM停止 → ジングル →（待ち）→ UI BGM
    async playJingleGameEndThenUi() {
        // 1) BGM停止
        this.bgmGame.stop();
        this.currentBgm = null;

        // 2) ジングル
        await this.jingleEnd.play();

        // 3) ジングル終了→1.4秒待ってUI
        this.jingleEnd.element.onended = () => {
            window.setTimeout(() => {
                this.playBgm("ui");
            }, 1400);
        };
    }
}