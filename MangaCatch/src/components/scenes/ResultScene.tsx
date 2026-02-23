// MangaCatch/src/components/scenes/ResultScene.tsx
import React, { useMemo } from "react";
import { getCharacterById } from "../../constants/master";

type Row = {
    id: string;
    work: string;
    artist: string;
    cnt: number;
};

export const ResultScene: React.FC<{ score: number; counts: Record<string, number> }> = ({ score, counts }) => {
    const { total, rows, maxCnt } = useMemo(() => {
        let totalCnt = 0;
        const list: Row[] = [];

        for (const [id, cnt] of Object.entries(counts)) {
            totalCnt += cnt;
            const c = getCharacterById(id);
            if (!c) continue;
            list.push({ id, work: c.work, artist: c.artist, cnt });
        }

        list.sort((a, b) => b.cnt - a.cnt);
        const m = Math.max(1, ...list.map((r) => r.cnt));
        return { total: totalCnt, rows: list.slice(0, 10), maxCnt: m };
    }, [counts]);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 28, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 44, color: "#00eebb" }}>RESULT</div>
                <div style={{ fontFamily: "monospace", fontSize: 36 }}>
                    SCORE <span style={{ color: "#00eebb" }}>{score}</span>
                </div>
            </div>

            {/* 合計 */}
            <div style={{ marginTop: 8, fontSize: 28 }}>
                取ったキャラ総数：<span style={{ color: "#00eebb", fontFamily: "monospace", fontSize: 40 }}>{total}</span>
            </div>

            {/* グラフ */}
            <div
                style={{
                    marginTop: 18,
                    maxWidth: 1100,
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: 18,
                    padding: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {rows.length === 0 && <div style={{ opacity: 0.75 }}>キャッチがありません</div>}

                {rows.map((r, i) => {
                    const w = Math.max(4, Math.round((r.cnt / maxCnt) * 100));
                    return (
                        <div
                            key={r.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "60px 1fr 120px",
                                gap: 14,
                                alignItems: "center",
                                padding: "10px 6px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            <div style={{ fontFamily: "monospace", color: "#00eebb", fontSize: 18 }}>#{i + 1}</div>

                            <div>
                                <div style={{ fontSize: 18, lineHeight: 1.1 }}>{r.work}</div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>{r.artist}</div>
                                <div
                                    style={{
                                        marginTop: 8,
                                        height: 14,
                                        borderRadius: 10,
                                        background: "rgba(255,255,255,0.08)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${w}%`,
                                            height: "100%",
                                            background: "rgba(0,238,187,0.85)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 26, color: "#00eebb" }}>
                                {r.cnt}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 12, opacity: 0.65, fontSize: 14 }}>※自動で次へ進みます</div>
        </div>
    );
};