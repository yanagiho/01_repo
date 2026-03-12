export { };

type OscArg = number | string | boolean | null;
type ParseMode = 'touches' | 'mangacatch_players' | 'unknown';

type OscPlayer = {
    id: number;
    x: number;
    y: number;
};

type RendererOscPayload = {
    frame: number;
    players: OscPlayer[];
    address: string;
    args: OscArg[];
    argCount: number;
    parseMode: ParseMode;
    parseError: string | null;
    receivedAt: number;
    rawPreview: string;
};

declare global {
    interface Window {
        electronAPI?: {
            onOscData?: (callback: (payload: RendererOscPayload) => void) => () => void;
        };
    }
}