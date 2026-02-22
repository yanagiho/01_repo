import React, { useMemo, useState } from "react";
import type { CharacterData } from "../constants/master";

const pad2 = (n: number) => String(n).padStart(2, "0");
const pad3 = (n: number) => String(n).padStart(3, "0");

const PLACEHOLDER_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">
  <rect width="100%" height="100%" fill="#1f1f1f"/>
  <rect x="10" y="10" width="300" height="300" fill="none" stroke="#666" stroke-width="4" stroke-dasharray="8 8"/>
  <text x="50%" y="50%" fill="#aaa" font-size="22" font-family="monospace" text-anchor="middle" dominant-baseline="middle">
    IMAGE NOT FOUND
  </text>
</svg>
`);
const PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${PLACEHOLDER_SVG}`;

/**
 * Electron(file://) や dist 配置で assets の相対基準がズレるので、
 * ベース候補を複数持って順に試す。
 */
function buildBaseDirs(): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "/";
    const normalize = (s: string) => (s.endsWith("/") ? s : s + "/");

    const candidates = [
        normalize(baseUrl) + "assets/characters/", // Vite base追従（base:'./' でも効く）
        "./assets/characters/",
        "assets/characters/",
        "../assets/characters/",
        "../../assets/characters/",
        "../../../assets/characters/",
    ];

    return Array.from(new Set(candidates));
}

/**
 * 実ファイルは chara_001.png〜chara_009.png なので、chara_XXX を最優先。
 * 旧命名が残っていても拾えるように typeXX も候補に入れる。
 */
function buildFilenames(char: CharacterData): string[] {
    const n2 = pad2(char.no);
    const n3 = pad3(char.no);

    const list: string[] = [
        `chara_${n3}.png`,
        `chara_${n3}.webp`,
    ];

    // master で明示されていればそれも試す（念のため）
    if (char.characterImage) list.push(char.characterImage);

    // 旧命名が残っていた場合（保険）
    list.push(
        `type${n2}.png`,
        `type${n2}.webp`,
        `type_${n2}.png`,
        `type_${n2}.webp`
    );

    // id直結（保険）
    list.push(`${char.id}.png`, `${char.id}.webp`);

    return Array.from(new Set(list));
}

function buildCandidates(char: CharacterData): string[] {
    const baseDirs = buildBaseDirs();
    const names = buildFilenames(char);

    const urls: string[] = [];
    for (const b of baseDirs) {
        for (const n of names) {
            urls.push(b + n);
        }
    }
    return urls;
}

type Props = {
    char: CharacterData;
    alt?: string;
    style?: React.CSSProperties;
    className?: string;
};

export const CharacterImage: React.FC<Props> = ({ char, alt, style, className }) => {
    const candidates = useMemo(() => buildCandidates(char), [char]);
    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);

    const src = !failed ? (candidates[idx] ?? PLACEHOLDER) : PLACEHOLDER;

    return (
        <img
            src={src}
            alt={alt ?? char.name}
            className={className}
            style={{
                userSelect: "none",
                WebkitUserDrag: "none",
                ...style,
            }}
            onError={(e) => {
                // 次候補へ。全部ダメならプレースホルダ固定
                if (idx + 1 < candidates.length) {
                    setIdx(idx + 1);
                    return;
                }
                if (!failed) {
                    setFailed(true);
                    console.warn("[CharacterImage] not found:", {
                        id: char.id,
                        no: char.no,
                        name: char.name,
                        artist: char.artist,
                        location: window.location.href,
                        tried_first10: candidates.slice(0, 10),
                    });
                }
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
            }}
            draggable={false}
        />
    );
};