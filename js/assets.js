
export class AssetManager {
    constructor() {
        this.manifest = null;
        this.images = new Map(); // key: path, value: Image object
        this.loadedCount = 0;
        this.totalAssets = 0;
        
        // Hardcoded fallback paths as per spec
        this.fallbackCharacter = "assets/characters/placeholder.png";
        this.fallbackBook = "assets/books/placeholder.png";
    }

    async loadManifest() {
        try {
            const response = await fetch('data/manifest.json');
            this.manifest = await response.json();
            console.log("Manifest loaded:", this.manifest);
            return this.manifest;
        } catch (e) {
            console.error("Failed to load manifest:", e);
            // Minimal fallback manifest could be defined here if critical
            return null;
        }
    }

    async preloadImages() {
        if (!this.manifest) return;

        const types = this.manifest.types;
        // Collect all paths to load
        const pathsToLoad = new Set();
        
        // Add placeholders first
        pathsToLoad.add(this.fallbackCharacter);
        pathsToLoad.add(this.fallbackBook);

        types.forEach(type => {
            const charPath = `${this.manifest.paths.characters_dir}${type.character_filename}`;
            const bookPath = `${this.manifest.paths.books_dir}${type.book_filename}`;
            pathsToLoad.add(charPath);
            pathsToLoad.add(bookPath);
        });

        this.totalAssets = pathsToLoad.size;
        
        const promises = Array.from(pathsToLoad).map(path => this.loadImage(path));
        await Promise.allSettled(promises);
        console.log(`Assets loading finished. Loaded: ${this.loadedCount}/${this.totalAssets}`);
    }

    loadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            
            img.onload = () => {
                this.images.set(path, img);
                this.loadedCount++;
                resolve(img);
            };

            img.onerror = () => {
                console.warn(`Failed to load image: ${path}. Using placeholder logic on retrieval.`);
                // Even on error, we resolve to allow the game to continue
                // We don't set the map entry, so getAsset will handle fallback
                this.loadedCount++;
                resolve(null);
            };
        });
    }

    getCharacterImage(filename) {
        const path = `${this.manifest.paths.characters_dir}${filename}`;
        if (this.images.has(path)) {
            return this.images.get(path);
        }
        // Return fallback
        return this.images.get(this.fallbackCharacter);
    }
    
    getBookImage(filename) {
        const path = `${this.manifest.paths.books_dir}${filename}`;
        if (this.images.has(path)) {
            return this.images.get(path);
        }
        return this.images.get(this.fallbackBook);
    }

    getManifest() {
        return this.manifest;
    }
}
