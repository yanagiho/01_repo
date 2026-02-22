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

function buildBaseDirs(): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "/";
    const normalize = (s: string) => (s.endsWith("/") ? s : s + "/");

    // 先頭 / は Electron(file://) で死ぬことがあるため、相対候補も必ず入れる
    const candidates = [
        normalize(baseUrl) + "assets/characters/",
        "./assets/characters/",
        "assets/characters/",
        "../assets/characters/",
        "../../assets/characters/",
        "../../../assets/characters/",
    ];
    return Array.from(new Set(candidates));
}

function buildFilenames(char: CharacterData): string[] {
    const n2 = pad2(char.no);
    const n3 = pad3(char.no);

    const list: string[] = [
        `chara_${n3}.png`,
        `chara_${n3}.webp`,
    ];

    if (char.characterImage) list.push(char.characterImage);

    // 旧命名が残っている場合の保険
    list.push(`type${n2}.png`, `type_${n2}.png`, `type${n2}.webp`, `type_${n2}.webp`);
    list.push(`${char.id}.png`, `${char.id}.webp`);

    return Array.from(new Set(list));
}

function buildCandidates(char: CharacterData): string[] {
    const bases = buildBaseDirs();
    const names = buildFilenames(char);
    const urls: string[] = [];
    for (const b of bases) for (const n of names) urls.push(b + n);
    return urls;
}

export const CharacterImage: React.FC<{
    char: CharacterData;
    alt?: string;
    style?: React.CSSProperties;
}> = ({ char, alt, style }) => {
    const candidates = useMemo(() => buildCandidates(char), [char]);
    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);

    const src = !failed ? (candidates[idx] ?? PLACEHOLDER) : PLACEHOLDER;

    return (
        <img
            src={src}
            alt={alt ?? char.name}
            style={{ userSelect: "none", WebkitUserDrag: "none", ...style }}
            onError={() => {
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
            }}
            draggable={false}
        />
    );
};