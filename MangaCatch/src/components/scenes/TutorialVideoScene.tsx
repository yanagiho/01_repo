// MangaCatch/src/components/scenes/TutorialVideoScene.tsx
import React, { useEffect, useRef } from "react";

export const TutorialVideoScene: React.FC<{
    onEnded: () => void;
    onUserSkip?: () => void;
}> = ({ onEnded, onUserSkip }) => {
    const doneRef = useRef(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const finishOnce = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onEnded();
    };

    // 何があっても止まらない最終保険（5秒）
    useEffect(() => {
        const t = window.setTimeout(() => {
            console.warn("[TutorialVideo] failsafe -> go GAME");
            finishOnce();
        }, 5000);
        return () => window.clearTimeout(t);
    }, []);

    // 再生開始できない場合の早期スキップ（1.2秒）
    useEffect(() => {
        const t = window.setTimeout(() => {
            const v = videoRef.current;
            // readyState: 0〜4（2以上なら再生可能なデータがある）
            if (!v || v.readyState < 2) {
                console.warn("[TutorialVideo] not playable -> go GAME");
                finishOnce();
            }
        }, 1200);
        return () => window.clearTimeout(t);
    }, []);

    return (
        <div
            onPointerDown={() => {
                onUserSkip?.();
                finishOnce();
            }}
            style={{ position: "absolute", inset: 0, zIndex: 20, background: "#000", cursor: "pointer" }}
        >
            <video
                ref={videoRef}
                src={"assets/video/tutorial.mp4"}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={finishOnce}
                onError={() => {
                    console.warn("[TutorialVideo] error -> go GAME");
                    finishOnce();
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", left: 16, bottom: 14, fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>
                tutorial video (tap to skip)
            </div>
        </div>
    );
};