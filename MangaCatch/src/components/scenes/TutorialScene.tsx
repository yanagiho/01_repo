import React from "react";

export const TutorialScene: React.FC<{ onDone: () => void }> = ({ onDone }) => {
    return (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
            <div style={{ width: 720, maxWidth: "92vw", background: "rgba(0,0,0,0.55)", padding: 24, borderRadius: 16 }}>
                <div style={{ fontSize: 28, color: "#00eebb" }}>遊び方</div>
                <ul style={{ marginTop: 12, lineHeight: 1.8, opacity: 0.9 }}>
                    <li>マウスでカゴ（下の枠）を左右に動かします</li>
                    <li>落ちてくるキャラをキャッチするとスコア獲得</li>
                    <li>30秒で終了。いちばん取ったキャラが結果になります</li>
                </ul>
                <button
                    onClick={onDone}
                    style={{
                        marginTop: 16,
                        padding: "12px 18px",
                        fontSize: 16,
                        borderRadius: 12,
                        border: "2px solid #00eebb",
                        background: "transparent",
                        color: "#00eebb",
                        cursor: "pointer",
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );
};