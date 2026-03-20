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
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 96, fontWeight: 900 }}>あなたが一番多く集めたのは</div>
        <div style={{ fontSize: 36, color: "#00eebb", fontWeight: 700, marginTop: 6 }}>
          The one you caught the most was
        </div>
      </div>

      {/* コンテンツ：表紙 ＋ テキスト ＋ キャラ */}
      <div
        style={{
          width: "min(1600px, 96vw)",
          display: "grid",
          gridTemplateColumns: "360px 1fr 420px",
          gap: 32,
          alignItems: "center",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: "28px 36px",
        }}
      >
        {/* 表紙 */}
        {CoverImageComp ? (
          <CoverImageComp
            char={bestChar}
            style={{
              width: "100%",
              height: 650,
              objectFit: "contain",
              borderRadius: 16,
              background: "rgba(0,0,0,0.22)",
            }}
          />
        ) : <div />}

        {/* テキスト */}
        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 96, fontWeight: 900, color: "#fff", whiteSpace: "nowrap" }}>
            {(bestChar as any).name ?? ""} <span style={{ color: "#fff" }}>です</span>
          </div>
          <div style={{ fontSize: 36, color: "#00eebb", fontWeight: 700, whiteSpace: "nowrap" }}>
            {(bestChar as any).nameEn ?? ""}
          </div>

          <div style={{ marginTop: 16, fontSize: 60, fontWeight: 900, whiteSpace: "nowrap" }}>
            {(bestChar as any).artist ?? ""} 先生 の
          </div>
          <div style={{ fontSize: 32, color: "#00eebb", fontWeight: 700, whiteSpace: "nowrap" }}>
            {(bestChar as any).artistEn ?? ""}
          </div>

          <div style={{ marginTop: 16, fontSize: 60, fontWeight: 900 }}>
            作品に出てきます
          </div>
        </div>

        {/* キャラクター */}
        <div style={{ display: "grid", placeItems: "center", height: 650 }}>
          {CharacterImageComp ? (
            <CharacterImageComp
              char={bestChar}
              style={{
                width: "100%",
                height: "100%",
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
