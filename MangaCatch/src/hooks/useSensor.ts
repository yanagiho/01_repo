import { useEffect, useMemo, useState } from 'react';
import { sensorManager, type SensorDebugInfo } from '../game/sensor/SensorManager';

type UseSensorResult = {
  personCount: number;
  playerX: number;
  playerXs: number[];
  speedMultiplier: number;
  sensorDebug: SensorDebugInfo;
};

function personCountToSpeedMultiplier(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 1.1;
  if (count === 3) return 1.2;
  return 1.3;
}

export function useSensor(): UseSensorResult {
  const [personCount, setPersonCount] = useState(0);
  const [playerX, setPlayerX] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth / 2;
    return 960;
  });
  const [playerXs, setPlayerXs] = useState<number[]>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth / 2 : 960;
    return [w];
  });

  const [sensorDebug, setSensorDebug] = useState<SensorDebugInfo>(() =>
    sensorManager.getDebugInfo(),
  );

  const speedMultiplier = useMemo(() => personCountToSpeedMultiplier(personCount), [personCount]);

  useEffect(() => {
    const offCount = sensorManager.onPersonCountChange((count) => {
      setPersonCount(count);
    });

    const offX = sensorManager.onPlayerXChange((normalizedX) => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
      setPlayerX(Math.round(normalizedX * width));
    });

    const offXs = sensorManager.onPlayerXsChange((normalizedXs) => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
      setPlayerXs(normalizedXs.map((nx) => Math.round(nx * width)));
    });

    const offDebug = sensorManager.onDebugChange((debug) => {
      setSensorDebug(debug);
    });

    return () => {
      offCount();
      offX();
      offXs();
      offDebug();
    };
  }, []);

  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      if (typeof window === 'undefined' || window.innerWidth <= 0 || event.touches.length === 0) return;
      const normalizedX = event.touches[0].clientX / window.innerWidth;
      sensorManager.setFallbackPlayerX(normalizedX);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return { personCount, playerX, playerXs, speedMultiplier, sensorDebug };
}
