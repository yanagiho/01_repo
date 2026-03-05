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
    if (rank === 1) return "#ff3b30";
    if (rank === 2) return "#ff9500";
    if (rank === 3) return "#ffd60a";
    if (rank === 4 || rank === 5) return "#00eebb";
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
            "./assets/ui/title_logo.png",
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
                {/* 左 */}
                <div
                    style={{
                        background: "rgba(0,0,0,0.38)",
                        borderRadius: 18,
                        padding: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                        minHeight: 520,
                    }}
                >
                    {top.map((r, idx) => {
                        const rank = idx + 1;
                        const c = getCharacterById(r.bestCharId);
                        const isMe = highlightAchievedAt != null && r.achieved_at === highlightAchievedAt;
                        const col = rankColor(rank);

                        const work = (c as any)?.work ?? (c as any)?.title ?? "";
                        const artist = (c as any)?.artist ?? (c as any)?.author ?? "";

                        return (
                            <div
                                key={`${rank}-${r.achieved_at}-${r.score}`}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "70px 92px 92px 1fr 120px",
                                    gap: 14,
                                    alignItems: "center",
                                    padding: "12px 12px",
                                    borderRadius: 14,
                                    marginBottom: 10,
                                    background: "rgba(0,0,0,0.28)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    animation: isMe ? "blinkRow 1.0s ease-in-out infinite" : "none",
                                    color: col,
                                }}
                            >
                                <div style={{ fontFamily: "monospace", fontSize: 42, fontWeight: 900, textAlign: "center" }}>
                                    {rank}
                                </div>

                                <div style={{ width: 92, height: 92, display: "grid", placeItems: "center", transform: "translateY(-6px)" }}>
                                    {c ? <CharacterImage char={c} style={{ width: 88, height: 88, objectFit: "contain" }} /> : <div style={{ opacity: 0.5 }}>-</div>}
                                </div>

                                <div style={{ width: 92, height: 92, display: "grid", placeItems: "center", transform: "translateY(-6px)" }}>
                                    {c ? <CoverImage char={c} style={{ width: 88, height: 88, objectFit: "contain", borderRadius: 10 }} /> : <div style={{ opacity: 0.5 }}>-</div>}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontFamily: "monospace", fontSize: 34, fontWeight: 900 }}>{r.score}</div>
                                    <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: "rgba(255,255,255,0.92)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {work || " "}
                                    </div>
                                    <div style={{ marginTop: 2, fontSize: 14, opacity: 0.88, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {artist || " "}
                                    </div>
                                    <div style={{ marginTop: 3, fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>
                                        {fmtTime(r.achieved_at)}
                                    </div>
                                </div>

                                <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 34, fontWeight: 900, opacity: 0.95 }}>
                                    {isMe ? "YOU" : ""}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 右 */}
                <div
                    style={{
                        height: "100%",
                        background: "rgba(0,0,0,0.30)",
                        borderRadius: 18,
                        padding: 18,
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <div style={{ fontSize: 46, fontWeight: 900, color: "#00eebb" }}>RANKING</div>

                    {/* ★TOP SCORE を点数と同じ大きさに */}
                    <div style={{ fontFamily: "monospace", fontSize: 56, fontWeight: 900, opacity: 0.85 }}>
                        TOP SCORE
                    </div>

                    <div style={{ fontFamily: "monospace", fontSize: 56, fontWeight: 900, color: "#00eebb" }}>
                        {top[0]?.score ?? 0}
                    </div>

                    <div style={{ fontFamily: "monospace", fontSize: 14, opacity: 0.75 }}>
                        {top[0] ? fmtTime(top[0].achieved_at) : ""}
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ display: "grid", placeItems: "center", paddingBottom: 6 }}>
                        <img
                            src={logoCandidates[logoIdx]}
                            alt="MANGA Catch!"
                            onError={() => {
                                if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                            }}
                            style={{
                                width: 260,
                                height: "auto",
                                opacity: 0.92,
                                filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))",
                            }}
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};