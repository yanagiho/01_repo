import { useMemo } from "react";
import { getCharacterById } from "../../constants/master";
import * as CharMod from "../CharacterImage";

function rankColor(rank: number) {
  if (rank === 1) return "#ff3b30";
  if (rank === 2) return "#ff9500";
  return "#00eebb";
}

export const ResultScene = ({ score, counts }: { score: number; counts: Record<string, number> }) => {
  const CharacterImageComp = (CharMod as any).CharacterImage ?? (CharMod as any).default;

  const { rows, max } = useMemo(() => {
    const list: { id: string; cnt: number }[] = [];
    for (const [id, cnt] of Object.entries(counts)) list.push({ id, cnt });
    list.sort((a, b) => b.cnt - a.cnt);
    const top10 = list.slice(0, 10);
    const m = Math.max(1, ...top10.map((r) => r.cnt));
    return { rows: top10, max: m };
  }, [counts]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 26, color: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, height: "100%" }}>
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            borderRadius: 18,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r, idx) => {
              const rank = idx + 1;
              const col = rankColor(rank);
              const c = getCharacterById(r.id);

              const work = (c as any)?.work ?? (c as any)?.title ?? "";
              const artist = (c as any)?.artist ?? (c as any)?.author ?? "";
              const w = Math.round((r.cnt / max) * 100);

              return (
                <div
                  key={`${rank}-${r.id}-${r.cnt}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 96px 1fr 90px",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 10px",
                    borderRadius: 14,
                    background: "rgba(0,0,0,0.28)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 34,
                      fontWeight: 900,
                      color: col,
                      textAlign: "center",
                    }}
                  >
                    {rank}
                  </div>

                  <div style={{ width: 96, height: 96, display: "grid", placeItems: "center" }}>
                    {c && CharacterImageComp ? (
                      <CharacterImageComp
                        char={c}
                        style={{ width: 92, height: 92, objectFit: "contain" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 92,
                          height: 92,
                          borderRadius: 12,
                          border: "2px dashed rgba(255,255,255,0.14)",
                        }}
                      />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>
                      {work || " "}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 16, opacity: 0.9, lineHeight: 1.1 }}>
                      {artist || " "}
                    </div>

                    <div style={{ marginTop: 10, height: 18 }}>
                      <div
                        style={{
                          width: `${w}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: col,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 34,
                      fontWeight: 900,
                      color: col,
                      textAlign: "right",
                    }}
                  >
                    {r.cnt}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.30)",
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: 54, fontWeight: 900, color: "#00eebb" }}>RESULT</div>
          <div style={{ fontSize: 54, fontWeight: 900, opacity: 0.85 }}>SCORE</div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: 72,
              fontWeight: 900,
              color: "#00eebb",
              textShadow: "0 4px 16px rgba(0,0,0,0.85)",
            }}
          >
            {score}
          </div>

          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
};
