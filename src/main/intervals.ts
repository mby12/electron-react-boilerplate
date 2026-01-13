import { electronStore } from './electronStore';
import conf from './glob';
import { checkPort } from './util';

/* eslint-disable import/prefer-default-export */
let pingingPrinter = false;
export function startPrinterConnectionCheckInterval() {
  setInterval(async () => {
    if (pingingPrinter) {
      return;
    }
    pingingPrinter = true;
    try {
      const ip: string = electronStore.get('printer.ip');
      const port: number = parseInt(electronStore.get('printer.port'), 10);
      if (!ip || Number.isNaN(port) || !port) {
        conf.mainWindow?.webContents.send('printer-connection-result', -10);
        pingingPrinter = false;

        return;
      }
      await checkPort(ip, port, 3000);
      conf.mainWindow?.webContents.send('printer-connection-result', 0);
    } catch (error) {
      conf.mainWindow?.webContents.send('printer-connection-result', 2);
    }
    pingingPrinter = false;
  }, 3500);
}
