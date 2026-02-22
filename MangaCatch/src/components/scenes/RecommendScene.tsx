import React from "react";
import type { CharacterData } from "../../constants/master";
import { CharacterImage } from "../CharacterImage";

export const RecommendScene: React.FC<{
    bestChar: CharacterData;
    onNext: () => void;
}> = ({ bestChar, onNext }) => {
    return (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, opacity: 0.9 }}>あなたが一番集めたのは…</div>

                <div style={{ marginTop: 14 }}>
                    <CharacterImage char={bestChar} style={{ width: 320, height: 320, objectFit: "contain" }} />
                </div>

                <div style={{ marginTop: 10, fontSize: 30, color: "#00eebb" }}>{bestChar.work}</div>
                <div style={{ marginTop: 6, fontSize: 22 }}>{bestChar.artist} 先生</div>

                <button
                    onClick={onNext}
                    style={{
                        marginTop: 18,
                        padding: "12px 18px",
                        fontSize: 16,
                        borderRadius: 12,
                        border: "2px solid #00eebb",
                        background: "transparent",
                        color: "#00eebb",
                        cursor: "pointer",
                    }}
                >
                    次へ
                </button>
            </div>
        </div>
    );
};