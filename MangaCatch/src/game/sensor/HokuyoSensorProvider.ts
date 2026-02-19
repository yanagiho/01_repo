import type { ISensorProvider } from './ISensorProvider';

interface Point {
    x: number;
    y: number;
}

interface Cluster {
    points: Point[];
    width: number;
    center: Point;
}

export class HokuyoSensorProvider implements ISensorProvider {
    private callback: ((count: number) => void) | null = null;
    private isRunning: boolean = false;

    // デバウンス用
    private lastCount: number = 0;
    private stableCount: number = 0;
    private stableStartTime: number = 0;
    private readonly DEBOUNCE_TIME = 1500; // 1.5秒

    // クラスタリング設定
    private readonly MERGE_DISTANCE = 300; // 300mm以内なら結合
    private readonly MIN_WIDTH = 300;      // 300mm以上
    private readonly MAX_WIDTH = 800;      // 800mm以下

    constructor() {
        // 実機通信の初期化などがここに入ります
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[HokuyoSensor] Started filtering logic.');

        // ※ ここで通常はシリアルポートやTCPからのデータ受信ループを開始します
        // 今回はロジックの実装のみのため、受信部分はスタブとします
    }

    public stop(): void {
        this.isRunning = false;
        console.log('[HokuyoSensor] Stopped.');
    }

    public onPersonCountChange(callback: (count: number) => void): void {
        this.callback = callback;
    }

    /**
     * 外部または受信ループから点群データを受け取るメソッド
     * @param rawPoints [x, y] の配列 (単位: mm)
     */
    public processScanData(rawPoints: number[][]): void {
        if (!this.isRunning) return;

        // 1. Point型に変換
        const points: Point[] = rawPoints.map(p => ({ x: p[0], y: p[1] }));

        // 2. クラスタリング (ユークリッド距離)
        const clusters: Cluster[] = this.clustering(points);

        // 3. 人間サイズフィルタリング
        const personClusters = clusters.filter(c => c.width >= this.MIN_WIDTH && c.width <= this.MAX_WIDTH);

        // 4. デバウンス処理 & 通知
        this.updateCount(personClusters.length);
    }

    private clustering(points: Point[]): Cluster[] {
        if (points.length === 0) return [];

        const clusters: Point[][] = [];

        // 簡易的なクラスタリング: リニアに走査して距離が近いものをまとめる
        // (データは通常角度順に来るため、隣接点との距離比較で十分機能します)
        let currentCluster: Point[] = [points[0]];

        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

            if (dist <= this.MERGE_DISTANCE) {
                currentCluster.push(p2);
            } else {
                clusters.push(currentCluster);
                currentCluster = [p2];
            }
        }
        clusters.push(currentCluster);

        // Cluster構造体に変換（幅計算など）
        return clusters.map(pts => {
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;
            let sumX = 0, sumY = 0;

            pts.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
                sumX += p.x;
                sumY += p.y;
            });

            // 幅は単純なBoundingBoxの対角線、または最大辺長とみなす
            // ここでは簡易的に MAX(Width, Height) とするか、あるいは点間の最大距離を測るのが正確ですが
            // LiDARは通常水平スキャンなので、BoundingBoxの対角線で近似します
            const width = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2));

            return {
                points: pts,
                width: width,
                center: { x: sumX / pts.length, y: sumY / pts.length }
            };
        });
    }

    private updateCount(currentCount: number): void {
        const now = Date.now();

        if (currentCount === this.lastCount) {
            // 変化なし。継続時間をチェック
            if (now - this.stableStartTime >= this.DEBOUNCE_TIME) {
                // 安定時間が経過したので確定
                if (this.stableCount !== currentCount) {
                    this.stableCount = currentCount;
                    console.log(`[HokuyoSensor] Count updated: ${this.stableCount}`);
                    if (this.callback) this.callback(this.stableCount);
                }
            }
        } else {
            // 変化あり。タイマーリセット
            this.lastCount = currentCount;
            this.stableStartTime = now;
        }
    }
}
