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
                return { id, cnt, c, subtotal: cnt * c.score };
            })
            .filter(Boolean) as { id: string; cnt: number; c: any; subtotal: number }[];

        list.sort((a, b) => b.subtotal - a.subtotal);
        return list.slice(0, 8);
    }, [counts]);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 28, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 44, color: "#00eebb" }}>RESULT</div>
                <div style={{ fontSize: 34, fontFamily: "monospace" }}>
                    SCORE: <span style={{ color: "#00eebb" }}>{score}</span>
                </div>
            </div>

            <div style={{ marginTop: 18, background: "rgba(0,0,0,0.38)", borderRadius: 18, padding: 16, maxWidth: 1100 }}>
                {rows.length === 0 && <div style={{ opacity: 0.8 }}>キャッチがありません</div>}

                {rows.map((r) => (
                    <div
                        key={r.id}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "86px 1fr 90px 140px",
                            gap: 14,
                            alignItems: "center",
                            padding: "12px 8px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <CoverImage char={r.c} style={{ width: 72, height: 96, objectFit: "contain", borderRadius: 10, background: "rgba(0,0,0,0.25)" }} />

                        <div>
                            <div style={{ fontSize: 18, color: "#00eebb" }}>{r.c.work}</div>
                            <div style={{ fontSize: 13, opacity: 0.85 }}>
                                {r.c.artist} <span style={{ opacity: 0.7 }}>({r.c.artistEn})</span>
                            </div>
                        </div>

                        <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 18 }}>x{r.cnt}</div>
                        <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 18, color: "#00eebb" }}>{r.subtotal}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 12, opacity: 0.65, fontSize: 12 }}>※自動で次へ進みます</div>
        </div>
    );
};