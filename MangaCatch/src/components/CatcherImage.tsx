import React, { useMemo, useState } from "react";

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function buildCandidates(): string[] {
    const b = baseUrl();
    // dev(http) / build(file) 両対応。uiフォルダ固定。
    return Array.from(
        new Set([
            b + "assets/ui/catcher.png",
            "/assets/ui/catcher.png",
            "./assets/ui/catcher.png",
            "assets/ui/catcher.png",
        ])
    );
}

export const CatcherImage: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
    const candidates = useMemo(() => buildCandidates(), []);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx];

    return (
        <img
            src={src}
            alt="catcher"
            draggable={false}
            style={{ userSelect: "none", WebkitUserDrag: "none", ...style } as any}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else console.warn("[CatcherImage] catcher.png not found. tried:", candidates);
            }}
        />
    );
};