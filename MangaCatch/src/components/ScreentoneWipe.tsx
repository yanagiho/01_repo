import React, { useEffect, useState } from 'react';

export const ScreentoneWipe: React.FC<{
    trigger: boolean;
    onMiddle: () => void;
    onComplete: () => void;
}> = ({ trigger, onMiddle, onComplete }) => {
    const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

    useEffect(() => {
        if (!trigger) return;

        setPhase('in');

        const t1 = window.setTimeout(() => {
            onMiddle();
            setPhase('out');
        }, 260);

        const t2 = window.setTimeout(() => {
            setPhase('idle');
            onComplete();
        }, 520);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [trigger, onMiddle, onComplete]);

    if (phase === 'idle') return null;

    const opacity = phase === 'in' ? 1 : 0;
    const scale = phase === 'in' ? 1 : 1.05;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 999,
                opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 240ms linear, transform 240ms linear',
                backgroundColor: 'rgba(0,0,0,0.95)',
                backgroundImage:
                    'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.28) 2px, rgba(0,0,0,0) 2.4px)',
                backgroundSize: '20px 20px',
            }}
        />
    );
};