import React, { useEffect, useRef, useState } from 'react';

export const ScreentoneWipe: React.FC<{
    trigger: boolean;
    onMiddle: () => void;
    onComplete: () => void;
}> = ({ trigger, onMiddle, onComplete }) => {
    const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

    // ★コールバックの最新値をrefに保持（関数のidentity変化でタイマーが消えないように）
    const onMiddleRef = useRef(onMiddle);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => { onMiddleRef.current = onMiddle; }, [onMiddle]);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

    const middleCalled = useRef(false);
    const completeCalled = useRef(false);

    useEffect(() => {
        if (!trigger) {
            setPhase('idle');
            middleCalled.current = false;
            completeCalled.current = false;
            return;
        }

        setPhase('in');
        middleCalled.current = false;
        completeCalled.current = false;

        const tMiddle = window.setTimeout(() => {
            if (!middleCalled.current) {
                middleCalled.current = true;
                onMiddleRef.current();
            }
            setPhase('out');
        }, 260);

        const tComplete = window.setTimeout(() => {
            if (!completeCalled.current) {
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase('idle');
        }, 520);

        // ★最終保険：何があっても解除
        const tFailSafe = window.setTimeout(() => {
            if (!completeCalled.current) {
                console.warn('[ScreentoneWipe] failsafe complete');
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase('idle');
        }, 1200);

        return () => {
            window.clearTimeout(tMiddle);
            window.clearTimeout(tComplete);
            window.clearTimeout(tFailSafe);
        };
    }, [trigger]);

    if (phase === 'idle') return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9999,
                opacity: phase === 'in' ? 1 : 0,
                transition: 'opacity 240ms linear',
                backgroundColor: 'rgba(0,0,0,0.95)',
                backgroundImage:
                    'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.28) 2px, rgba(0,0,0,0) 2.4px)',
                backgroundSize: '20px 20px',
            }}
        />
    );
};