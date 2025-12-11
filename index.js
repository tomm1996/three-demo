const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");

function createWindow () {
    const win = new BrowserWindow({
        frame: false,
        fullscreen: true,
        simpleFullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('./index.html')
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
    });
    app.on("browser-window-focus", () => {
        globalShortcut.register("CommandOrControl+W", () => {
            return;
        });
    });
    app.on("browser-window-blur", () => {
        globalShortcut.unregisterAll();
    });
    
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
