import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onOscData: (callback: (data: number[]) => void) => {
    ipcRenderer.on("osc-data", (_event, data) => callback(data));
  },
});
