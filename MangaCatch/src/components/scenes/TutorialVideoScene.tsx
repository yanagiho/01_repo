// MangaCatch/src/components/scenes/TutorialVideoScene.tsx
import React, { useEffect, useRef } from "react";

export const TutorialVideoScene: React.FC<{
    onEnded: () => void;
    onUserSkip?: () => void;
}> = ({ onEnded, onUserSkip }) => {
    const doneRef = useRef(false);
    const finishOnce = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onEnded();
    };

    // 何かあっても止まらない保険
    useEffect(() => {
        const t = window.setTimeout(() => finishOnce(), 4000);
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
                src={"assets/video/tutorial.mp4"}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={finishOnce}
                onError={finishOnce}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", left: 16, bottom: 14, fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>
                tutorial video (tap to skip)
            </div>
        </div>
    );
};