export class AssetManager {
    constructor() {
        this.manifest = null;
        this.images = new Map(); // key: path, value: Image object
        this.loadedCount = 0;
        this.totalAssets = 0;

        // fallback paths in manifest
        this.fallbackCharacter = "assets/characters/placeholder.png";
        this.fallbackBook = "assets/books/placeholder.png";

        // 生成プレースホルダ（ファイルが無くても必ず出せる）
        this._generatedCharPlaceholder = this._makeSvgPlaceholder("NO CHAR");
        this._generatedBookPlaceholder = this._makeSvgPlaceholder("NO BOOK");

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

    async loadManifest() {
        try {
            const response = await fetch("data/manifest.json");
            this.manifest = await response.json();

            // fallback を manifest 優先に
            if (this.manifest?.fallback?.character_placeholder) {
                this.fallbackCharacter = this.manifest.fallback.character_placeholder;
            }
            if (this.manifest?.fallback?.book_placeholder) {
                this.fallbackBook = this.manifest.fallback.book_placeholder;
            }

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
        const m = String(typeId || "").match(/(\d+)/);
        return m ? Number(m[1]) : null;
    }

    _candidateCharacterPaths(typeObjOrFilename) {
        const charsDir = this.manifest?.paths?.characters_dir || "assets/characters/";

        // type object
        if (typeObjOrFilename && typeof typeObjOrFilename === "object") {
            const t = typeObjOrFilename;
            const no = this._typeNoFromTypeId(t.type_id);

            const list = [];
            if (no != null) list.push(`${charsDir}chara_${this._pad3(no)}.png`);
            if (t.character_filename) list.push(`${charsDir}${t.character_filename}`);

            // 旧命名が残ってても拾う
            if (no != null) list.push(`${charsDir}type${String(no).padStart(2, "0")}.png`);
            if (no != null) list.push(`${charsDir}type${String(no).padStart(2, "0")}.webp`);

            // 最後に fallback
            list.push(this.fallbackCharacter);

            // 重複排除
            return Array.from(new Set(list));
        }

        // filename string
        const filename = String(typeObjOrFilename || "");
        const list = [];

        // 直接指定
        if (filename) list.push(`${charsDir}${filename}`);

        // type01.png -> chara_001.png
        const mType = filename.match(/^type_?(\d+)\.(png|webp)$/i);
        if (mType) {
            const no = Number(mType[1]);
            list.push(`${charsDir}chara_${this._pad3(no)}.png`);
        }

        // chara_1.png -> chara_001.png
        const mCh = filename.match(/^chara_(\d+)\.(png|webp)$/i);
        if (mCh) {
            const no = Number(mCh[1]);
            list.push(`${charsDir}chara_${this._pad3(no)}.png`);
        }

        list.push(this.fallbackCharacter);
        return Array.from(new Set(list));
    }

    _candidateBookPaths(typeObjOrFilename) {
        const booksDir = this.manifest?.paths?.books_dir || "assets/books/";

        if (typeObjOrFilename && typeof typeObjOrFilename === "object") {
            const t = typeObjOrFilename;
            const no = this._typeNoFromTypeId(t.type_id);

            const list = [];
            if (no != null) list.push(`${booksDir}cover_${this._pad3(no)}.png`);
            if (t.book_filename) list.push(`${booksDir}${t.book_filename}`);

            // 旧命名が残ってても拾う
            if (no != null) list.push(`${booksDir}type${String(no).padStart(2, "0")}.png`);

            list.push(this.fallbackBook);
            return Array.from(new Set(list));
        }

        const filename = String(typeObjOrFilename || "");
        const list = [];
        if (filename) list.push(`${booksDir}${filename}`);

        const mType = filename.match(/^type_?(\d+)\.(png|webp)$/i);
        if (mType) {
            const no = Number(mType[1]);
            list.push(`${booksDir}cover_${this._pad3(no)}.png`);
        }

        list.push(this.fallbackBook);
        return Array.from(new Set(list));
    }

    async preloadImages() {
        if (!this.manifest) return;

        const types = this.manifest.types || [];
        const pathsToLoad = new Set();

        // fallback を最優先でロード
        pathsToLoad.add(this.fallbackCharacter);
        pathsToLoad.add(this.fallbackBook);

        // 各 type から候補パスを集める（= 壊れててもズレない）
        types.forEach((t) => {
            this._candidateCharacterPaths(t).forEach((p) => pathsToLoad.add(p));
            this._candidateBookPaths(t).forEach((p) => pathsToLoad.add(p));
        });

        this.totalAssets = pathsToLoad.size;

        const promises = Array.from(pathsToLoad).map((path) => this.loadImage(path));
        await Promise.allSettled(promises);

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
                console.warn(`Failed to load image: ${path}`);
                // 失敗でも loadedCount は進める。Mapには入れない（候補探索でfallbackへ落ちる）
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

    getCharacterImage(typeObjOrFilename) {
        const candidates = this._candidateCharacterPaths(typeObjOrFilename);

        for (const path of candidates) {
            if (this.images.has(path)) return this.images.get(path);
        }

        // 未ロードなら最有力候補を裏でロード
        const first = candidates[0];
        if (first && first !== this.fallbackCharacter) this._kickLoadIfNeeded(first);

        // fallbackファイルが無い/未ロードでも必ず返す
        return this.images.get(this.fallbackCharacter) || this._generatedCharPlaceholder;
    }

    getBookImage(typeObjOrFilename) {
        const candidates = this._candidateBookPaths(typeObjOrFilename);

        for (const path of candidates) {
            if (this.images.has(path)) return this.images.get(path);
        }

        const first = candidates[0];
        if (first && first !== this.fallbackBook) this._kickLoadIfNeeded(first);

        return this.images.get(this.fallbackBook) || this._generatedBookPlaceholder;
    }

    getManifest() {
        return this.manifest;
    }
}