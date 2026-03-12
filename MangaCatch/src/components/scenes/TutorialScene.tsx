import React, { useState } from "react";

interface TutorialSceneProps {
    onEnded?: () => void;
    onSkip?: () => void;
}

export const TutorialScene: React.FC<TutorialSceneProps> = ({
    onEnded,
    onSkip,
}) => {
    const [failed, setFailed] = useState(false);

    const handleFinish = () => {
        if (onEnded) {
            onEnded();
            return;
        }
        if (onSkip) {
            onSkip();
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: "#000",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
            }}
        >
            {!failed ? (
                <video
                    src="/assets/tutorial/tutorial.mp4"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleFinish}
                    onError={() => setFailed(true)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#000",
                    }}
                />
            ) : (
                <div
                    style={{
                        color: "#fff",
                        fontFamily: "monospace",
                        fontSize: 28,
                        textAlign: "center",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    チュートリアル動画の読み込みに失敗しました。
                    {"\n"}
                    public/assets/tutorial/tutorial.mp4 を確認してください。
                </div>
            )}
        </div>
    );
};