import type { CharacterManifestItem } from '../types/game';

/**
 * public/data/manifest.json の想定形式（揺れに耐える）
 * - { types: [...] }
 * - { items: [...] }
 * - [...]  (配列直)
 */
type RawManifest = any;

/** 文字列を安全にしてJSON.parseしやすくする（壊れJSON対策の最低限） */
function sanitizeJsonText(input: string): string {
    if (!input) return input;

    let s = input;

    // BOM除去
    s = s.replace(/^\uFEFF/, '');

    // 制御文字を空白へ（改行/タブ含む）: 文字列中の生改行が混入してても通しやすくする
    // JSONとしての改行は不要なので潰してOK（本来はmanifest側を直すのが正）
    s = s.replace(/[\u0000-\u001F\u007F]/g, ' ');

    // 末尾カンマ除去（よくある壊れ方）
    s = s.replace(/,\s*([}\]])/g, '$1');

    return s;
}

/** public 配下へ置いたアセットのURLを正規化して返す */
function resolvePublicAssetPath(
    kind: 'characters' | 'covers' | 'books',
    filename: unknown
): string {
    if (typeof filename !== 'string') {
        return `/assets/${kind}/missing.png`;
    }

    let f = filename.trim();
    if (!f) return `/assets/${kind}/missing.png`;

    // URL直指定
    if (/^https?:\/\//i.test(f)) return f;

    // Windowsパス対策
    f = f.replace(/\\/g, '/');

    // 先頭の ./ や / や public/ を除去
    f = f.replace(/^(\.\/)+/, '');
    f = f.replace(/^\/+/, '');
    f = f.replace(/^public\//, '');

    // すでに assets/ から始まる → /assets/... にする
    if (f.startsWith('assets/')) return `/${f}`;

    // characters/ や covers/ など → /assets/characters/... に寄せる
    if (f.startsWith('characters/')) return `/assets/${f}`;
    if (f.startsWith('covers/')) return `/assets/${f}`;
    if (f.startsWith('books/')) return `/assets/${f}`;

    // kindフォルダ直下のファイル名だけ来たケース → /assets/kind/filename
    if (!f.includes('/')) return `/assets/${kind}/${f}`;

    // その他の相対パス（例: img/chara.png 等） → そのまま / を付けて返す
    return `/${f}`;
}

/** manifestが壊れている/無い場合でも最低限動かすフォールバック */
function buildFallbackManifest(): CharacterManifestItem[] {
    const charsCount = 9;   // スクショに合わせて最低限
    const coversCount = 7;

    const items: CharacterManifestItem[] = [];
    for (let i = 1; i <= Math.max(charsCount, coversCount); i++) {
        const chara = `chara_${String(i).padStart(3, '0')}.png`;
        const cover = `cover_${String(i).padStart(3, '0')}.png`;

        items.push({
            type_id: `fallback_${String(i).padStart(3, '0')}`,
            character_name_ja: `キャラ ${i}`,
            work_title_ja: `作品 ${i}`,
            artist_name_ja: `作者 ${i}`,
            character_name_en: `Character ${i}`,
            work_title_en: `Work ${i}`,
            artist_name_en: `Author ${i}`,
            assets: {
                cover: {
                    canonical: cover,
                    current: resolvePublicAssetPath('covers', cover),
                },
                character: {
                    canonical: chara,
                    current: resolvePublicAssetPath('characters', chara),
                    missing: false,
                },
            },
            score: 100,
            rarity_tier: 'common',
            rarity_point: 1,
            weight: 10,
            recommend_text: '',
        });
    }
    return items;
}

/** 生manifestの1要素から CharacterManifestItem に正規化 */
function toManifestItem(item: any, index: number): CharacterManifestItem {
    // よくある揺れを吸収（あなたの既存マッピングを踏襲）
    const typeId = String(item.type_id ?? item.id ?? `type_${index}`);
    const displayName = item.display_name ?? item.character_name_ja ?? item.character_name ?? `キャラ${index}`;
    const workTitle = item.work_title ?? item.work_title_ja ?? `作品${index}`;
    const authorName = item.work_author_name ?? item.artist_name_ja ?? item.author_name ?? `作者${index}`;

    const characterEn = item.character_name_en ?? '';
    const workEn = item.work_title_en ?? '';
    const authorEn = item.author_name_en ?? item.artist_name_en ?? '';

    const bookFile = item.book_filename ?? item.cover_filename ?? item.cover ?? '';
    const charFile = item.character_filename ?? item.chara_filename ?? item.character ?? item.image ?? '';

    const coverCurrent = resolvePublicAssetPath('covers', bookFile);
    const charCurrent = resolvePublicAssetPath('characters', charFile);

    return {
        type_id: typeId,
        character_name_ja: String(displayName),
        work_title_ja: String(workTitle),
        artist_name_ja: String(authorName),
        character_name_en: String(characterEn),
        work_title_en: String(workEn),
        artist_name_en: String(authorEn),
        assets: {
            cover: {
                canonical: String(bookFile ?? ''),
                current: coverCurrent,
            },
            character: {
                canonical: String(charFile ?? ''),
                current: charCurrent,
                missing: false,
            },
        },
        score: Number(item.score ?? 100),
        rarity_tier: (item.rarity_tier ?? 'common') as any,
        rarity_point: Number(item.rarity_point ?? 1),
        weight: Number(item.weight ?? 10),
        recommend_text: String(item.recommend_text ?? ''),
    };
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
     * - 壊れててもフォールバックで続行
     */
    public async loadManifest(): Promise<void> {
        try {
            const response = await fetch('/data/manifest.json', { cache: 'no-store' });

            if (!response.ok) {
                throw new Error(`manifest fetch failed: ${response.status} ${response.statusText}`);
            }

            const rawText = await response.text();
            const repaired = sanitizeJsonText(rawText);

            let data: RawManifest;
            try {
                data = JSON.parse(repaired);
            } catch (e) {
                // manifest自体が壊れている場合
                console.warn('[AssetManager] manifest.json is invalid. Fallback to local assets.', e);
                this.manifest = buildFallbackManifest();
                return;
            }

            const list =
                Array.isArray(data) ? data :
                    Array.isArray(data?.types) ? data.types :
                        Array.isArray(data?.items) ? data.items :
                            [];

            if (!Array.isArray(list) || list.length === 0) {
                console.warn('[AssetManager] manifest is empty. Fallback to local assets.');
                this.manifest = buildFallbackManifest();
                return;
            }

            this.manifest = list.map((it: any, idx: number) => toManifestItem(it, idx));

            // 先頭の数件だけログ（URL確認用）
            console.log('[AssetManager] Manifest loaded:', this.manifest.length, 'items');
            console.log('[AssetManager] sample character url:', this.manifest[0]?.assets?.character?.current);
            console.log('[AssetManager] sample cover url:', this.manifest[0]?.assets?.cover?.current);
        } catch (error) {
            console.warn('[AssetManager] Failed to load manifest. Fallback to local assets.', error);
            this.manifest = buildFallbackManifest();
        }
    }

    public getManifest(): CharacterManifestItem[] {
        return this.manifest;
    }

    public getItemByTypeId(typeId: string): CharacterManifestItem | undefined {
        return this.manifest.find((item) => item.type_id === typeId);
    }

    public getRandomItem(): CharacterManifestItem {
        if (!this.manifest || this.manifest.length === 0) {
            // ここに来るのは異常だが落とさない
            return {
                type_id: 'empty',
                character_name_ja: '',
                work_title_ja: '',
                artist_name_ja: '',
                character_name_en: '',
                work_title_en: '',
                artist_name_en: '',
                assets: {
                    cover: { canonical: '', current: '/assets/covers/missing.png' },
                    character: { canonical: '', current: '/assets/characters/missing.png', missing: true },
                },
                score: 0,
                rarity_tier: 'common',
                rarity_point: 0,
                weight: 1,
                recommend_text: '',
            };
        }

        const randomIndex = Math.floor(Math.random() * this.manifest.length);
        return this.manifest[randomIndex];
    }
}
