import { useEffect, useMemo, useState } from 'react';
import { sensorManager, type SensorDebugInfo } from '../game/sensor/SensorManager';

type UseSensorResult = {
    personCount: number;
    playerX: number;
    speedMultiplier: number;
    sensorDebug: SensorDebugInfo;
};

function personCountToSpeedMultiplier(count: number): number {
    if (count <= 1) {
        return 1;
    }

    if (count === 2) {
        return 1.1;
    }

    if (count === 3) {
        return 1.2;
    }

    return 1.3;
}

export function useSensor(): UseSensorResult {
    const [personCount, setPersonCount] = useState(0);
    const [playerX, setPlayerX] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth / 2;
        }
        return 960;
    });

    const [sensorDebug, setSensorDebug] = useState<SensorDebugInfo>(() =>
        sensorManager.getDebugInfo(),
    );

    useEffect(() => {
        const offCount = sensorManager.onPersonCountChange((count) => {
            setPersonCount(count);
        });

        const offX = sensorManager.onPlayerXChange((normalizedX) => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
            setPlayerX(Math.round(normalizedX * width));
        });

        const offDebug = sensorManager.onDebugChange((debug) => {
            setSensorDebug(debug);
        });

        return () => {
            offCount();
            offX();
            offDebug();
        };
    }, []);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (typeof window === 'undefined' || window.innerWidth <= 0) {
                return;
            }

            const normalizedX = event.clientX / window.innerWidth;
            sensorManager.setFallbackPlayerX(normalizedX);
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (
                typeof window === 'undefined' ||
                window.innerWidth <= 0 ||
                event.touches.length === 0
            ) {
                return;
            }

            const normalizedX = event.touches[0].clientX / window.innerWidth;
            sensorManager.setFallbackPlayerX(normalizedX);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    const speedMultiplier = useMemo(() => {
        return personCountToSpeedMultiplier(personCount);
    }, [personCount]);

    return {
        personCount,
        playerX,
        speedMultiplier,
        sensorDebug,
    };
}