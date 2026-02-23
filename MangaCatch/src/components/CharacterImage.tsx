// MangaCatch/src/components/CharacterImage.tsx
import React, { useMemo, useState } from "react";
import type { CharacterData } from "../constants/master";

const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">
  <rect width="100%" height="100%" fill="#222"/>
  <rect x="10" y="10" width="300" height="300" fill="none" stroke="#666" stroke-width="4" stroke-dasharray="8 8"/>
  <text x="50%" y="50%" fill="#aaa" font-size="18" font-family="monospace"
    text-anchor="middle" dominant-baseline="middle">NO CHAR</text>
</svg>`);

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function extractNo3(char: CharacterData): string {
    // id: "chara_001" / "chara_010"
    const m = String((char as any).id ?? "").match(/(\d{1,3})$/);
    if (m) return m[1].padStart(3, "0");
    const n = Number((char as any).no ?? 0);
    return String(n).padStart(3, "0");
}

function buildCandidates(filename: string): string[] {
    const roots = Array.from(
        new Set([
            baseUrl() + "assets/characters/",
            "/assets/characters/",
            "./assets/characters/",
            "assets/characters/",
        ])
    );
    return roots.map((r) => r + filename);
}

export const CharacterImage: React.FC<{
    char: CharacterData;
    style?: React.CSSProperties;
}> = ({ char, style }) => {
    const candidates = useMemo(() => {
        const no3 = extractNo3(char);
        return buildCandidates(`chara_${no3}.png`);
    }, [char]);

    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? PLACEHOLDER;

    return (
        <img
            src={src}
            alt={(char as any).name ?? "character"}
            draggable={false}
            style={{ userSelect: "none", ...style } as React.CSSProperties}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else console.warn("[CharacterImage] not found", { id: (char as any).id, tried: candidates });
            }}
        />
    );
};