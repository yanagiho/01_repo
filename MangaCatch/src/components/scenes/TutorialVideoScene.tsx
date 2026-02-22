// MangaCatch/src/components/scenes/TutorialVideoScene.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

function buildVideoCandidates(): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "./";
    const norm = (s: string) => (s.endsWith("/") ? s : s + "/");

    const bases = [norm(baseUrl), "./", "", "../", "../../"];
    const names = [
        "assets/tutorial.mp4",
        "assets/tutorial_video.mp4",
        "assets/videos/tutorial.mp4",
        "assets/video/tutorial.mp4",
        "assets/ui/tutorial.mp4",
        "assets/mangacatch_tutorial.mp4",
    ];

    const out: string[] = [];
    for (const b of bases) for (const n of names) out.push(b + n);
    return Array.from(new Set(out));
}

type Props = { onEnded: () => void };

export const TutorialVideoScene: React.FC<Props> = ({ onEnded }) => {
    const candidates = useMemo(() => buildVideoCandidates(), []);
    const [idx, setIdx] = useState(0);
    const [status, setStatus] = useState<"loading" | "playing" | "fallback">("loading");

    const finishedRef = useRef(false);
    const finishOnce = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        console.log("[TutorialVideo] FINISH");
        onEnded();
    };

    // 無反応でも必ず進む
    useEffect(() => {
        const t = window.setTimeout(() => {
            console.warn("[TutorialVideo] timeout -> skip");
            setStatus("fallback");
            finishOnce();
        }, 3500);
        return () => window.clearTimeout(t);
    }, []);

    const src = candidates[idx];

    return (
        <div
            onPointerDown={finishOnce} // クリックでスキップ
            style={{ position: "absolute", inset: 0, zIndex: 20, background: "#000", cursor: "pointer" }}
        >
            <video
                key={src}
                src={src}
                autoPlay
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={() => setStatus("playing")}
                onCanPlay={() => setStatus("playing")}
                onEnded={finishOnce}
                onError={() => {
                    if (idx + 1 < candidates.length) {
                        console.warn("[TutorialVideo] error -> next", src);
                        setIdx(idx + 1);
                    } else {
                        console.warn("[TutorialVideo] all failed -> skip", candidates);
                        setStatus("fallback");
                        finishOnce();
                    }
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            <div
                style={{
                    position: "absolute",
                    left: 18,
                    bottom: 16,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.45)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: 12,
                    opacity: 0.85,
                }}
            >
                tutorial: {status} / tap to skip
            </div>
        </div>
    );
};