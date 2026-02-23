// MangaCatch/src/components/scenes/ResultScene.tsx
import React, { useMemo } from "react";
import { getCharacterById } from "../../constants/master";
import { CoverImage } from "../CoverImage";

export const ResultScene: React.FC<{ score: number; counts: Record<string, number> }> = ({ score, counts }) => {
    const rows = useMemo(() => {
        const list = Object.entries(counts)
            .map(([id, cnt]) => {
                const c = getCharacterById(id);
                if (!c) return null;
                return {
                    id,
                    cnt,
                    c,
                    subtotal: cnt * c.score,
                };
            })
            .filter(Boolean) as { id: string; cnt: number; c: any; subtotal: number }[];

        list.sort((a, b) => b.subtotal - a.subtotal);
        return list;
    }, [counts]);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 28, color: "#fff" }}>
            <div style={{ fontSize: 42, color: "#00eebb" }}>RESULT</div>
            <div style={{ marginTop: 8, fontSize: 26, fontFamily: "monospace" }}>SCORE: {score}</div>

            <div style={{ marginTop: 18, background: "rgba(0,0,0,0.35)", borderRadius: 16, padding: 14, maxWidth: 980 }}>
                {rows.length === 0 && <div style={{ opacity: 0.8 }}>キャッチがありません</div>}

                {rows.map((r) => (
                    <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 6px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <CoverImage char={r.c} style={{ width: 64, height: 90, objectFit: "contain", borderRadius: 8, background: "rgba(0,0,0,0.25)" }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, color: "#00eebb" }}>{r.c.work}</div>
                            <div style={{ fontSize: 12, opacity: 0.85 }}>
                                {r.c.artist} <span style={{ opacity: 0.7 }}>({r.c.artistEn})</span>
                            </div>
                        </div>
                        <div style={{ width: 80, textAlign: "right", fontFamily: "monospace" }}>x{r.cnt}</div>
                        <div style={{ width: 120, textAlign: "right", fontFamily: "monospace", color: "#00eebb" }}>{r.subtotal}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 12, opacity: 0.65, fontSize: 12 }}>※自動で次へ進みます</div>
        </div>
    );
};