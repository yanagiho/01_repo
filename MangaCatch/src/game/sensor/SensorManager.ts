import type { ISensorProvider } from './ISensorProvider';
import { MockSensorProvider } from './MockSensorProvider';
import { HokuyoSensorProvider } from './HokuyoSensorProvider';

export class SensorManager {
    private provider: ISensorProvider;
    private static instance: SensorManager;

    private constructor() {
        // 環境判定ロジック (URLパラメータ ?sensor=hokuyo 等で切り替え可能にすると便利)
        // 今回はデフォルトでMock、必要ならHokuyoに切り替える実装とします
        const params = new URLSearchParams(window.location.search);
        const useHokuyo = params.get('sensor') === 'hokuyo';

        if (useHokuyo) {
            console.log('Using HokuyoSensorProvider (Production Mode)');
            this.provider = new HokuyoSensorProvider();
        } else {
            console.log('Using MockSensorProvider (Dev Mode)');
            this.provider = new MockSensorProvider();
        }
    }

    public static getInstance(): SensorManager {
        if (!SensorManager.instance) {
            SensorManager.instance = new SensorManager();
        }
        return SensorManager.instance;
    }

    public start(): void {
        this.provider.start();
    }

    public stop(): void {
        this.provider.stop();
    }

    public onPersonCountChange(callback: (count: number) => void): void {
        this.provider.onPersonCountChange(callback);
    }
}
