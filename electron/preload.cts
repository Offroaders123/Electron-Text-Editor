import { contextBridge, ipcRenderer } from "electron";

export type ElectronGlobal = typeof electronGlobal;
export type ReceiveChannel = "refresh-maximize";

const electronGlobal = {
  receive(channel: ReceiveChannel, callback: () => void): void {
    ipcRenderer.on(channel,() => callback());
  },
  createWindow(): void {
    ipcRenderer.send("create-window");
  },
  minimize(): void {
    ipcRenderer.send("minimize-window");
  },
  maximize(): void {
    ipcRenderer.send("maximize-window");
  },
  isMaximized(): boolean {
    return ipcRenderer.sendSync("is-maximized-window") as boolean;
  },
  unmaximize(): void {
    ipcRenderer.send("unmaximize-window");
  },
  close(): void {
    ipcRenderer.send("close-window");
  }
};

contextBridge.exposeInMainWorld("electron",electronGlobal);