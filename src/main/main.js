const electron = require('electron');

const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');
require('electron-debug')({ showDevTools: true });

let mainWindow;
let win;

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV !== 'production'
  ? 'http://localhost:9090'
  : `file://${path.resolve(__dirname, 'renderer')}/index.html`;

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 900,
    defaultHeight: 900
  });

  mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    x: mainWindowState.x,
    y: mainWindowState.y
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindowState.manage(mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', () => {
  if (mainWindow === null) { createWindow(); }
});
