import { useEffect, useRef, useState } from "react";

type Props = {
    onUserSkip: () => void;
    onEnded: () => void;
};

const VIDEO_CANDIDATES = [
    "/assets/tutorial/tutorial.mp4",
    "./assets/tutorial/tutorial.mp4",
    "assets/tutorial/tutorial.mp4",
];

export const TutorialVideoScene = ({ onEnded }: Props) => {
    const [videoIdx, setVideoIdx] = useState(0);
    const [failed, setFailed] = useState(false);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    // 動画が全候補で失敗した場合、5秒後に自動遷移
    useEffect(() => {
        if (!failed) return;
        const t = window.setTimeout(() => onEndedRef.current(), 5000);
        return () => window.clearTimeout(t);
    }, [failed]);

    const handleError = () => {
        const next = videoIdx + 1;
        if (next < VIDEO_CANDIDATES.length) {
            setVideoIdx(next);
        } else {
            setFailed(true);
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                background: "#000",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            {!failed ? (
                <video
                    key={videoIdx}
                    src={VIDEO_CANDIDATES[videoIdx]}
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => onEndedRef.current()}
                    onError={handleError}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#000",
                    }}
                />
            ) : (
                <img
                    src="/assets/tutorial/tutorial.png"
                    alt="tutorial"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                    }}
                    draggable={false}
                />
            )}
        </div>
    );
};
