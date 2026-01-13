import { IpcMain } from 'electron';
import { printUsingArgs, testPrint } from './api/controllers';
import {
  electronStore,
  setPrinterIp,
  updateFailedPrintNotificationMode,
  updateSuccessPrintNotificationMode,
} from './electronStore';

export default function ipcMainListeners(ipcMain: IpcMain) {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('load-store-printer-config', async (event, arg) => {
    console.log('arg', arg);
    const getStore = electronStore.get('printer');
    event.reply('load-store-printer-config', getStore);
  });
  ipcMain.on('load-print-statistic', async (event, arg) => {
    const getStore = electronStore.get('statistics');
    console.log('arg', arg, getStore);
    event.reply('load-print-statistic', getStore);
  });

  ipcMain.on('test-print', async (event) => {
    testPrint();
    event.reply('test-print', 'OK');
  });

  ipcMain.on('print-last-use', async (event) => {
    const getLastPayload = electronStore.get('printer.last_payload');
    if (getLastPayload) {
      printUsingArgs(getLastPayload);
    }
    event.reply('print-last-use', 'OK');
  });

  ipcMain.handle('save-printer-ip', (_event, args) => {
    const [ip, port] = args;
    try {
      setPrinterIp(ip, port);
      return { success: true, message: 'Saved successfully', data: null };
    } catch (error: any) {
      return { success: false, message: error?.message, data: null };
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('load-printer-network-setting', (_event, _args) => {
    try {
      const storedPrinterSettings = electronStore.get('printer');
      return {
        success: true,
        message: 'Retreived successfully',
        data: {
          ip: storedPrinterSettings.ip,
          port: storedPrinterSettings.port,
        },
      };
    } catch (error: any) {
      return { success: false, message: error?.message, data: null };
    }
  });
  // updateSuccessPrintNotificationMode
  ipcMain.handle('update-notification-settings-value', (_event, _args) => {
    try {
      const { mode, value } = _args;
      if (mode === 'success_print') {
        updateSuccessPrintNotificationMode(value);
      }
      if (mode === 'failed_print') {
        updateFailedPrintNotificationMode(value);
      }
      return {
        success: true,
        message: 'Updated successfully',
        data: null,
      };
    } catch (error: any) {
      return { success: false, message: error?.message, data: null };
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('get-notification-settings', (_event, _args) => {
    try {
      const getData = electronStore.get('notification');
      return {
        success: true,
        message: 'Retreived Notification Settings Store Successfully',
        data: getData,
      };
    } catch (error: any) {
      return { success: false, message: error?.message, data: null };
    }
  });
}
