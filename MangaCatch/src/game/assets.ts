import type { CharacterManifestItem } from '../types/game';

/**
 * public/data/manifest.json の形式（生データ）
 */
interface RawManifest {
    types: any[];
}

/**
 * アセット管理クラス
 */
export class AssetManager {
    private static instance: AssetManager;
    private manifest: CharacterManifestItem[] = [];

    private constructor() { }

    public static getInstance(): AssetManager {
        if (!AssetManager.instance) {
            AssetManager.instance = new AssetManager();
        }
        return AssetManager.instance;
    }

    /**
     * マニフェストのロード
     */
    public async loadManifest(): Promise<void> {
        try {
            const response = await fetch('/data/manifest.json');
            const data: RawManifest = await response.json();

            this.manifest = data.types.map((item: any) => ({
                type_id: item.type_id,
                character_name_ja: item.display_name,
                work_title_ja: item.work_title,
                artist_name_ja: item.work_author_name,
                character_name_en: item.character_name_en,
                work_title_en: item.work_title_en,
                artist_name_en: item.author_name_en,
                assets: {
                    cover: {
                        canonical: item.book_filename,
                        current: `/assets/books/${item.book_filename}`,
                    },
                    character: {
                        canonical: item.character_filename,
                        current: `/assets/characters/${item.character_filename}`,
                        missing: false,
                    },
                },
                score: item.score || 100,
                rarity_tier: (item.rarity_tier || 'common') as any,
                rarity_point: item.rarity_point || 1,
                weight: item.weight || 10,
                recommend_text: item.recommend_text || '（仮）推薦文',
            }));

            console.log('[AssetManager] Manifest loaded:', this.manifest.length, 'items');
        } catch (error) {
            console.error('[AssetManager] Failed to load manifest:', error);
            throw error;
        }
    }

    public getManifest(): CharacterManifestItem[] {
        return this.manifest;
    }

    public getItemByTypeId(typeId: string): CharacterManifestItem | undefined {
        return this.manifest.find(item => item.type_id === typeId);
    }

    public getRandomItem(): CharacterManifestItem {
        const randomIndex = Math.floor(Math.random() * this.manifest.length);
        return this.manifest[randomIndex];
    }
}
