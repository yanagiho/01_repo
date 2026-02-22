import React from "react";
import type { RankingEntry } from "../../types/game";
import { getCharacterById } from "../../constants/master";

export const RankingScene: React.FC<{
    ranking: RankingEntry[];
    onBack: () => void;
}> = ({ ranking, onBack }) => {
    return (
        <div style={{ position: "absolute", inset: 0, padding: 32, color: "#fff" }}>
            <div style={{ fontSize: 42, color: "#00eebb" }}>TODAY RANKING</div>

            <div style={{ marginTop: 18, background: "rgba(0,0,0,0.45)", borderRadius: 16, padding: 16 }}>
                {ranking.length === 0 && <div style={{ opacity: 0.8 }}>まだ記録がありません</div>}
                {ranking.slice(0, 10).map((r, i) => {
                    const c = getCharacterById(r.bestCharId);
                    return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 6px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <div>
                                #{i + 1}　{c ? `${c.artist} / ${c.name}` : r.bestCharId}
                            </div>
                            <div>{r.score} pt</div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={onBack}
                style={{
                    marginTop: 18,
                    padding: "12px 18px",
                    fontSize: 16,
                    borderRadius: 12,
                    border: "2px solid #00eebb",
                    background: "transparent",
                    color: "#00eebb",
                    cursor: "pointer",
                }}
            >
                タイトルへ
            </button>
        </div>
    );
};