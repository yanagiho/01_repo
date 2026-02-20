import { useState, useEffect } from 'react';
import { SensorManager } from '../game/sensor/SensorManager';

export const useSensor = () => {
    const [playerCount, setPlayerCount] = useState(1);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
    const [playerX, setPlayerX] = useState(960); // マウスフォールバック用

    useEffect(() => {
        const sensorMgr = SensorManager.getInstance();

        // OSC/センサーからの人数更新
        sensorMgr.onPersonCountChange((count) => {
            const validCount = Math.min(3, Math.max(1, count));
            setPlayerCount(validCount);

            // 人数に応じた倍率
            const multi = validCount === 1 ? 1.0 : (validCount === 2 ? 1.2 : 1.5);
            setSpeedMultiplier(multi);
        });

        // start()前に一度stop()を呼んで安全性を高める
        sensorMgr.stop();
        sensorMgr.start();

        // マウスフォールバック (App.tsxから移動)
        const handleMove = (e: any) => setPlayerX(e.touches ? e.touches[0].clientX : e.clientX);
        window.addEventListener('mousemove', handleMove);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            sensorMgr.stop();
        };
    }, []);

    return { playerCount, speedMultiplier, playerX };
};
