import { useEffect, useRef, useState } from "react";
import { SensorManager } from "../game/sensor/SensorManager";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const useSensor = () => {
  const [playerCount, setPlayerCount] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [playerX, setPlayerX] = useState(
    typeof window !== "undefined" ? window.innerWidth / 2 : 960
  );

  const lastSensorInputAtRef = useRef(0);

  useEffect(() => {
    const sensorMgr = SensorManager.getInstance();

    const offCount = sensorMgr.onPersonCountChange((count) => {
      const validCount = Math.min(3, Math.max(1, count || 1));
      setPlayerCount(validCount);

      const multi =
        validCount === 1 ? 1.0 : validCount === 2 ? 1.2 : 1.5;
      setSpeedMultiplier(multi);
    });

    const offPlayerX = sensorMgr.onPlayerXChange((x) => {
      lastSensorInputAtRef.current = Date.now();
      setPlayerX(x);
    });

    sensorMgr.stop();
    sensorMgr.start();

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (Date.now() - lastSensorInputAtRef.current < 500) {
        return;
      }

      const clientX =
        "touches" in e
          ? e.touches?.[0]?.clientX ?? playerX
          : e.clientX;

      const width =
        typeof window !== "undefined" ? window.innerWidth : 1920;

      setPlayerX(clamp(clientX, 0, width));
    };

    window.addEventListener("mousemove", handleMove as EventListener);
    window.addEventListener("touchmove", handleMove as EventListener, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMove as EventListener);
      window.removeEventListener("touchmove", handleMove as EventListener);

      offCount();
      offPlayerX();
      sensorMgr.stop();
    };
  }, []);

  return { playerCount, speedMultiplier, playerX };
};
