import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function buildCandidates(): string[] {
    const b = baseUrl();

    // 今の運用：public/assets/ui/catcher.png
    const names = ["catcher.png"];

    const roots = [b + "assets/ui/", "/assets/ui/", "./assets/ui/", "assets/ui/"];

    const out: string[] = [];
    for (const r of roots) for (const n of names) out.push(r + n);

    return Array.from(new Set(out));
}

// ★重要：必ず「名前付きexport」
export function CatcherImage({ style }: { style?: CSSProperties }) {
    const candidates = useMemo(() => buildCandidates(), []);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx];

    return (
        <img
            src={src}
            alt="catcher"
            draggable={false}
            style={{ userSelect: "none", ...style }}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else console.warn("[CatcherImage] catcher.png not found. tried:", candidates);
            }}
        />
    );
}

// ついでに：default export も用意（将来のimport違い対策）
export default CatcherImage;