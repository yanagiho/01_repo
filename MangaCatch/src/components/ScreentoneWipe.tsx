import React, { useEffect, useState, useRef } from 'react';

interface ScreentoneWipeProps {
    trigger: boolean;
    onMiddle?: () => void;
    onComplete?: () => void;
}

export const ScreentoneWipe: React.FC<ScreentoneWipeProps> = ({ trigger, onMiddle, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);

    // コールバックを最新の状態で保持しつつ、useEffectの再発火を防ぐ
    const onMiddleRef = useRef(onMiddle);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => { onMiddleRef.current = onMiddle; }, [onMiddle]);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

    useEffect(() => {
        if (!trigger) return;
        if (isActive) return;

        setIsActive(true);
        const startTime = performance.now();
        const expandDuration = 600; // 0.6秒で広がる
        const holdDuration = 200;   // 0.2秒キープ（シーン遷移のチラつき防止）
        const shrinkDuration = 600; // 0.6秒で閉じる
        const totalDuration = expandDuration + holdDuration + shrinkDuration;

        let animationFrameId: number;
        let middleTriggered = false;

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                let progress = 0;

                if (elapsed < expandDuration) {
                    // 拡大フェーズ
                    progress = elapsed / expandDuration;
                    progress = progress * progress; // ease-in
                } else if (elapsed < expandDuration + holdDuration) {
                    // ホールドフェーズ（真っ白）
                    progress = 1.0;
                } else {
                    // 縮小フェーズ
                    const shrinkElapsed = elapsed - (expandDuration + holdDuration);
                    progress = 1.0 - (shrinkElapsed / shrinkDuration);
                    progress = progress * (2 - progress); // ease-out
                }

                progress = Math.max(0, Math.min(1, progress));

                ctx.fillStyle = 'white';
                // 画面サイズに応じて円のサイズを調整
                const cols = 12; // 横方向の円の数（少なめにして個々の円を大きくする）
                const cellSize = Math.max(canvas.width, canvas.height) / cols;
                const rows = Math.ceil(canvas.height / cellSize) + 1; // 縦もカバー
                const colsPlus = Math.ceil(canvas.width / cellSize) + 1;

                // 完全に埋めるために半径を大きめに設定 (sqrt(2) * cellSize / 2 よりも大きく)
                const maxRadius = (cellSize / 2) * 1.8;

                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < colsPlus; x++) {
                        const cx = x * cellSize;
                        const cy = y * cellSize;

                        // 市松模様のように少しずらすと隙間なく埋まりやすい？
                        // 今回は単純配置で半径を大きくして埋める
                        const r = maxRadius * progress;

                        if (r > 0.5) {
                            ctx.beginPath();
                            ctx.arc(cx, cy, r, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }

            // ミドルポイント処理 (ホールド期間の開始時に発火)
            if (elapsed >= expandDuration && !middleTriggered) {
                middleTriggered = true;
                if (onMiddleRef.current) onMiddleRef.current();
            }

            // 終了判定
            if (elapsed < totalDuration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setIsActive(false);
                if (onCompleteRef.current) onCompleteRef.current();
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [trigger]); // isActive を依存配列から削除 (ループ防止)

    // リサイズ対応 & HiDPI対応
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                // キャンバスの解像度を設定 (Retina対応)
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;

                // 表示サイズはCSSで100%にするため、ここではスタイルと合わせる必要はないが
                // コンテキストのスケールを合わせる
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);

                // スタイル上のサイズも明示しておくと安全
                canvas.style.width = `${window.innerWidth}px`;
                canvas.style.height = `${window.innerHeight}px`;
            }
        };

        handleResize(); // 初回実行
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // 初回のみ設定

    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', // absolute -> fixed に変更してスクロール等の影響を受けないように
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                pointerEvents: 'none'
            }}
        />
    );
};
