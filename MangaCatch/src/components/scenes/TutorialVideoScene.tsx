// MangaCatch/src/components/scenes/TutorialVideoScene.tsx
import React, { useEffect, useRef, useState } from "react";

export const TutorialVideoScene: React.FC<{
    onEnded: () => void;
    onUserSkip?: () => void;
}> = ({ onEnded, onUserSkip }) => {
    const doneRef = useRef(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [status, setStatus] = useState<"loading" | "playing" | "fallback">("loading");

    const finishOnce = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onEnded();
    };

    // 最終保険：何があっても進む
    useEffect(() => {
        const t = window.setTimeout(() => {
            console.warn("[TutorialVideo] failsafe -> go GAME");
            setStatus("fallback");
            finishOnce();
        }, 6500);
        return () => window.clearTimeout(t);
    }, []);

    // 読み込めたら play を強制（Electronで必要な場合がある）
    const tryPlay = async () => {
        const v = videoRef.current;
        if (!v) return;
        try {
            await v.play();
            setStatus("playing");
        } catch {
            // autoplay規制等で失敗→タップで再生できるが、無人筐体前提ならスキップ優先
            console.warn("[TutorialVideo] play() rejected -> fallback");
            setStatus("fallback");
            finishOnce();
        }
    };

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
                onLoadedMetadata={() => {
                    setStatus("playing");
                    tryPlay();
                }}
                onCanPlay={() => {
                    setStatus("playing");
                    tryPlay();
                }}
                onEnded={finishOnce}
                onError={() => {
                    console.warn("[TutorialVideo] error -> go GAME");
                    setStatus("fallback");
                    finishOnce();
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            <div style={{ position: "absolute", left: 16, bottom: 14, fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>
                tutorial video ({status}) / tap to skip
            </div>
        </div>
    );
};