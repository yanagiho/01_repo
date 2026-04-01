import { useEffect, useRef, useState } from "react";

type Props = {
    onEnded: () => void;
};

const VIDEO_CANDIDATES = [
    "/assets/videos/countdown.mp4",
    "./assets/videos/countdown.mp4",
    "assets/videos/countdown.mp4",
];

export const CountdownVideoScene = ({ onEnded }: Props) => {
    const [videoIdx, setVideoIdx] = useState(0);
    const [failed, setFailed] = useState(false);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    // 全候補で失敗した場合は即座に次へ進む
    useEffect(() => {
        if (!failed) return;
        onEndedRef.current();
    }, [failed]);

    const handleError = () => {
        const next = videoIdx + 1;
        if (next < VIDEO_CANDIDATES.length) {
            setVideoIdx(next);
        } else {
            setFailed(true);
        }
    };

    if (failed) return null;

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
        </div>
    );
};
