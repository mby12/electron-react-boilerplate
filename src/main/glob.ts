import type { BrowserWindow } from 'electron';

const conf: {
  mainWindow?: BrowserWindow | null;
} = {
  mainWindow: undefined,
};

export default conf;
