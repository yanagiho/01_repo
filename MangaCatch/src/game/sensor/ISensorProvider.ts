export interface ISensorProvider {
    /**
     * センサーを開始する
     */
    start(): void;

    /**
     * センサーを停止する
     */
    stop(): void;

    /**
     * 人数変更イベントを購読する
     * @param callback 新しい検知人数を受け取るコールバック
     */
    onPersonCountChange(callback: (count: number) => void): void;
}
