// MangaCatch/src/components/scenes/RankingScene.tsx
import React from "react";
import type { RankingEntry } from "../../types/game";
import { getCharacterById } from "../../constants/master";
import { CoverImage } from "../CoverImage";

function fmtTime(ms: number) {
    if (!ms) return "";
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
}

export const RankingScene: React.FC<{ ranking: RankingEntry[] }> = ({ ranking }) => {
    const top = ranking.slice(0, 10);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 36, color: "#fff" }}>
            <div style={{ fontSize: 46, color: "#00eebb" }}>RANKING</div>

            <div style={{ marginTop: 18, background: "rgba(0,0,0,0.38)", borderRadius: 18, padding: 16, maxWidth: 1120 }}>
                {top.length === 0 && <div style={{ opacity: 0.75, fontSize: 20 }}>記録がありません</div>}

                {top.map((r, idx) => {
                    const c = getCharacterById(r.bestCharId);
                    return (
                        <div
                            key={`${idx}-${r.score}-${r.achieved_at}`}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "70px 96px 1fr 180px 110px",
                                gap: 16,
                                alignItems: "center",
                                padding: "14px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div style={{ fontFamily: "monospace", fontSize: 26, color: "#00eebb" }}>#{idx + 1}</div>

                            {c ? (
                                <CoverImage
                                    char={c}
                                    style={{
                                        width: 84,
                                        height: 110,
                                        objectFit: "contain",
                                        borderRadius: 12,
                                        background: "rgba(0,0,0,0.25)",
                                    }}
                                />
                            ) : (
                                <div style={{ width: 84, height: 110, borderRadius: 12, background: "#222" }} />
                            )}

                            <div>
                                <div style={{ fontSize: 22, lineHeight: 1.1 }}>{c ? c.work : r.bestCharId}</div>
                                <div style={{ fontSize: 16, opacity: 0.78 }}>
                                    {c ? `${c.artist} (${c.artistEn})` : ""}
                                </div>
                            </div>

                            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 30, color: "#00eebb" }}>
                                {r.score} pt
                            </div>

                            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 18, opacity: 0.85 }}>
                                {fmtTime(r.achieved_at)}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 18, opacity: 0.65, fontSize: 14 }}>※自動でタイトルに戻ります</div>
        </div>
    );
};