// js/assets.js
export class AssetManager {
    constructor() {
        this.manifest = null;
        this.images = new Map(); // key: path, value: Image
        this.loadedCount = 0;
        this.totalAssets = 0;

        // fallback（manifestがあればそれを優先）
        this.fallbackCharacter = "assets/characters/placeholder.png";
        this.fallbackBook = "assets/books/placeholder.png";

        // 生成プレースホルダ（ファイルが無くても必ず返せる）
        this._generatedCharPlaceholder = this._makeSvgPlaceholder("NO CHAR");
        this._generatedBookPlaceholder = this._makeSvgPlaceholder("NO BOOK");

        // loadImage二重実行防止
        this._requested = new Set();
    }

    _makeSvgPlaceholder(label) {
        const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
        <rect width="100%" height="100%" fill="#222"/>
        <rect x="12" y="12" width="232" height="232" fill="none" stroke="#555" stroke-width="4"/>
        <text x="50%" y="50%" fill="#aaa" font-size="22" font-family="monospace"
          text-anchor="middle" dominant-baseline="middle">${label}</text>
      </svg>
    `);
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${svg}`;
        return img;
    }

    _pad3(n) {
        return String(n).padStart(3, "0");
    }

    _typeNo(typeId) {
        const m = String(typeId || "").match(/(\d+)/);
        return m ? Number(m[1]) : null;
    }

    _charsDir() {
        return this.manifest?.paths?.characters_dir || "assets/characters/";
    }

    _booksDir() {
        return this.manifest?.paths?.books_dir || "assets/books/";
    }

    // ★ canonical: type_id → chara_XXX.png
    _canonicalCharFilename(typeObj) {
        const no = this._typeNo(typeObj?.type_id);
        if (no == null) return null;
        return `chara_${this._pad3(no)}.png`;
    }

    // 本（書影）は既存の命名を優先し、無ければ cover_XXX.png へフォールバック
    _canonicalBookFilename(typeObj) {
        const no = this._typeNo(typeObj?.type_id);
        if (no == null) return null;
        return `cover_${this._pad3(no)}.png`;
    }

    async loadManifest() {
        try {
            const response = await fetch("data/manifest.json");
            this.manifest = await response.json();

            // fallbackをmanifest優先に
            if (this.manifest?.fallback?.character_placeholder) {
                this.fallbackCharacter = this.manifest.fallback.character_placeholder;
            }
            if (this.manifest?.fallback?.book_placeholder) {
                this.fallbackBook = this.manifest.fallback.book_placeholder;
            }

            // typesに内部フィールドを付与（後でmechanicsが参照する）
            this._decorateTypes();

            console.log("Manifest loaded:", this.manifest);
            return this.manifest;
        } catch (e) {
            console.error("Failed to load manifest:", e);
            return null;
        }
    }

    _decorateTypes() {
        if (!this.manifest?.types) return;
        for (const t of this.manifest.types) {
            const charCanon = this._canonicalCharFilename(t);
            const bookCanon = this._canonicalBookFilename(t);

            // 候補：canonical → manifest指定 → fallback
            t._charCandidates = [];
            if (charCanon) t._charCandidates.push(`${this._charsDir()}${charCanon}`);
            if (t.character_filename) t._charCandidates.push(`${this._charsDir()}${t.character_filename}`);
            t._charCandidates.push(this.fallbackCharacter);

            t._bookCandidates = [];
            if (t.book_filename) t._bookCandidates.push(`${this._booksDir()}${t.book_filename}`);
            if (bookCanon) t._bookCandidates.push(`${this._booksDir()}${bookCanon}`);
            t._bookCandidates.push(this.fallbackBook);

            // まだ確定しない（preload後に判定する）
            t._charMissing = false;
            t._bookMissing = false;
        }
    }

    async preloadImages() {
        if (!this.manifest?.types) return;

        const pathsToLoad = new Set();

        // fallbackは最優先
        pathsToLoad.add(this.fallbackCharacter);
        pathsToLoad.add(this.fallbackBook);

        // すべての候補をロードしておく（欠損でもOK）
        for (const t of this.manifest.types) {
            (t._charCandidates || []).forEach((p) => pathsToLoad.add(p));
            (t._bookCandidates || []).forEach((p) => pathsToLoad.add(p));
        }

        this.totalAssets = pathsToLoad.size;

        const promises = Array.from(pathsToLoad).map((path) => this.loadImage(path));
        await Promise.allSettled(promises);

        // ★ preload後に「そのtypeが描画可能か」を確定
        for (const t of this.manifest.types) {
            const okChar = (t._charCandidates || []).some((p) => this.images.has(p));
            const okBook = (t._bookCandidates || []).some((p) => this.images.has(p));

            t._charMissing = !okChar;
            t._bookMissing = !okBook;

            // デバッグ：壊れtypeの特定
            if (t._charMissing) {
                console.warn("[ASSET] missing character image for type:", t.type_id, t.display_name, t._charCandidates);
            }
        }

        console.log(`Assets loading finished. Loaded: ${this.loadedCount}/${this.totalAssets}`);
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
                // 失敗しても続行する
                this.loadedCount++;
                resolve(null);
            };
        });
    }

    _kickLoadIfNeeded(path) {
        if (!path || this._requested.has(path)) return;
        this._requested.add(path);
        this.loadImage(path).catch(() => { });
    }

    // input: typeObj / filename(string)
    getCharacterImage(input) {
        // type object
        if (input && typeof input === "object") {
            const candidates = input._charCandidates || [];
            for (const p of candidates) {
                if (this.images.has(p)) return this.images.get(p);
            }
            const first = candidates[0];
            if (first && first !== this.fallbackCharacter) this._kickLoadIfNeeded(first);

            return this.images.get(this.fallbackCharacter) || this._generatedCharPlaceholder;
        }

        // filename string
        const filename = String(input || "");
        const path = `${this._charsDir()}${filename}`;
        if (this.images.has(path)) return this.images.get(path);

        this._kickLoadIfNeeded(path);
        return this.images.get(this.fallbackCharacter) || this._generatedCharPlaceholder;
    }

    getBookImage(input) {
        if (input && typeof input === "object") {
            const candidates = input._bookCandidates || [];
            for (const p of candidates) {
                if (this.images.has(p)) return this.images.get(p);
            }
            const first = candidates[0];
            if (first && first !== this.fallbackBook) this._kickLoadIfNeeded(first);

            return this.images.get(this.fallbackBook) || this._generatedBookPlaceholder;
        }

        const filename = String(input || "");
        const path = `${this._booksDir()}${filename}`;
        if (this.images.has(path)) return this.images.get(path);

        this._kickLoadIfNeeded(path);
        return this.images.get(this.fallbackBook) || this._generatedBookPlaceholder;
    }

    getManifest() {
        return this.manifest;
    }
}