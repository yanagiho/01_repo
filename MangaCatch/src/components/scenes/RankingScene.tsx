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
}: {
  ranking: RankingEntry[];
  highlightAchievedAt?: number;
}) => {
  const CharacterImageComp =
    (CharMod as any).CharacterImage ?? (CharMod as any).default;
  const CoverImageComp =
    (CoverMod as any).CoverImage ?? (CoverMod as any).default;

  const top = useMemo(() => ranking.slice(0, 5), [ranking]);
  const logoCandidates = useMemo(() => buildLogoCandidates(), []);
  const [logoIdx, setLogoIdx] = useState(0);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        padding: 18,
        color: "#fff",
      }}
    >
      <style>{`
        @keyframes blinkRow {
          0% { opacity: 0.35; }
          50% { opacity: 1; }
          100% { opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 10,
          alignItems: "start",
          height: "100%",
        }}
      >
        {/* 左：ランキング一覧 */}
        <div
          style={{
            background: "rgba(0,0,0,0.38)",
            borderRadius: 18,
            padding: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: 520,
          }}
        >
          {top.map((r, idx) => {
            const rank = idx + 1;
            const c = getCharacterById(r.bestCharId);
            const isMe =
              highlightAchievedAt != null &&
              r.achieved_at === highlightAchievedAt;
            const col = rankColor(rank);

            const work = (c as any)?.work ?? (c as any)?.title ?? "";
            const artist = (c as any)?.artist ?? (c as any)?.author ?? "";

            return (
              <div
                key={`${rank}-${r.achieved_at}-${r.score}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "58px 40px 40px 1fr 80px",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 10px 10px 18px",
                  borderRadius: 14,
                  marginBottom: 8,
                  background: "rgba(0,0,0,0.28)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  animation: isMe
                    ? "blinkRow 1.0s ease-in-out infinite"
                    : "none",
                  color: col,
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 34,
                    fontWeight: 900,
                    textAlign: "right",
                  }}
                >
                  {rank}
                </div>

                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "grid",
                    placeItems: "center",
                    justifySelf: "start",
                  }}
                >
                  {c && CharacterImageComp ? (
                    <CharacterImageComp
                      char={c}
                      style={{
                        width: 34,
                        height: 34,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div style={{ opacity: 0.5 }}>-</div>
                  )}
                </div>

                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "grid",
                    placeItems: "center",
                    justifySelf: "start",
                  }}
                >
                  {c && CoverImageComp ? (
                    <CoverImageComp
                      char={c}
                      style={{
                        width: 34,
                        height: 34,
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
                    }}
                  >
                    {r.score}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontFamily: "monospace",
                      fontSize: 22,
                      fontWeight: 900,
                      opacity: 0.75,
                    }}
                  >
                    {fmtTime(r.achieved_at)}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.92)",
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
                      marginTop: 2,
                      fontSize: 12,
                      opacity: 0.88,
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
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: 24,
                    fontWeight: 900,
                    opacity: 0.95,
                  }}
                >
                  {isMe ? "YOU" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {/* 右：中央揃え情報エリア */}
        <div
          style={{
            height: "100%",
            background: "rgba(0,0,0,0.30)",
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 62,
              fontWeight: 900,
              color: "#00eebb",
              lineHeight: 1.0,
              marginTop: 2,
            }}
          >
            RANKING
          </div>

          <div
            style={{
              marginTop: 28,
              fontFamily: "monospace",
              fontSize: 42,
              fontWeight: 900,
              opacity: 0.9,
              lineHeight: 1.0,
            }}
          >
            TOP SCORE
          </div>

          <div
            style={{
              marginTop: 22,
              fontFamily: "monospace",
              fontSize: 54,
              fontWeight: 900,
              color: "#00eebb",
              lineHeight: 1.0,
            }}
          >
            {top[0]?.score ?? 0}
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              width: "100%",
              display: "grid",
              placeItems: "center",
              paddingBottom: 10,
            }}
          >
            <img
              src={logoCandidates[logoIdx]}
              alt="MANGA Catch!"
              onError={() => {
                if (logoIdx + 1 < logoCandidates.length) {
                  setLogoIdx(logoIdx + 1);
                }
              }}
              style={{
                width: 360,
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