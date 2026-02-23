// MangaCatch/src/components/scenes/PhotoScene.tsx
import React, { useMemo, useState } from "react";
import type { CharacterData } from "../../constants/master";
import { CoverImage } from "../CoverImage";
import { CharacterImage } from "../CharacterImage";

function buildLogoCandidates(): string[] {
    const base = ((import.meta as any)?.env?.BASE_URL ?? "/");
    const b = base.endsWith("/") ? base : base + "/";
    return Array.from(
        new Set([
            b + "assets/ui/mangacatch_title_logo.png",
            b + "assets/ui/title_logo.png",
            b + "assets/title_logo.png",
            "/assets/ui/mangacatch_title_logo.png",
            "/assets/title_logo.png",
            "./assets/ui/mangacatch_title_logo.png",
            "./assets/title_logo.png",
        ])
    );
}

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

    const logoCandidates = useMemo(() => buildLogoCandidates(), []);
    const [logoIdx, setLogoIdx] = useState(0);

    if (!bestChar) return null;

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center", color: "#fff" }}>
            <div
                style={{
                    width: "min(1220px, 94vw)",
                    height: "min(700px, 88vh)",
                    borderRadius: 22,
                    background: "rgba(0,0,0,0.40)",
                    border: "2px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 22px 40px rgba(0,0,0,0.55)",
                    padding: 28,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* ロゴ */}
                <img
                    src={logoCandidates[logoIdx]}
                    alt="MANGA Catch!"
                    onError={() => {
                        if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                    }}
                    style={{
                        position: "absolute",
                        top: 18,
                        left: 18,
                        width: 320,
                        opacity: 0.92,
                        filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))",
                    }}
                    draggable={false}
                />

                {/* 日付 */}
                <div style={{ position: "absolute", top: 22, right: 22, fontFamily: "monospace", fontSize: 18, opacity: 0.9 }}>
                    {nowText}
                </div>

                {/* レイアウト */}
                <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 22, height: "100%", paddingTop: 72 }}>
                    {/* 書影 */}
                    <div style={{ display: "grid", placeItems: "center" }}>
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
                    </div>

                    {/* キャラ＋スコア */}
                    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
                        <CharacterImage
                            char={bestChar}
                            style={{
                                width: 420,
                                height: 420,
                                objectFit: "contain",
                                filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.65))",
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                bottom: 28,
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                fontFamily: "monospace",
                                fontSize: 44,
                            }}
                        >
                            SCORE: <span style={{ color: "#00eebb" }}>{score}</span>
                        </div>
                    </div>
                </div>

                <div style={{ position: "absolute", bottom: 16, left: 20, opacity: 0.65, fontSize: 14 }}>
                    ※自動で次へ進みます
                </div>
            </div>
        </div>
    );
};