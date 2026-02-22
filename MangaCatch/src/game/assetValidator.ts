// src/game/assetValidator.ts
// 起動時にmaster.tsの全エントリのアセット存在を検証し、欠損をconsole.warnで報告する

import { CHARACTER_MASTER, getCharacterImagePath, getCoverImagePath } from '../constants/master';
import type { CharacterData } from '../constants/master';

// Viteのimport.meta.glob で静的に列挙（ファイルシステム順依存を排除）
const CHARACTER_IMAGE_MODULES = import.meta.glob('/public/assets/characters/*.png', { eager: false });
const COVER_IMAGE_MODULES = import.meta.glob('/public/assets/covers/*.png', { eager: false });

/** glob結果のキーセットを ファイル名 → true のMapに変換 */
function buildExistenceMap(modules: Record<string, unknown>): Set<string> {
    const set = new Set<string>();
    for (const fullPath of Object.keys(modules)) {
        // /public/assets/characters/chara_001.png -> chara_001.png
        const filename = fullPath.split('/').pop() ?? '';
        if (filename) set.add(filename);
    }
    return set;
}

const characterImageSet: Set<string> = buildExistenceMap(CHARACTER_IMAGE_MODULES);
const coverImageSet: Set<string> = buildExistenceMap(COVER_IMAGE_MODULES);

export interface AssetCheckResult {
    id: string;
    no: number;
    name: string;
    characterImageOk: boolean;
    coverImageOk: boolean;
}

/**
 * CHARACTER_MASTER の全エントリのアセット存在を検証する。
 * 欠損がある場合は console.warn で報告し、結果の配列を返す。
 * 開発時（import.meta.env.DEV）は詳細ログも出力する。
 */
export function validateAllAssets(): AssetCheckResult[] {
    const results: AssetCheckResult[] = [];
    let hasError = false;

    for (const char of CHARACTER_MASTER) {
        const charOk = characterImageSet.has(char.characterImage);
        const coverOk = coverImageSet.has(char.workImage);

        if (!charOk) {
            console.warn(
                `[MangaCatch][Asset Missing] No.${char.no} id="${char.id}" キャラ画像が見つかりません: ` +
                `public/assets/characters/${char.characterImage}`
            );
            hasError = true;
        }
        if (!coverOk) {
            console.warn(
                `[MangaCatch][Asset Missing] No.${char.no} id="${char.id}" 書影画像が見つかりません: ` +
                `public/assets/covers/${char.workImage}`
            );
            hasError = true;
        }

        if (import.meta.env.DEV) {
            console.log(
                `[MangaCatch][Debug] No.${char.no} id="${char.id}" name="${char.name}" ` +
                `charImg=${char.characterImage}(${charOk ? '✓' : '✗ MISSING'}) ` +
                `cover=${char.workImage}(${coverOk ? '✓' : '✗ MISSING'})`
            );
        }

        results.push({
            id: char.id,
            no: char.no,
            name: char.name,
            characterImageOk: charOk,
            coverImageOk: coverOk,
        });
    }

    if (!hasError && import.meta.env.DEV) {
        console.log('[MangaCatch][Asset Validation] 全アセット OK ✓');
    }

    return results;
}

/** 単一キャラのキャラ画像の src を返す（欠損時はプレースホルダー） */
export function getCharacterSrc(char: CharacterData): string {
    if (characterImageSet.has(char.characterImage)) {
        return getCharacterImagePath(char);
    }
    // 欠損: プレースホルダー
    console.warn(`[MangaCatch] キャラ画像欠損のためプレースホルダーを使用: ${char.characterImage} (id=${char.id})`);
    return '/assets/ui/placeholder_chara.png';
}

/** 単一キャラの書影の src を返す（欠損時はプレースホルダー） */
export function getCoverSrc(char: CharacterData): string {
    if (coverImageSet.has(char.workImage)) {
        return getCoverImagePath(char);
    }
    console.warn(`[MangaCatch] 書影画像欠損のためプレースホルダーを使用: ${char.workImage} (id=${char.id})`);
    return '/assets/ui/placeholder_cover.png';
}
