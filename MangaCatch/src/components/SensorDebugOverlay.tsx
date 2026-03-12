import { useEffect, useMemo, useState } from 'react';
import type { SensorDebugInfo } from '../game/sensor/SensorManager';

type Props = {
    debug: SensorDebugInfo;
    visible?: boolean;
};

export default function SensorDebugOverlay({ debug, visible = true }: Props) {
    const [, forceTick] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            forceTick((v) => v + 1);
        }, 250);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const receivedAgoMs = useMemo(() => {
        if (!debug.lastReceivedAt) {
            return -1;
        }
        return Date.now() - debug.lastReceivedAt;
    }, [debug.lastReceivedAt]);

    const oscStatus =
        debug.lastReceivedAt > 0 && receivedAgoMs >= 0 && receivedAgoMs <= 1500
            ? '受信中'
            : '未受信/停止';

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
            <div>receivedAgoMs: {receivedAgoMs >= 0 ? receivedAgoMs : '(none)'}</div>
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