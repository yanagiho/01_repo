import * as CoverMod from "../CoverImage";
import * as CharMod from "../CharacterImage";
import type { CharacterData } from "../../constants/master";

export const RecommendScene = ({ bestChar }: { bestChar: CharacterData | null }) => {
  const CoverImageComp = (CoverMod as any).CoverImage ?? (CoverMod as any).default;
  const CharacterImageComp = (CharMod as any).CharacterImage ?? (CharMod as any).default;

  if (!bestChar) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center", color: "#fff" }}>
      <div
        style={{
          width: "min(1200px, 92vw)",
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 26,
          alignItems: "center",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: 22,
          position: "relative",
        }}
      >
        {CoverImageComp ? (
          <CoverImageComp
            char={bestChar}
            style={{
              width: "100%",
              height: 560,
              objectFit: "contain",
              borderRadius: 16,
              background: "rgba(0,0,0,0.22)",
            }}
          />
        ) : null}

        <div style={{ display: "grid", gridTemplateRows: "auto auto 1fr", gap: 10 }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 36, fontWeight: 900, opacity: 0.95 }}>作品紹介</div>

            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.95)" }}>
              アナタがキャッチしたのは
            </div>

            <div style={{ marginTop: 8, fontSize: 44, color: "#00eebb", fontWeight: 900 }}>
              {(bestChar as any).work ?? ""}
            </div>
            <div style={{ marginTop: 6, fontSize: 18, opacity: 0.85 }}>
              {(bestChar as any).workEn ?? ""}
            </div>

            <div style={{ marginTop: 14, fontSize: 26 }}>
              {(bestChar as any).artist ?? ""}
            </div>
            <div style={{ marginTop: 4, fontSize: 16, opacity: 0.85 }}>
              {(bestChar as any).artistEn ?? ""}
            </div>
          </div>

          <div style={{ display: "grid", justifyItems: "end", alignItems: "start", transform: "translateY(-90px)" }}>
            {CharacterImageComp ? (
              <CharacterImageComp
                char={bestChar}
                style={{
                  width: 520,
                  height: 520,
                  objectFit: "contain",
                  filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.65))",
                }}
              />
            ) : null}
          </div>

          <div />
        </div>
      </div>
    </div>
  );
};
