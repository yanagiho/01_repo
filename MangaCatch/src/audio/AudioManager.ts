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
        try { await this.el.play(); } catch { }
    }
    pause() { this.el.pause(); }
    stop() { this.el.pause(); try { this.el.currentTime = 0; } catch { } }
    setVolume(v: number) { this.el.volume = v; }
    get element() { return this.el; }
}

export class AudioManager {
    private static _instance: AudioManager | null = null;
    static get instance(): AudioManager {
        if (!this._instance) this._instance = new AudioManager();
        return this._instance;
    }

    private unlocked = false;

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

    isUnlocked() { return this.unlocked; }

    async unlock() {
        if (this.unlocked) return;
        this.unlocked = true;

        try {
            const a = new Audio();
            a.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
            await a.play().catch(() => { });
            a.pause();
        } catch { }

        this.seClickBase.load();
        this.seCatchBase.load();
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

    playBgm(kind: BgmKind) {
        if (!this.unlocked) return;
        if (this.currentBgm === kind) return;

        if (this.currentBgm === "ui") this.bgmUi.pause();
        if (this.currentBgm === "game") this.bgmGame.pause();

        this.currentBgm = kind;
        if (kind === "ui") this.bgmUi.play();
        if (kind === "game") this.bgmGame.play();
    }

    stopBgm() {
        if (!this.unlocked) return;
        this.bgmUi.stop();
        this.bgmGame.stop();
        this.currentBgm = null;
    }

    // ★要件：ゲームBGM停止→ジングル→一呼吸→UI BGM
    async playJingleGameEndThenUi() {
        if (!this.unlocked) return;

        // 1) まずBGM停止
        this.bgmGame.stop();
        this.currentBgm = null;

        // 2) ジングル
        await this.jingleEnd.play();

        // 3) ジングル終了→0.7秒→UI BGM
        this.jingleEnd.element.onended = () => {
            window.setTimeout(() => {
                this.playBgm("ui");
            }, 700);
        };
    }
}