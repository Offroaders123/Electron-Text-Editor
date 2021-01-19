const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

app.whenReady().then(createWindow);

app.on("activate",() => {
  if (BrowserWindow.getAllWindows().length == 0) createWindow();
});

app.on("window-all-closed",() => {
  if (process.platform != "darwin") app.quit();
});

ipcMain.on("create-window",createWindow);
ipcMain.on("minimize-window",() => getCurrentWindow().minimize());
ipcMain.on("maximize-window",() => getCurrentWindow().maximize());
ipcMain.on("is-maximized-window",event => event.returnValue = getCurrentWindow().isMaximized());
ipcMain.on("unmaximize-window",() => getCurrentWindow().unmaximize());
ipcMain.on("close-window",() => getCurrentWindow().close());

function createWindow(){
  const window = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname,"preload.js")
    },
    frame: false,
    titleBarStyle: "hidden",
    minWidth: 267,
    minHeight: 150,
    backgroundColor: "#333333"
  });
  window.on("maximize",() => window.webContents.send("refresh-maximize"));
  window.on("unmaximize",() => window.webContents.send("refresh-maximize"));
  window.loadFile("index.html");
}

function getCurrentWindow(){
  return BrowserWindow.getFocusedWindow();
}