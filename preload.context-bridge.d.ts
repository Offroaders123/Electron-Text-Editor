declare var electron: {
  send(channel,data): void;
  receive(channel,callback): Electron.IpcRenderer;
  createWindow(): void;
  minimize(): void;
  maximize(): void;
  isMaximized(): boolean;
  unmaximize(): void;
  close(): void;
};