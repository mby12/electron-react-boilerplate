/* eslint-disable func-names */
/* eslint-disable import/prefer-default-export */
import { Alert, Button, Card } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import type { StoreType } from '../../main/electronStore';

export const DashboardComponent: React.FC<{
  printerConnected: number;
}> = function ({ printerConnected }) {
  const [statistics, setStatistics] = useState<StoreType['statistics']>();

  const actionTestPrint = function () {
    window.electron.ipcRenderer.sendMessage('test-print', '');
  };

  const actionPrintLastUse = function () {
    window.electron.ipcRenderer.sendMessage('print-last-use', '');
  };

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('load-store-printer-config', [
      'full',
    ]);
    const w = window.electron.ipcRenderer.on(
      'load-print-statistic',
      (config: StoreType['statistics']) => {
        setStatistics(config);
      },
    );

    return () => {
      w();
    };
  }, []);
  return (
    <>
      {printerConnected !== 0 && printerConnected !== -1 && (
        <Alert color="warning" rounded>
          <span className="font-medium">Printer tidak terhubung!</span> Pastikan
          printer dan Aplikasi ini sudah terkonfigurasi dengan benar. Lihat tab{' '}
          <span className="font-bold">Dokumentasi</span> untuk cara konfigurasi.
        </Alert>
      )}
      <div className="grid grid-cols-3 gap-8 mt-4">
        <Card className="w-full">
          <h5 className="text-xl font-medium text-gray-500 dark:text-gray-400">
            Total Receipt Printed
          </h5>
          <div className="flex items-baseline text-gray-900 dark:text-white">
            <span className="text-5xl font-extrabold tracking-tight">
              {statistics?.total || 0}
            </span>
          </div>
        </Card>
        <Card className="w-full">
          <h5 className="text-xl font-medium text-gray-500 dark:text-gray-400">
            Success Receipt Printed
          </h5>
          <div className="flex items-baseline text-gray-900 dark:text-white">
            <span className="text-5xl font-extrabold tracking-tight">
              {statistics?.success || 0}
            </span>
          </div>
        </Card>
        <Card className="w-full">
          <h5 className="text-xl font-medium text-gray-500 dark:text-gray-400">
            Failed Receipt Printed
          </h5>
          <div className="flex items-baseline text-gray-900 dark:text-white">
            <span className="text-5xl font-extrabold tracking-tight">
              {statistics?.failed || 0}
            </span>
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Tools
        </h5>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={printerConnected !== 0}
            onClick={() => actionPrintLastUse()}
          >
            Print Last
          </Button>
          <Button
            disabled={printerConnected !== 0}
            color="blue"
            onClick={() => actionTestPrint()}
          >
            Test Printer
          </Button>
        </div>
      </Card>
    </>
  );
};
