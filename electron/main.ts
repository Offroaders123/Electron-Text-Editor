import { app, ipcMain, BrowserWindow, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { menu } from "./menu.js";

const __dirname = fileURLToPath(new URL(".",import.meta.url));

app.whenReady().then(() => {
  Menu.setApplicationMenu(menu);
  createWindow();
});

app.on("activate",() => {
  if (BrowserWindow.getAllWindows().length === 0){
    createWindow();
  }
});

app.on("window-all-closed",() => {
  if (process.platform !== "darwin"){
    app.quit();
  }
});

ipcMain.on("create-window",() => {
  createWindow();
});
ipcMain.on("minimize-window",() => {
  getCurrentWindow().minimize();
});
ipcMain.on("maximize-window",() => {
  getCurrentWindow().maximize();
});
ipcMain.on("is-maximized-window",event => {
  event.returnValue = getCurrentWindow().isMaximized();
});
ipcMain.on("unmaximize-window",() => {
  getCurrentWindow().unmaximize();
});
ipcMain.on("close-window",() => {
  getCurrentWindow().close();
});

function createWindow(): void {
  const window = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname,"preload.cjs")
    },
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#222222",
      symbolColor: "#dddddd"
    },
    minWidth: 300,
    minHeight: 150,
    backgroundColor: "#222222"
  });

  window.on("maximize",() => {
    window.webContents.send("refresh-maximize");
  });
  window.on("unmaximize",() => {
    window.webContents.send("refresh-maximize");
  });

  window.loadFile("index.html");
}

function getCurrentWindow(): BrowserWindow {
  return BrowserWindow.getFocusedWindow();
}