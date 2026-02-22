import React from "react";

export const ResultScene: React.FC<{ score: number; onNext: () => void }> = ({ score, onNext }) => {
    return (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, color: "#00eebb" }}>RESULT</div>
                <div style={{ marginTop: 12, fontSize: 28 }}>SCORE: {score}</div>
                <button
                    onClick={onNext}
                    style={{
                        marginTop: 20,
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