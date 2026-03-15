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

function ensureDebugOverlayElement(): HTMLDivElement | null {
    if (typeof document === 'undefined') {
        return null;
    }

    let el = document.getElementById('sensor-debug-overlay') as HTMLDivElement | null;

    if (!el) {
        el = document.createElement('div');
        el.id = 'sensor-debug-overlay';
        el.style.position = 'fixed';
        el.style.top = '12px';
        el.style.right = '12px';
        el.style.zIndex = '999999';
        el.style.width = '560px';
        el.style.maxHeight = '70vh';
        el.style.overflow = 'auto';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';
        el.style.background = 'rgba(0,0,0,0.82)';
        el.style.color = '#00ff88';
        el.style.fontFamily = 'monospace';
        el.style.fontSize = '13px';
        el.style.lineHeight = '1.45';
        el.style.pointerEvents = 'none';
        el.style.whiteSpace = 'pre-wrap';
        el.style.boxSizing = 'border-box';
        document.body.appendChild(el);
    }

    return el;
}

function renderDebugOverlay(
    debug: SensorDebugInfo,
    personCount: number,
    playerX: number,
    speedMultiplier: number,
): void {
    const el = ensureDebugOverlayElement();
    if (!el) {
        return;
    }

    const receivedAgoMs =
        debug.lastReceivedAt > 0 ? Date.now() - debug.lastReceivedAt : -1;

    const oscStatus =
        debug.lastReceivedAt > 0 && receivedAgoMs >= 0 && receivedAgoMs <= 1500
            ? '受信中'
            : '未受信/停止';

    el.textContent = [
        `OSC: ${oscStatus}`,
        `receivedAgoMs: ${receivedAgoMs >= 0 ? receivedAgoMs : '(none)'}`,
        `frame: ${debug.frame}`,
        `lastOscAddress: ${debug.lastOscAddress}`,
        `argCount: ${debug.argCount}`,
        `argsPreview: ${debug.argsPreview}`,
        `parseMode: ${debug.parseMode}`,
        `parseError: ${debug.parseError ?? '(none)'}`,
        `rawPreview: ${debug.rawPreview}`,
        `playerCount(raw): ${debug.playerCountRaw}`,
        `playerX(raw avg): ${debug.playerXRawAvg.toFixed(4)}`,
        `normalizedPlayerX: ${debug.normalizedPlayerX.toFixed(4)}`,
        `rawPlayers: ${debug.rawPlayers}`,
        `usingFallback: ${debug.usingFallback ? 'true' : 'false'}`,
        `personCount(useSensor): ${personCount}`,
        `playerX(useSensor): ${playerX}`,
        `speedMultiplier(useSensor): ${speedMultiplier.toFixed(3)}`,
    ].join('\n');
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

    const speedMultiplier = useMemo(() => {
        return personCountToSpeedMultiplier(personCount);
    }, [personCount]);

    useEffect(() => {
        renderDebugOverlay(sensorManager.getDebugInfo(), personCount, playerX, speedMultiplier);

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

        const timer = window.setInterval(() => {
            renderDebugOverlay(sensorManager.getDebugInfo(), personCount, playerX, speedMultiplier);
        }, 250);

        return () => {
            offCount();
            offX();
            offDebug();
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        renderDebugOverlay(sensorDebug, personCount, playerX, speedMultiplier);
    }, [sensorDebug, personCount, playerX, speedMultiplier]);

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

    return {
        personCount,
        playerX,
        speedMultiplier,
        sensorDebug,
    };
}