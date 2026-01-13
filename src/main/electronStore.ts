import Store from 'electron-store';
import conf from './glob';
import { isValidIP } from './util';

export interface StoreType {
  printer: {
    get_ip_method?: 'automatic' | 'manual';
    ip?: string;
    port?: number;
    subnet?: string;
    gateway?: string;
    last_payload?: string;
  };
  statistics: {
    total: number;
    success: number;
    failed: number;
  };
  notification: {
    successPrintNotification: boolean;
    failedPrintNotification: boolean;
  };
}

export const electronStore = new Store<StoreType>({
  defaults: {
    printer: {
      ip: undefined,
      port: 9100,
      get_ip_method: undefined,
      gateway: undefined,
      subnet: undefined,
      last_payload: undefined,
    },
    statistics: {
      total: 0,
      success: 0,
      failed: 0,
    },
    notification: {
      successPrintNotification: false,
      failedPrintNotification: true,
    },
  },
});

interface UpdateArgs {
  mode?: '-' | '+';
}

const updateTotalStatistics = () => {
  electronStore.set(
    'statistics.total',
    (electronStore.get('statistics.success') as number) +
      (electronStore.get('statistics.failed') as number),
  );
};

export const updateSuccessStatistic = ({ mode = '+' }: UpdateArgs = {}) => {
  if (mode === '+') {
    electronStore.set(
      'statistics.success',
      (electronStore.get('statistics.success') as number) + 1,
    );
  } else {
    electronStore.set(
      'statistics.success',
      (electronStore.get('statistics.success') as number) - 1,
    );
  }
  updateTotalStatistics();
};
export const updateFailedStatistic = ({ mode = '+' }: UpdateArgs = {}) => {
  if (mode === '+') {
    electronStore.set(
      'statistics.failed',
      (electronStore.get('statistics.failed') as number) + 1,
    );
  } else {
    electronStore.set(
      'statistics.failed',
      (electronStore.get('statistics.failed') as number) - 1,
    );
  }
  updateTotalStatistics();
};

export const setPrinterIp = (ip: string, port: number) => {
  if (!isValidIP(ip)) throw Error('Invalid IP Address Format');
  const parsedIntegerPort = parseInt(port.toString(), 10);
  if (
    parsedIntegerPort > 65535 ||
    parsedIntegerPort < 0 ||
    Number.isNaN(parsedIntegerPort)
  ) {
    throw Error('Invalid Port Number');
  }
  electronStore.set({ printer: { ip, port } });
};

export const updateSuccessPrintNotificationMode = (val: boolean) => {
  electronStore.set('notification.successPrintNotification', val);
};
export const updateFailedPrintNotificationMode = (val: boolean) => {
  electronStore.set('notification.failedPrintNotification', val);
};

electronStore.onDidChange('statistics', function cb(data) {
  // ipcMain.('load-print-statistic');
  conf.mainWindow?.webContents.send('load-print-statistic', data);
});
