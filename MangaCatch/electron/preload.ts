import { contextBridge, ipcRenderer } from "electron";

type RendererOscPayload = {
  frame: number;
  players: Array<{
    id: number;
    x: number;
    y: number;
  }>;
  address: string;
  args: Array<number | string | boolean | null>;
  argCount: number;
  parseMode: "touches" | "mangacatch_players" | "unknown";
  parseError: string | null;
  receivedAt: number;
  rawPreview: string;
};

contextBridge.exposeInMainWorld("electronAPI", {
  onOscData: (callback: (payload: RendererOscPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: RendererOscPayload) => {
      callback(payload);
    };

    ipcRenderer.on("osc-data", handler);

    return () => {
      ipcRenderer.removeListener("osc-data", handler);
    };
  },
});