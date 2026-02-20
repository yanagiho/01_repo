import { useState, useCallback } from 'react';
import type { RankingEntry } from '../types/game';

export const useRanking = () => {
    const [ranking, setRanking] = useState<RankingEntry[]>([]); // 型定義に合わせる必要あり。App.tsxでは any[] だったが...

    // 一旦 App.tsx のロジックをそのまま移植しつつ型を調整
    // RankingEntry型はまだ厳密に定義されていない部分があるため、anyを一部許容するか、保存データの構造を合わせる。
    // App.tsxのロジックでは { score, id } を保存している。

    const saveToRanking = useCallback((finalScore: number, charId: string) => {
        const today = new Date().toLocaleDateString();
        const key = `ranking_v5_${today}`;
        let list = JSON.parse(localStorage.getItem(key) || "[]");

        // 初期値がない場合のダミー
        if (list.length === 0) {
            list = [
                { score: 5000, id: "chara_005" },
                { score: 3000, id: "chara_002" },
                { score: 1500, id: "chara_009" }
            ];
        }

        list.push({ score: finalScore, id: charId });
        list.sort((a: any, b: any) => b.score - a.score);
        const sliced = list.slice(0, 5);
        localStorage.setItem(key, JSON.stringify(sliced));
        setRanking(sliced);
    }, []);

    return { ranking, saveToRanking };
};
