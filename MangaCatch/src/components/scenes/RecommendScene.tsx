import * as CoverMod from "../CoverImage";
import * as CharMod from "../CharacterImage";
import type { CharacterData } from "../../constants/master";

export const RecommendScene = ({ bestChar }: { bestChar: CharacterData | null }) => {
  const CoverImageComp = (CoverMod as any).CoverImage ?? (CoverMod as any).default;
  const CharacterImageComp = (CharMod as any).CharacterImage ?? (CharMod as any).default;

  if (!bestChar) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      {/* ヘッダー */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 52, fontWeight: 900 }}>あなたが一番多く集めたのは</div>
        <div style={{ fontSize: 22, color: "#00eebb", fontWeight: 700, marginTop: 4 }}>
          The one you caught the most was
        </div>
      </div>

      {/* コンテンツ：表紙 ＋ テキスト ＋ キャラ */}
      <div
        style={{
          width: "min(1200px, 92vw)",
          display: "grid",
          gridTemplateColumns: "380px 1fr 380px",
          gap: 26,
          alignItems: "center",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: "24px 28px",
        }}
      >
        {/* 表紙 */}
        {CoverImageComp ? (
          <CoverImageComp
            char={bestChar}
            style={{
              width: "100%",
              height: 480,
              objectFit: "contain",
              borderRadius: 16,
              background: "rgba(0,0,0,0.22)",
            }}
          />
        ) : <div />}

        {/* テキスト */}
        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#00eebb" }}>
            {(bestChar as any).work ?? ""} <span style={{ color: "#fff" }}>です</span>
          </div>
          <div style={{ fontSize: 20, color: "#00eebb", fontWeight: 700 }}>
            {(bestChar as any).workEn ?? ""}
          </div>

          <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900 }}>
            {(bestChar as any).artist ?? ""} 先生 の
          </div>
          <div style={{ fontSize: 18, color: "#00eebb", fontWeight: 700 }}>
            {(bestChar as any).artistEn ?? ""}
          </div>

          <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900 }}>
            作品に出てきます
          </div>
        </div>

        {/* キャラクター */}
        <div style={{ display: "grid", placeItems: "center" }}>
          {CharacterImageComp ? (
            <CharacterImageComp
              char={bestChar}
              style={{
                width: 360,
                height: 400,
                objectFit: "contain",
                filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.65))",
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
