import React, { useEffect, useRef, useState } from "react";

export const ScreentoneWipe: React.FC<{
    trigger: boolean;
    onMiddle?: () => void;
    onComplete?: () => void;
}> = ({ trigger, onMiddle, onComplete }) => {
    const [visible, setVisible] = useState(false);
    const [opacity, setOpacity] = useState(0);

    const middleDoneRef = useRef(false);
    const t1Ref = useRef<number | null>(null);
    const t2Ref = useRef<number | null>(null);
    const t3Ref = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (t1Ref.current) window.clearTimeout(t1Ref.current);
            if (t2Ref.current) window.clearTimeout(t2Ref.current);
            if (t3Ref.current) window.clearTimeout(t3Ref.current);
        };
    }, []);

    useEffect(() => {
        if (!trigger) return;

        if (t1Ref.current) window.clearTimeout(t1Ref.current);
        if (t2Ref.current) window.clearTimeout(t2Ref.current);
        if (t3Ref.current) window.clearTimeout(t3Ref.current);

        middleDoneRef.current = false;

        setVisible(true);
        setOpacity(0);

        t1Ref.current = window.setTimeout(() => {
            setOpacity(1);
        }, 10);

        t2Ref.current = window.setTimeout(() => {
            if (!middleDoneRef.current) {
                middleDoneRef.current = true;
                onMiddle?.();
            }

            setOpacity(0);
        }, 180);

        t3Ref.current = window.setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, 380);
    }, [trigger, onMiddle, onComplete]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 9999,
                pointerEvents: "none",
                background: "#000",
                opacity,
                transition: "opacity 180ms linear",
            }}
        />
    );
};

export default ScreentoneWipe;