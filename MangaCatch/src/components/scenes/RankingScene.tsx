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
            <div style={{ fontSize: 44, color: "#00eebb" }}>RANKING</div>

            <div style={{ marginTop: 18, background: "rgba(0,0,0,0.38)", borderRadius: 18, padding: 16, maxWidth: 1100 }}>
                {top.length === 0 && <div style={{ opacity: 0.75 }}>記録がありません</div>}

                {top.map((r, idx) => {
                    const c = getCharacterById(r.bestCharId);
                    return (
                        <div
                            key={`${idx}-${r.score}-${r.achieved_at}`}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "60px 86px 1fr 160px 90px",
                                gap: 14,
                                alignItems: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div style={{ fontFamily: "monospace", fontSize: 20, color: "#00eebb" }}>#{idx + 1}</div>

                            {c ? (
                                <CoverImage char={c} style={{ width: 72, height: 96, objectFit: "contain", borderRadius: 10, background: "rgba(0,0,0,0.25)" }} />
                            ) : (
                                <div style={{ width: 72, height: 96, borderRadius: 10, background: "#222" }} />
                            )}

                            <div>
                                <div style={{ fontSize: 16 }}>{c ? c.work : r.bestCharId}</div>
                                <div style={{ fontSize: 12, opacity: 0.75 }}>{c ? `${c.artist} (${c.artistEn})` : ""}</div>
                            </div>

                            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 22, color: "#00eebb" }}>{r.score} pt</div>
                            <div style={{ textAlign: "right", fontFamily: "monospace", opacity: 0.8 }}>{fmtTime(r.achieved_at)}</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 18, opacity: 0.65, fontSize: 14 }}>※自動でタイトルに戻ります</div>
        </div>
    );
};