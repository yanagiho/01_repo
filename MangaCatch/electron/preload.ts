// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  quit: () => ipcRenderer.invoke("app:quit"),
});
