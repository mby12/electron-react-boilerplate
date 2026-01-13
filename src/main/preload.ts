// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

interface InvokeableEventResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export type Channels =
  | 'ipc-example'
  | 'load-store-printer-config'
  | 'load-print-statistic'
  | 'test-print'
  | 'print-last-use'
  | 'open-settings-modal'
  | 'save-printer-ip'
  | 'update-notification-settings-value'
  | 'load-printer-network-setting'
  | 'get-notification-settings'
  | 'printer-connection-result';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on<T>(channel: Channels, func: (...args: T[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke<T, R>(
      channel: Channels,
      ...args: T[]
    ): Promise<InvokeableEventResponse<R>> {
      return ipcRenderer.invoke(channel, ...args); // biar biar biarrrrrrrrrrrrrrrrr ada returnnya
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
