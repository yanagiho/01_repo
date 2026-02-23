// MangaCatch/src/components/scenes/PhotoScene.tsx
import React, { useMemo } from "react";
import type { CharacterData } from "../../constants/master";
import { CoverImage } from "../CoverImage";

export const PhotoScene: React.FC<{ bestChar: CharacterData | null; score: number }> = ({ bestChar, score }) => {
    const nowText = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
    }, []);

    if (!bestChar) return null;

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center", color: "#fff" }}>
            {/* 記念撮影カード（以前寄せ：1枚絵っぽく） */}
            <div
                style={{
                    width: "min(1200px, 92vw)",
                    height: "min(680px, 86vh)",
                    borderRadius: 22,
                    background: "rgba(0,0,0,0.42)",
                    border: "2px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 22px 40px rgba(0,0,0,0.55)",
                    padding: 34,
                    display: "grid",
                    gridTemplateColumns: "420px 1fr",
                    gap: 28,
                }}
            >
                <CoverImage
                    char={bestChar}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 16,
                        background: "rgba(0,0,0,0.22)",
                    }}
                />

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontFamily: "monospace", opacity: 0.85 }}>{nowText}</div>

                    <div style={{ marginTop: 10, fontSize: 60, color: "#00eebb", lineHeight: 1.05 }}>{bestChar.work}</div>
                    <div style={{ marginTop: 6, fontSize: 22, opacity: 0.9 }}>{bestChar.workEn}</div>

                    <div style={{ marginTop: 14, fontSize: 30 }}>
                        {bestChar.artist} <span style={{ opacity: 0.72 }}>({bestChar.artistEn})</span>
                    </div>

                    <div style={{ marginTop: 22, fontSize: 40, fontFamily: "monospace" }}>
                        SCORE: <span style={{ color: "#00eebb" }}>{score}</span>
                    </div>

                    <div style={{ marginTop: 18, opacity: 0.65, fontSize: 14 }}>※自動で次へ進みます</div>
                </div>
            </div>
        </div>
    );
};