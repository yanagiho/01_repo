import type { CharacterData } from "../../constants/master";
import { CoverImage } from "../CoverImage";
import { CharacterImage } from "../CharacterImage";

const COPYRIGHT_JP = "© Springbless";

export const RecommendScene: React.FC<{ bestChar: CharacterData | null }> = ({ bestChar }) => {
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
                <CoverImage
                    char={bestChar}
                    style={{
                        width: "100%",
                        height: 560,
                        objectFit: "contain",
                        borderRadius: 16,
                        background: "rgba(0,0,0,0.22)",
                    }}
                />

                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, opacity: 0.85 }}>作品紹介</div>

                    <div style={{ marginTop: 10, fontSize: 44, color: "#00eebb", fontWeight: 900 }}>{bestChar.work}</div>
                    <div style={{ marginTop: 6, fontSize: 18, opacity: 0.85 }}>{bestChar.workEn}</div>

                    <div style={{ marginTop: 14, fontSize: 26 }}>{bestChar.artist}</div>
                    <div style={{ marginTop: 4, fontSize: 16, opacity: 0.85 }}>{bestChar.artistEn}</div>

                    <div style={{ marginTop: 18 }}>
                        <CharacterImage
                            char={bestChar}
                            style={{
                                width: 520,
                                height: 520,
                                objectFit: "contain",
                                filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.65))",
                            }}
                        />
                    </div>
                </div>

                <div style={{ position: "absolute", left: 18, bottom: 14, fontSize: 12, opacity: 0.75 }}>
                    {COPYRIGHT_JP}
                </div>
            </div>
        </div>
    );
};