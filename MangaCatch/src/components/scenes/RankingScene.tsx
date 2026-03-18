
import { useMemo, useState } from "react";
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

function buildLogoCandidates(): string[] {
  return Array.from(
    new Set([
      "/assets/ui/mangacatch_title_logo.png",
      "/assets/ui/title_logo.png",
      "/assets/title_logo.png",
      "./assets/ui/mangacatch_title_logo.png",
      "./assets/ui/title_logo.png",
      "assets/ui/mangacatch_title_logo.png",
      "assets/ui/title_logo.png",
      "assets/title_logo.png",
    ])
  );
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

  const top = useMemo(() => ranking.slice(0, 5), [ranking]);
  const logoCandidates = useMemo(() => buildLogoCandidates(), []);
  const [logoIdx, setLogoIdx] = useState(0);

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
        placeItems: "center",
        color: "#fff",
        padding: 18,
      }}
    >
      <div
        style={{
          width: "min(1120px, 94vw)",
          height: "min(820px, 92vh)",
          display: "grid",
          gridTemplateColumns: "700px 320px",
          gap: 14,
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
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 42, fontWeight: 900 }}>ランキング</div>
            <div style={{ fontSize: 18, color: "#00eebb", fontWeight: 700 }}>Ranking</div>
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
                style={{
                  width: "min(620px, 96%)",
                  display: "grid",
                  gridTemplateColumns: "56px 80px 80px minmax(180px, 1fr) 96px",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "rgba(0,0,0,0.28)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: col,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 36,
                    fontWeight: 900,
                    textAlign: "right",
                  }}
                >
                  {rank}
                </div>

                <div
                  style={{
                    width: 80,
                    height: 80,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {c && CharacterImageComp ? (
                    <CharacterImageComp
                      char={c}
                      style={{
                        width: 75,
                        height: 75,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div style={{ opacity: 0.5 }}>-</div>
                  )}
                </div>

                <div
                  style={{
                    width: 80,
                    height: 80,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {c && CoverImageComp ? (
                    <CoverImageComp
                      char={c}
                      style={{
                        width: 75,
                        height: 75,
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
                      fontSize: 26,
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
                      fontSize: 20,
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
                      fontSize: 15,
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.94)",
                      lineHeight: 1.1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {work || " "}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      opacity: 0.9,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>
              本日のトップスコア
            </div>
            <div style={{ fontSize: 18, color: "#00eebb", fontWeight: 700, marginTop: 2 }}>
              Top Score
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 80,
                fontWeight: 900,
                color: "#ff3b30",
                lineHeight: 1.0,
                marginTop: 6,
              }}
            >
              {top[0]?.score ?? 0}
            </div>
          </div>

          {/* あなたのスコア */}
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>
              あなたのスコア
            </div>
            <div style={{ fontSize: 18, color: "#00eebb", fontWeight: 700, marginTop: 2 }}>
              You Score
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 80,
                fontWeight: 900,
                color: "#00eebb",
                lineHeight: 1.0,
                marginTop: 6,
              }}
            >
              {myScore ?? 0}
            </div>
          </div>

          <img
            src={logoCandidates[logoIdx]}
            alt="MANGA Catch!"
            onError={() => {
              if (logoIdx + 1 < logoCandidates.length) {
                setLogoIdx(logoIdx + 1);
              }
            }}
            style={{
              width: 260,
              height: "auto",
              marginTop: 4,
              opacity: 0.92,
              filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))",
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};