import type { RankingEntry } from "../../types/game";
import { getCharacterById } from "../../constants/master";
import { CharacterImage } from "../CharacterImage";
import { CoverImage } from "../CoverImage";
import { useMemo, useState } from "react";

function fmtTime(ms: number) {
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
}

function rankColor(rank: number) {
    if (rank === 1) return "#ff3b30"; // 赤
    if (rank === 2) return "#ff9500"; // オレンジ
    if (rank === 3) return "#ffd60a"; // 黄色
    if (rank === 4 || rank === 5) return "#00eebb"; // 緑
    return "rgba(255,255,255,0.85)";
}

function buildLogoCandidates(): string[] {
    return Array.from(
        new Set([
            "/assets/ui/mangacatch_title_logo.png",
            "/assets/ui/title_logo.png",
            "/assets/title_logo.png",
            "./assets/ui/mangacatch_title_logo.png",
            "./assets/ui/title_logo.png",
            "./assets/title_logo.png",
            "assets/ui/mangacatch_title_logo.png",
            "assets/ui/title_logo.png",
            "assets/title_logo.png",
        ])
    );
}

export const RankingScene: React.FC<{
    ranking: RankingEntry[];
    highlightAchievedAt?: number;
}> = ({ ranking, highlightAchievedAt }) => {
    const top = useMemo(() => ranking.slice(0, 5), [ranking]);
    const logoCandidates = useMemo(() => buildLogoCandidates(), []);
    const [logoIdx, setLogoIdx] = useState(0);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 28, color: "#fff" }}>
            <style>{`
        @keyframes blinkRow {
          0% { opacity: 0.35; }
          50% { opacity: 1; }
          100% { opacity: 0.35; }
        }
      `}</style>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, alignItems: "start" }}>
                {/* 左：ランキング */}
                <div
                    style={{
                        background: "rgba(0,0,0,0.38)",
                        borderRadius: 18,
                        padding: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                        minHeight: 520,
                    }}
                >
                    <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Today ranking</div>

                    {top.map((r, idx) => {
                        const rank = idx + 1;
                        const c = getCharacterById(r.bestCharId);
                        const isMe = highlightAchievedAt != null && r.achieved_at === highlightAchievedAt;
                        const col = rankColor(rank);

                        return (
                            <div
                                key={`${rank}-${r.achieved_at}-${r.score}`}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "70px 90px 90px 1fr 110px",
                                    gap: 14,
                                    alignItems: "center",
                                    padding: "12px 12px",
                                    borderRadius: 14,
                                    marginBottom: 10,
                                    background: "rgba(0,0,0,0.28)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    animation: isMe ? "blinkRow 1.0s ease-in-out infinite" : "none",
                                    color: col, // ★文字も順位色に
                                }}
                            >
                                {/* 順位（#なし） */}
                                <div style={{ fontFamily: "monospace", fontSize: 42, fontWeight: 900, textAlign: "center" }}>
                                    {rank}
                                </div>

                                {/* キャラ */}
                                <div style={{ width: 90, height: 90, display: "grid", placeItems: "center" }}>
                                    {c ? (
                                        <CharacterImage char={c} style={{ width: 86, height: 86, objectFit: "contain" }} />
                                    ) : (
                                        <div style={{ opacity: 0.5 }}>-</div>
                                    )}
                                </div>

                                {/* 書影 */}
                                <div style={{ width: 90, height: 90, display: "grid", placeItems: "center" }}>
                                    {c ? (
                                        <CoverImage char={c} style={{ width: 86, height: 86, objectFit: "contain", borderRadius: 8 }} />
                                    ) : (
                                        <div style={{ opacity: 0.5 }}>-</div>
                                    )}
                                </div>

                                {/* スコア・時刻 */}
                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: 34, fontWeight: 900 }}>
                                        {r.score}
                                    </div>
                                    <div style={{ fontFamily: "monospace", fontSize: 14, opacity: 0.9 }}>
                                        {fmtTime(r.achieved_at)}
                                    </div>
                                </div>

                                <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 16, opacity: 0.95 }}>
                                    {isMe ? "YOU" : ""}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 右：ロゴなど */}
                <div
                    style={{
                        height: "100%",
                        background: "rgba(0,0,0,0.30)",
                        borderRadius: 18,
                        padding: 18,
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "grid",
                        alignContent: "start",
                        gap: 14,
                    }}
                >
                    <div style={{ fontSize: 46, fontWeight: 900, color: "#00eebb" }}>RANKING</div>

                    <div style={{ fontFamily: "monospace", fontSize: 16, opacity: 0.85 }}>TOP SCORE</div>
                    <div style={{ fontFamily: "monospace", fontSize: 56, fontWeight: 900, color: "#00eebb" }}>
                        {top[0]?.score ?? 0}
                    </div>

                    <div style={{ marginTop: 18, display: "grid", placeItems: "center" }}>
                        <img
                            src={logoCandidates[logoIdx]}
                            alt="MANGA Catch!"
                            onError={() => {
                                if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                            }}
                            style={{ width: 320, opacity: 0.92, filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))" }}
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};