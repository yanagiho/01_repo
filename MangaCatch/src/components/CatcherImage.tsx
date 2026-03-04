import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function buildCandidates(): string[] {
    const b = baseUrl();

    // ★リング画像は「catcher.png」を最優先で読む（あなたの配置に合わせる）
    const names = [
        "catcher.png",       // ←あなたの現状
        "catch_ring.png",
        "ring.png",
        "halo.png",
    ];

    const roots = [b + "assets/ui/", "/assets/ui/", "./assets/ui/", "assets/ui/"];

    const out: string[] = [];
    for (const r of roots) for (const n of names) out.push(r + n);
    return Array.from(new Set(out));
}

export function CatchRingImage({
    size,
    isHit,
    style,
}: {
    size: number;
    isHit: boolean;
    style?: CSSProperties;
}) {
    const candidates = useMemo(() => buildCandidates(), []);
    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);

    if (failed) {
        // 画像が無い場合の保険（落とさない）
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: 999,
                    border: isHit ? "8px solid rgba(255,255,255,0.95)" : "6px solid rgba(0,238,187,0.92)",
                    boxShadow: isHit
                        ? "0 0 38px rgba(255,255,255,0.6), 0 0 70px rgba(0,238,187,0.45)"
                        : "0 0 26px rgba(0,238,187,0.35)",
                    background: "rgba(0,0,0,0.08)",
                    ...style,
                }}
            />
        );
    }

    return (
        <img
            src={candidates[idx]}
            alt="catch-ring"
            draggable={false}
            style={{
                width: size,
                height: size,
                objectFit: "contain",
                pointerEvents: "none",
                // ★輪っぽく見えるように光を強める（必要なら弱められます）
                filter: isHit
                    ? "drop-shadow(0 0 30px rgba(255,255,255,0.75)) drop-shadow(0 0 56px rgba(0,238,187,0.60))"
                    : "drop-shadow(0 0 22px rgba(0,238,187,0.40))",
                opacity: 0.98,
                ...style,
            }}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else setFailed(true);
            }}
        />
    );
}