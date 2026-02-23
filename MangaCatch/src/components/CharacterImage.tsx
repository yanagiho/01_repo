// MangaCatch/src/components/CharacterImage.tsx
import React, { useMemo, useState } from "react";
import type { CharacterData } from "../constants/master";

const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <rect width="100%" height="100%" fill="#222"/>
  <text x="50%" y="50%" fill="#aaa" font-size="18" font-family="monospace"
    text-anchor="middle" dominant-baseline="middle">NO CHAR</text>
</svg>`);

function normBase(s: string) {
    return s.endsWith("/") ? s : s + "/";
}
function baseDirs(): string[] {
    const b = (import.meta as any)?.env?.BASE_URL ?? "./";
    const base = normBase(b);
    return Array.from(
        new Set([
            base + "assets/characters/",
            "./assets/characters/",
            "assets/characters/",
            "../assets/characters/",
            "../../assets/characters/",
        ])
    );
}

export const CharacterImage: React.FC<{ char: CharacterData; style?: React.CSSProperties }> = ({
    char,
    style,
}) => {
    const candidates = useMemo(() => {
        const dirs = baseDirs();
        const names = Array.from(
            new Set([
                char.characterImage,                     // chara_001.png
                `chara_${String(char.no).padStart(3, "0")}.png`,
                `${char.id}.png`,
            ])
        );
        const urls: string[] = [];
        for (const d of dirs) for (const n of names) urls.push(d + n);
        return urls;
    }, [char]);

    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? PLACEHOLDER;

    return (
        <img
            src={src}
            alt={char.name}
            draggable={false}
            style={{ userSelect: "none", WebkitUserDrag: "none", ...style }}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else console.warn("[CharacterImage] not found", { id: char.id, tried: candidates });
            }}
        />
    );
};