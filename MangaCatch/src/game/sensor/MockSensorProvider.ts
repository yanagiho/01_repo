import type { ISensorProvider } from './ISensorProvider';

export class MockSensorProvider implements ISensorProvider {
    private callback: ((count: number) => void) | null = null;
    private handleKeyBound: (e: KeyboardEvent) => void;

    constructor() {
        this.handleKeyBound = this.handleKey.bind(this);
    }

    public start(): void {
        console.log('[MockSensor] Started. Press 1, 2, 3 to simulate player count.');
        window.addEventListener('keydown', this.handleKeyBound);
    }

    public stop(): void {
        console.log('[MockSensor] Stopped.');
        window.removeEventListener('keydown', this.handleKeyBound);
    }

    public onPersonCountChange(callback: (count: number) => void): void {
        this.callback = callback;
    }

    private handleKey(e: KeyboardEvent): void {
        if (this.callback) {
            if (e.key === '1') {
                console.log('[MockSensor] Detected 1 person');
                this.callback(1);
            }
            if (e.key === '2') {
                console.log('[MockSensor] Detected 2 people');
                this.callback(2);
            }
            if (e.key === '3') {
                console.log('[MockSensor] Detected 3 people');
                this.callback(3);
            }
        }
    }
}
