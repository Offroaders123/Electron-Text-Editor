const { app, BrowserWindow, ipcMain } = require("electron");

app.whenReady().then(createWindow);

app.on("activate",() => {
  if (Browser.getAllWindows().length == 0) createWindow();
});

app.on("window-all-closed",() => {
  if (process.platform != "darwin") app.quit();
});

ipcMain.on("create-window",createWindow);

function createWindow(){
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false,
    minWidth: 267,
    minHeight: 150,
    backgroundColor: "#333333"
  });
  window.loadFile("index.html");
}