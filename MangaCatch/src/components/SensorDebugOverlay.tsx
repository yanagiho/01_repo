import { useEffect, useState } from 'react';
import type { SensorDebugInfo } from '../game/sensor/SensorManager';

type Props = {
    debug: SensorDebugInfo;
    visible?: boolean;
};

export default function SensorDebugOverlay({ debug, visible = false }: Props) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 250);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const receivedAgoMs = debug.lastReceivedAt > 0 ? now - debug.lastReceivedAt : -1;

    const oscStatus =
        debug.lastReceivedAt > 0 && receivedAgoMs >= 0 && receivedAgoMs <= 3000
            ? receivedAgoMs <= 1500 ? `受信中 (${receivedAgoMs}ms前)` : `停止? (${receivedAgoMs}ms前)`
            : '未受信';

    if (!visible) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 12,
                right: 12,
                zIndex: 999999,
                width: 520,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(0,0,0,0.82)',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.45,
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
            }}
        >
            <div>OSC: {oscStatus}</div>
            <div>frame: {debug.frame}</div>
            <div>lastOscAddress: {debug.lastOscAddress}</div>
            <div>argCount: {debug.argCount}</div>
            <div>argsPreview: {debug.argsPreview}</div>
            <div>parseMode: {debug.parseMode}</div>
            <div>parseError: {debug.parseError ?? '(none)'}</div>
            <div>rawPreview: {debug.rawPreview}</div>
            <div>playerCount(raw): {debug.playerCountRaw}</div>
            <div>playerX(raw avg): {debug.playerXRawAvg.toFixed(4)}</div>
            <div>normalizedPlayerX: {debug.normalizedPlayerX.toFixed(4)}</div>
            <div>rawPlayers: {debug.rawPlayers}</div>
            <div>usingFallback: {debug.usingFallback ? 'true' : 'false'}</div>
        </div>
    );
}