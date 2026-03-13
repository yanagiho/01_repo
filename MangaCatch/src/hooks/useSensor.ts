import { useEffect, useMemo, useState } from "react";
import { SensorManager, type SensorDebugInfo } from "../game/sensor/SensorManager";

type UseSensorResult = {
    playerCount: number;
    personCount: number;
    speedMultiplier: number;
    playerX: number;
    sensorDebug: SensorDebugInfo;
};

function personCountToSpeedMultiplier(count: number): number {
    if (count <= 1) return 1.0;
    if (count === 2) return 1.2;
    return 1.5;
}

function ensureDebugOverlayElement(): HTMLDivElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    let el = document.getElementById("sensor-debug-overlay") as HTMLDivElement | null;

    if (!el) {
        el = document.createElement("div");
        el.id = "sensor-debug-overlay";
        el.style.position = "fixed";
        el.style.top = "12px";
        el.style.right = "12px";
        el.style.zIndex = "999999";
        el.style.width = "560px";
        el.style.maxHeight = "70vh";
        el.style.overflow = "auto";
        el.style.padding = "12px";
        el.style.borderRadius = "8px";
        el.style.background = "rgba(0,0,0,0.82)";
        el.style.color = "#00ff88";
        el.style.fontFamily = "monospace";
        el.style.fontSize = "13px";
        el.style.lineHeight = "1.45";
        el.style.pointerEvents = "none";
        el.style.whiteSpace = "pre-wrap";
        el.style.boxSizing = "border-box";
        document.body.appendChild(el);
    }

    return el;
}

function renderDebugOverlay(
    debug: SensorDebugInfo,
    playerCount: number,
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
            ? "受信中"
            : "未受信/停止";

    el.textContent = [
        `OSC: ${oscStatus}`,
        `receivedAgoMs: ${receivedAgoMs >= 0 ? receivedAgoMs : "(none)"}`,
        `frame: ${debug.frame}`,
        `lastOscAddress: ${debug.lastOscAddress}`,
        `argCount: ${debug.argCount}`,
        `argsPreview: ${debug.argsPreview}`,
        `parseMode: ${debug.parseMode}`,
        `parseError: ${debug.parseError ?? "(none)"}`,
        `rawPreview: ${debug.rawPreview}`,
        `playerCount(raw): ${debug.playerCountRaw}`,
        `playerX(raw avg): ${debug.playerXRawAvg.toFixed(4)}`,
        `normalizedPlayerX: ${debug.normalizedPlayerX.toFixed(4)}`,
        `rawPlayers: ${debug.rawPlayers}`,
        `usingFallback: ${debug.usingFallback ? "true" : "false"}`,
        `playerCount(useSensor): ${playerCount}`,
        `playerX(useSensor): ${playerX}`,
        `speedMultiplier(useSensor): ${speedMultiplier.toFixed(3)}`,
    ].join("\n");
}

export const useSensor = (): UseSensorResult => {
    const sensorMgr = SensorManager.getInstance();

    const [playerCount, setPlayerCount] = useState(1);
    const [playerX, setPlayerX] = useState(
        typeof window !== "undefined" ? Math.round(window.innerWidth / 2) : 960,
    );
    const [sensorDebug, setSensorDebug] = useState<SensorDebugInfo>(
        sensorMgr.getDebugInfo(),
    );

    const speedMultiplier = useMemo(() => {
        return personCountToSpeedMultiplier(playerCount);
    }, [playerCount]);

    useEffect(() => {
        sensorMgr.stop();
        sensorMgr.start();

        const offCount = sensorMgr.onPersonCountChange((count) => {
            const validCount = Math.min(3, Math.max(1, count));
            setPlayerCount(validCount);
        });

        const offX = sensorMgr.onPlayerXChange((normalizedX) => {
            const width = typeof window !== "undefined" ? window.innerWidth : 1920;
            setPlayerX(Math.round(normalizedX * width));
        });

        const offDebug = sensorMgr.onDebugChange((debug) => {
            setSensorDebug(debug);
        });

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (typeof window === "undefined" || window.innerWidth <= 0) {
                return;
            }

            let clientX = window.innerWidth / 2;

            if ("touches" in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            } else if ("clientX" in e) {
                clientX = e.clientX;
            }

            setPlayerX(clientX);
            sensorMgr.setFallbackPlayerX(clientX / window.innerWidth);
        };

        const mouseHandler = (e: MouseEvent) => handleMove(e);
        const touchHandler = (e: TouchEvent) => handleMove(e);

        window.addEventListener("mousemove", mouseHandler, { passive: true });
        window.addEventListener("touchmove", touchHandler, { passive: true });

        const timer = window.setInterval(() => {
            renderDebugOverlay(sensorMgr.getDebugInfo(), playerCount, playerX, speedMultiplier);
        }, 250);

        return () => {
            window.removeEventListener("mousemove", mouseHandler);
            window.removeEventListener("touchmove", touchHandler);
            window.clearInterval(timer);
            offCount();
            offX();
            offDebug();
            sensorMgr.stop();
        };
    }, []);

    useEffect(() => {
        renderDebugOverlay(sensorDebug, playerCount, playerX, speedMultiplier);
    }, [sensorDebug, playerCount, playerX, speedMultiplier]);

    return {
        playerCount,
        personCount: playerCount,
        speedMultiplier,
        playerX,
        sensorDebug,
    };
};