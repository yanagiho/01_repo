// MangaCatch/src/components/scenes/ResultScene.tsx
import React, { useMemo } from "react";
import { getCharacterById } from "../../constants/master";
import { CharacterImage } from "../CharacterImage";

export const ResultScene: React.FC<{ score: number; counts: Record<string, number> }> = ({ score, counts }) => {
    const best = useMemo(() => {
        let bestId = "";
        let bestCnt = -1;
        for (const [id, cnt] of Object.entries(counts)) {
            if (cnt > bestCnt) {
                bestCnt = cnt;
                bestId = id;
            }
        }
        const c = bestId ? getCharacterById(bestId) : null;
        return { char: c, cnt: bestCnt };
    }, [counts]);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center", color: "#fff" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 46, color: "#00eebb" }}>RESULT</div>

                {best.char && (
                    <div style={{ marginTop: 18 }}>
                        <CharacterImage
                            char={best.char}
                            style={{
                                width: 320,
                                height: 320,
                                objectFit: "contain",
                                filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.65))",
                            }}
                        />
                        <div style={{ marginTop: 12, fontSize: 22, opacity: 0.9 }}>
                            MOST CATCH: {best.cnt}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 16, fontFamily: "monospace", fontSize: 40 }}>
                    SCORE: <span style={{ color: "#00eebb" }}>{score}</span>
                </div>

                <div style={{ marginTop: 14, opacity: 0.65, fontSize: 12 }}>※自動で次へ進みます</div>
            </div>
        </div>
    );
};