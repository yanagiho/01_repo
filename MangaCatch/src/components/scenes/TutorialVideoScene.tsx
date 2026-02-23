// MangaCatch/src/components/scenes/TutorialVideoScene.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

function baseUrl(): string {
    const b = (import.meta as any)?.env?.BASE_URL ?? "/";
    return b.endsWith("/") ? b : b + "/";
}

function buildCandidates(): string[] {
    // dev(http) と file:// の両方で当たるように候補を複数
    return Array.from(
        new Set([
            baseUrl() + "assets/video/tutorial.mp4",
            "/assets/video/tutorial.mp4",
            "./assets/video/tutorial.mp4",
            "assets/video/tutorial.mp4",
        ])
    );
}

export const TutorialVideoScene: React.FC<{
    onEnded: () => void;
    onUserSkip?: () => void;
}> = ({ onEnded, onUserSkip }) => {
    const candidates = useMemo(() => buildCandidates(), []);
    const [idx, setIdx] = useState(0);
    const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");

    const doneRef = useRef(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const finishOnce = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onEnded();
    };

    // 最終保険：止まらない
    useEffect(() => {
        const t = window.setTimeout(() => {
            console.warn("[TutorialVideo] failsafe -> go GAME");
            finishOnce();
        }, 9000);
        return () => window.clearTimeout(t);
    }, []);

    // 読めたら play を強制
    const tryPlay = async () => {
        const v = videoRef.current;
        if (!v) return;
        try {
            await v.play();
            setStatus("playing");
        } catch {
            // autoplay失敗等
            console.warn("[TutorialVideo] play() rejected");
            // ここで止めず、タップでスキップできるようにする
        }
    };

    const src = candidates[idx];

    return (
        <div
            onPointerDown={() => {
                onUserSkip?.();
                finishOnce();
            }}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                background: "#000",
                cursor: "pointer",
            }}
        >
            <video
                ref={videoRef}
                key={src}
                src={src}
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
                    if (idx + 1 < candidates.length) {
                        console.warn("[TutorialVideo] error -> next", src);
                        setIdx(idx + 1);
                        setStatus("loading");
                    } else {
                        console.warn("[TutorialVideo] all candidates failed", candidates);
                        setStatus("error");
                        // 2秒見せてから進む
                        setTimeout(finishOnce, 2000);
                    }
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            <div
                style={{
                    position: "absolute",
                    left: 16,
                    bottom: 14,
                    fontFamily: "monospace",
                    fontSize: 12,
                    opacity: 0.75,
                }}
            >
                tutorial video ({status}) / tap to skip
            </div>
        </div>
    );
};