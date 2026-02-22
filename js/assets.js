export class AssetManager {
    constructor() {
        this.manifest = null;
        this.images = new Map(); // key: path, value: Image object
        this.loadedCount = 0;
        this.totalAssets = 0;

        // Hardcoded fallback paths as per spec
        this.fallbackCharacter = "assets/characters/placeholder.png";
        this.fallbackBook = "assets/books/placeholder.png";

        // 読み込み要求済み（無限にloadImageしない保険）
        this._requested = new Set();
    }

    async loadManifest() {
        try {
            const response = await fetch("data/manifest.json");
            this.manifest = await response.json();
            console.log("Manifest loaded:", this.manifest);
            return this.manifest;
        } catch (e) {
            console.error("Failed to load manifest:", e);
            return null;
        }
    }

    _pad3(n) {
        return String(n).padStart(3, "0");
    }

    _typeNoFromTypeId(typeId) {
        // "type01" / "type1" / "type001" などを 1 にする
        const m = String(typeId || "").match(/(\d+)/);
        if (!m) return null;
        return Number(m[1]);
    }

    _normalizeCharacterFilename(filename, typeObj) {
        // 1) typeObj があるなら、type_idから決め打ち（最も安全）
        if (typeObj && typeObj.type_id) {
            const no = this._typeNoFromTypeId(typeObj.type_id);
            if (no != null) return `chara_${this._pad3(no)}.png`;
        }

        const f = String(filename || "");
        if (!f) return "placeholder.png";

        // 2) すでに chara_XXX.png ならそれを使う
        if (/^chara_\d{3}\.(png|webp)$/i.test(f)) return f;

        // 3) chara_9.png のような場合を補正
        const mCh = f.match(/^chara_(\d+)\.(png|webp)$/i);
        if (mCh) return `chara_${this._pad3(Number(mCh[1]))}.png`;

        // 4) type01.png -> chara_001.png
        const mType = f.match(/^type_?(\d+)\.(png|webp)$/i);
        if (mType) return `chara_${this._pad3(Number(mType[1]))}.png`;

        // 5) その他はそのまま
        return f;
    }

    _normalizeBookFilename(filename, typeObj) {
        // 1) typeObj があるなら、type_idから cover_XXX.png を作る
        if (typeObj && typeObj.type_id) {
            const no = this._typeNoFromTypeId(typeObj.type_id);
            if (no != null) return `cover_${this._pad3(no)}.png`;
        }

        const f = String(filename || "");
        if (!f) return "placeholder.png";

        if (/^cover_\d{3}\.(png|webp)$/i.test(f)) return f;

        const mCover = f.match(/^cover_(\d+)\.(png|webp)$/i);
        if (mCover) return `cover_${this._pad3(Number(mCover[1]))}.png`;

        const mType = f.match(/^type_?(\d+)\.(png|webp)$/i);
        if (mType) return `cover_${this._pad3(Number(mType[1]))}.png`;

        return f;
    }

    async preloadImages() {
        if (!this.manifest) return;

        const types = this.manifest.types || [];

        // Collect all paths to load
        const pathsToLoad = new Set();

        // Add placeholders first
        pathsToLoad.add(this.fallbackCharacter);
        pathsToLoad.add(this.fallbackBook);

        types.forEach((type) => {
            const charsDir = this.manifest.paths.characters_dir;
            const booksDir = this.manifest.paths.books_dir;

            // そのままの指定 + 正規化した指定 の両方をロード（保険）
            const charA = `${charsDir}${type.character_filename || "placeholder.png"}`;
            const charB = `${charsDir}${this._normalizeCharacterFilename(type.character_filename, type)}`;
            pathsToLoad.add(charA);
            pathsToLoad.add(charB);

            const bookA = `${booksDir}${type.book_filename || "placeholder.png"}`;
            const bookB = `${booksDir}${this._normalizeBookFilename(type.book_filename, type)}`;
            pathsToLoad.add(bookA);
            pathsToLoad.add(bookB);
        });

        this.totalAssets = pathsToLoad.size;

        const promises = Array.from(pathsToLoad).map((path) => this.loadImage(path));
        await Promise.allSettled(promises);

        console.log(`Assets loading finished.\nLoaded: ${this.loadedCount}/${this.totalAssets}`);
    }

    loadImage(path) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = path;

            img.onload = () => {
                this.images.set(path, img);
                this.loadedCount++;
                resolve(img);
            };

            img.onerror = () => {
                console.warn(`Failed to load image: ${path}. Using placeholder logic on retrieval.`);
                // Even on error, resolve to allow the game to continue
                this.loadedCount++;
                resolve(null);
            };
        });
    }

    _kickLoadIfNeeded(path) {
        if (this._requested.has(path)) return;
        this._requested.add(path);
        // await しない（次フレーム以降に読み込み完了してMapに入る）
        this.loadImage(path).catch(() => { });
    }

    /**
     * filenameOrType:
     *  - 文字列（"chara_001.png" / "type01.png" など）
     *  - typeオブジェクト（manifestのtypes要素）
     */
    getCharacterImage(filenameOrType) {
        const typeObj = (filenameOrType && typeof filenameOrType === "object") ? filenameOrType : null;
        const filename = (typeof filenameOrType === "string") ? filenameOrType : (typeObj ? typeObj.character_filename : "");

        const charsDir = this.manifest?.paths?.characters_dir || "assets/characters/";

        const normalized = this._normalizeCharacterFilename(filename, typeObj);
        const candidates = [
            `${charsDir}${normalized}`,
            `${charsDir}${filename}`,
            this.fallbackCharacter
        ].filter(Boolean);

        for (const path of candidates) {
            if (this.images.has(path)) return this.images.get(path);
        }

        // 未ロードなら裏で読み込み開始（次フレームで反映される）
        const tryPath = candidates[0];
        if (tryPath && tryPath !== this.fallbackCharacter) this._kickLoadIfNeeded(tryPath);

        return this.images.get(this.fallbackCharacter) || null;
    }

    getBookImage(filenameOrType) {
        const typeObj = (filenameOrType && typeof filenameOrType === "object") ? filenameOrType : null;
        const filename = (typeof filenameOrType === "string") ? filenameOrType : (typeObj ? typeObj.book_filename : "");

        const booksDir = this.manifest?.paths?.books_dir || "assets/books/";

        const normalized = this._normalizeBookFilename(filename, typeObj);
        const candidates = [
            `${booksDir}${normalized}`,
            `${booksDir}${filename}`,
            this.fallbackBook
        ].filter(Boolean);

        for (const path of candidates) {
            if (this.images.has(path)) return this.images.get(path);
        }

        const tryPath = candidates[0];
        if (tryPath && tryPath !== this.fallbackBook) this._kickLoadIfNeeded(tryPath);

        return this.images.get(this.fallbackBook) || null;
    }

    getManifest() {
        return this.manifest;
    }
}