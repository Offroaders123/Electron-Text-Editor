const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron",{/*
  send: (channel,data) => {
    let channels = ["toMain","create-window"];
    if (channels.includes(channel)) ipcRenderer.send(channel,data);
  },
  receive: (channel,callback) => {
    let channels = ["fromMain","create-window"];
    if (channel == "fromMain") ipcRenderer.on(channel,(event,...args) => callback(...args));
  },*/

  send: (channel,data) => ipcRenderer.send(channel,data),
  receive: (channel,callback) => ipcRenderer.on(channel,(event,...args) => callback(...args)),
  createWindow: () => ipcRenderer.send("create-window"),
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  isMaximized: () => ipcRenderer.sendSync("is-maximized-window"),
  unmaximize: () => ipcRenderer.send("unmaximize-window"),
  close: () => ipcRenderer.send("close-window")
});