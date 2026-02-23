// MangaCatch/src/components/scenes/PhotoScene.tsx
import React, { useMemo, useState } from "react";
import type { CharacterData } from "../../constants/master";
import { CoverImage } from "../CoverImage";
import { CharacterImage } from "../CharacterImage";

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function buildLogoCandidates(): string[] {
    const b = baseUrl();
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

export const PhotoScene: React.FC<{ bestChar: CharacterData | null; score: number }> = ({
    bestChar,
    score,
}) => {
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
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                display: "grid",
                placeItems: "center",
                color: "#fff",
            }}
        >
            <div
                style={{
                    width: "min(1280px, 96vw)",
                    height: "min(720px, 90vh)",
                    borderRadius: 22,
                    background: "rgba(0,0,0,0.40)",
                    border: "2px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 22px 40px rgba(0,0,0,0.55)",
                    padding: 18,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* 右上：得点と日付（大きく） */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 18,
                        textAlign: "right",
                        zIndex: 20,
                        textShadow: "0 3px 10px rgba(0,0,0,0.75)",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "monospace",
                            fontSize: 44,
                            fontWeight: 800,
                            color: "#00eebb",
                        }}
                    >
                        SCORE {score}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 22, opacity: 0.92 }}>
                        {nowText}
                    </div>
                </div>

                {/* レイアウト：書影（左）／空間（中央：表示なし）／キャラ（右） */}
                <div
                    style={{
                        position: "absolute",
                        left: 18,
                        right: 18,
                        top: 84,
                        bottom: 80,
                        display: "grid",
                        gridTemplateColumns: "360px 1fr 360px",
                        gap: 18,
                        alignItems: "center",
                    }}
                >
                    {/* 書影 */}
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

                    {/* ★中央スペース：何も描画しない（撮影対象に余計なUIを出さない） */}
                    <div />

                    {/* ★キャラ：少し上に移動してロゴと重ならないようにする */}
                    <div
                        style={{
                            display: "grid",
                            placeItems: "center",
                            // ここで上に持ち上げる（必要なら数値を増減）
                            transform: "translateY(-36px)",
                        }}
                    >
                        <CharacterImage
                            char={bestChar}
                            style={{
                                width: 420,
                                height: 420,
                                objectFit: "contain",
                                filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.65))",
                            }}
                        />
                    </div>
                </div>

                {/* 右下：ロゴ（重ならないよう固定） */}
                <img
                    src={logoCandidates[logoIdx]}
                    alt="MANGA Catch!"
                    onError={() => {
                        if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                    }}
                    style={{
                        position: "absolute",
                        right: 18,
                        bottom: 16,
                        width: 320,
                        opacity: 0.92,
                        zIndex: 10,
                        filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))",
                        pointerEvents: "none",
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
};