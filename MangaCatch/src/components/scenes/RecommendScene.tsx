// MangaCatch/src/components/scenes/RecommendScene.tsx
import React from "react";
import type { CharacterData } from "../../constants/master";
import { CoverImage } from "../CoverImage";
import { CharacterImage } from "../CharacterImage";

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
                }}
            >
                {/* 書影 */}
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

                {/* ★キャラを大きく */}
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, opacity: 0.85 }}>お気にいり</div>
                    <div style={{ marginTop: 8, fontSize: 40, color: "#00eebb" }}>{bestChar.work}</div>
                    <div style={{ marginTop: 8, fontSize: 20, opacity: 0.9 }}>
                        {bestChar.artist} <span style={{ opacity: 0.7 }}>({bestChar.artistEn})</span>
                    </div>

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

                    <div style={{ marginTop: 14, opacity: 0.65, fontSize: 14 }}>※自動で次へ進みます</div>
                </div>
            </div>
        </div>
    );
};