import { contextBridge, ipcRenderer } from "electron";

type OscPlayerSignal = {
  x: number;
  y: number;
  id: number;
};

type OscPayload = {
  frame: number;
  players: OscPlayerSignal[];
};

contextBridge.exposeInMainWorld("electronAPI", {
  onOscData: (callback: (data: OscPayload) => void) => {
    const handler = (_event: unknown, data: OscPayload) => callback(data);
    ipcRenderer.on("osc-data", handler);

    return () => {
      ipcRenderer.removeListener("osc-data", handler);
    };
  },
});
