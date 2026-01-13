/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  nativeImage,
  Tray,
  Menu,
} from 'electron';
// import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
import express from 'express';
import cors from 'cors';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import mainRoutes from './api/routes';
import initResponseHelper from './api/middleware';
import conf from './glob';
import ipcMainListeners from './ipMainListeners';
import { startPrinterConnectionCheckInterval } from './intervals';

const expressApp = express();

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

ipcMainListeners(ipcMain);
startPrinterConnectionCheckInterval();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

let isQuiting = false;

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

function getAssetPath(...paths: string[]): string {
  return path.join(RESOURCES_PATH, ...paths);
}

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  conf.mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  conf.mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Override the close event
  conf.mainWindow.on('close', (event) => {
    if (!isQuiting) {
      // Check if the app is quitting
      event.preventDefault();
      conf.mainWindow?.hide();
      conf.mainWindow = null;
    } else {
      conf.mainWindow = null;
    }
  });

  conf.mainWindow.on('ready-to-show', () => {
    if (!conf.mainWindow) {
      throw new Error('"conf.mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      conf.mainWindow.minimize();
    } else {
      conf.mainWindow.show();
    }
  });

  conf.mainWindow.on('closed', () => {
    conf.mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(conf.mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  conf.mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

expressApp.use(cors());
expressApp.use(express.json());
initResponseHelper(expressApp);
expressApp.use(mainRoutes);

expressApp.post('/', (req, res) => {
  try {
    const { payload } = req.body || {};
    return res.json({
      success: true,
      message: 'Printed Successfully',
      data: payload,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      message: error?.message || 'Unknown Error',
    });
  }
});
let tray = null;

function createTray() {
  const icon = getAssetPath('icon.png');

  const trayIcon = nativeImage.createFromPath(icon);
  tray = new Tray(trayIcon.resize({ width: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (conf.mainWindow === null) createWindow();
      },
    },
    {
      label: 'Quit',
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Thermal Printer Server');
  tray.setContextMenu(contextMenu);
}
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on(
    'second-instance',
    (event, commandLine, workingDirectory, additionalData) => {
      // Print out data received from the second instance.
      console.log(additionalData);

      // Someone tried to run a second instance, we should focus our window.
      if (conf.mainWindow) {
        if (conf.mainWindow.isMinimized()) conf.mainWindow.restore();
        conf.mainWindow.focus();
      }
    },
  );
  app
    .whenReady()
    .then(() => {
      expressApp.listen(45214, () => {
        console.log('internal api is ready');
      });
      createWindow();
      createTray();

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (conf.mainWindow === null) createWindow();
      });
    })
    .catch(console.log);
}
