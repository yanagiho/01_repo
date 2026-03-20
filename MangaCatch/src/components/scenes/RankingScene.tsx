
import { useMemo } from "react";

const JP_FONT = "'Noto Sans CJK JP', 'Yu Gothic UI', 'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif";

const RANKING_STYLES = `
  @keyframes blinkBorder {
    0%, 100% { box-shadow: 0 0 0 2px rgba(0,238,187,0.85), 0 0 18px rgba(0,238,187,0.25); }
    50% { box-shadow: 0 0 0 2px rgba(0,238,187,0.0), 0 0 0 rgba(0,238,187,0); }
  }
  .ranking-me-row {
    animation: blinkBorder 1s ease-in-out infinite;
  }
`;
import type { RankingEntry } from "../../types/game";
import { getCharacterById } from "../../constants/master";
import * as CharMod from "../CharacterImage";
import * as CoverMod from "../CoverImage";

function fmtTime(ms: number) {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

function rankColor(rank: number) {
  if (rank === 1) return "#ff3b30";
  if (rank === 2) return "#ff9500";
  return "#00eebb";
}

export const RankingScene = ({
  ranking,
  highlightAchievedAt,
  myScore,
}: {
  ranking: RankingEntry[];
  highlightAchievedAt?: number;
  myScore?: number;
}) => {
  const CharacterImageComp =
    (CharMod as any).CharacterImage ?? (CharMod as any).default;
  const CoverImageComp =
    (CoverMod as any).CoverImage ?? (CoverMod as any).default;

  const top = useMemo(() => ranking.slice(0, 4), [ranking]);

  const youIndex = useMemo(() => {
    if (top.length === 0) return -1;
    if (highlightAchievedAt != null) {
      const matched = top.findIndex((r) => r.achieved_at === highlightAchievedAt);
      if (matched >= 0) return matched;
    }
    return top.length - 1;
  }, [top, highlightAchievedAt]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "grid",
        alignItems: "flex-start",
        justifyItems: "center",
        color: "#fff",
        padding: 18,
        paddingTop: 40,
      }}
    >
      <style>{RANKING_STYLES}</style>
      <div
        style={{
          width: "min(1600px, 96vw)",
          height: "min(900px, 94vh)",
          display: "grid",
          gridTemplateColumns: "1fr 540px",
          gap: 18,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {/* 左：ランキング一覧 */}
        <div
          style={{
            background: "rgba(0,0,0,0.38)",
            borderRadius: 18,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* タイトル */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 4, width: "100%" }}>
            <div style={{ fontSize: 80, fontWeight: 900, fontFamily: JP_FONT }}>ランキング</div>
            <div style={{ fontSize: 30, color: "#00eebb", fontWeight: 700, fontFamily: JP_FONT }}>Ranking</div>
          </div>

          {top.map((r, idx) => {
            const rank = idx + 1;
            const c = getCharacterById(r.bestCharId);
            const isMe = idx === youIndex;
            const col = rankColor(rank);

            const work = (c as any)?.work ?? (c as any)?.title ?? "";
            const artist = (c as any)?.artist ?? (c as any)?.author ?? "";

            return (
              <div
                key={`${rank}-${r.achieved_at}-${r.score}`}
                className={isMe ? "ranking-me-row" : undefined}
                style={{
                  width: "min(960px, 96%)",
                  display: "grid",
                  gridTemplateColumns: "70px 96px 96px minmax(200px, 1fr) 120px",
                  gap: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 24px",
                  borderRadius: 16,
                  background: isMe ? "rgba(0,238,187,0.08)" : "rgba(0,0,0,0.28)",
                  border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: col,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 48,
                    fontWeight: 900,
                    textAlign: "right",
                  }}
                >
                  {rank}
                </div>

                <div
                  style={{
                    width: 96,
                    height: 96,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {c && CharacterImageComp ? (
                    <CharacterImageComp
                      char={c}
                      style={{
                        width: 88,
                        height: 88,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div style={{ opacity: 0.5 }}>-</div>
                  )}
                </div>

                <div
                  style={{
                    width: 96,
                    height: 96,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {c && CoverImageComp ? (
                    <CoverImageComp
                      char={c}
                      style={{
                        width: 88,
                        height: 88,
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <div style={{ opacity: 0.5 }}>-</div>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 38,
                      fontWeight: 900,
                      lineHeight: 1.0,
                    }}
                  >
                    {r.score}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: "monospace",
                      fontSize: 26,
                      fontWeight: 900,
                      opacity: 0.78,
                      lineHeight: 1.0,
                    }}
                  >
                    {fmtTime(r.achieved_at)}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 22,
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.94)",
                      lineHeight: 1.1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: JP_FONT,
                    }}
                  >
                    {work || " "}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 18,
                      opacity: 0.9,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: JP_FONT,
                    }}
                  >
                    {artist || " "}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    minHeight: 36,
                  }}
                >
                  {isMe ? (
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 28,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "#00eebb",
                        border: "2px solid rgba(0,238,187,0.7)",
                        borderRadius: 999,
                        padding: "6px 12px",
                        background: "rgba(0,238,187,0.12)",
                      }}
                    >
                      YOU
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* 右：スコア情報ブロック */}
        <div
          style={{
            background: "rgba(0,0,0,0.30)",
            borderRadius: 18,
            padding: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* 本日のトップスコア */}
          <div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, fontFamily: JP_FONT }}>
              本日のトップスコア
            </div>
            <div style={{ fontSize: 26, color: "#00eebb", fontWeight: 700, marginTop: 4, fontFamily: JP_FONT }}>
              Top Score
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 130,
                fontWeight: 900,
                color: "#ff3b30",
                lineHeight: 1.0,
                marginTop: 8,
              }}
            >
              {top[0]?.score ?? 0}
            </div>
          </div>

          {/* あなたのスコア */}
          <div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, fontFamily: JP_FONT }}>
              あなたのスコア
            </div>
            <div style={{ fontSize: 26, color: "#00eebb", fontWeight: 700, marginTop: 4, fontFamily: JP_FONT }}>
              You Score
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 130,
                fontWeight: 900,
                color: "#00eebb",
                lineHeight: 1.0,
                marginTop: 8,
              }}
            >
              {myScore ?? 0}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};