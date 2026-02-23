// MangaCatch/src/components/CoverImage.tsx
import React, { useMemo, useState } from "react";
import type { CharacterData } from "../constants/master";

const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="600">
  <rect width="100%" height="100%" fill="#222"/>
  <rect x="12" y="12" width="396" height="576" fill="none" stroke="#666" stroke-width="4" stroke-dasharray="10 10"/>
  <text x="50%" y="50%" fill="#aaa" font-size="18" font-family="monospace"
    text-anchor="middle" dominant-baseline="middle">NO COVER</text>
</svg>`);

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function extractNo3(char: CharacterData): string {
    const m = String((char as any).id ?? "").match(/(\d{1,3})$/);
    if (m) return m[1].padStart(3, "0");
    const n = Number((char as any).no ?? 0);
    return String(n).padStart(3, "0");
}

function buildCandidates(char: CharacterData): string[] {
    const no3 = extractNo3(char);
    const filename = `cover_${no3}.png`;

    const roots = Array.from(
        new Set([
            baseUrl() + "assets/books/",
            baseUrl() + "assets/covers/",
            "/assets/books/",
            "/assets/covers/",
            "./assets/books/",
            "./assets/covers/",
            "assets/books/",
            "assets/covers/",
        ])
    );

    return roots.map((r) => r + filename);
}

export const CoverImage: React.FC<{
    char: CharacterData;
    style?: React.CSSProperties;
}> = ({ char, style }) => {
    const candidates = useMemo(() => buildCandidates(char), [char]);
    const [idx, setIdx] = useState(0);

    const src = candidates[idx] ?? PLACEHOLDER;

    return (
        <img
            src={src}
            alt={(char as any).work ?? "cover"}
            draggable={false}
            style={{ userSelect: "none", ...style } as React.CSSProperties}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else {
                    console.warn("[CoverImage] not found", {
                        id: (char as any).id,
                        tried: candidates,
                    });
                }
            }}
        />
    );
};