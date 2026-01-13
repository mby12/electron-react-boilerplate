import { Checkbox, Label } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { StoreType } from '../../../../main/electronStore';

/* eslint-disable react/jsx-no-useless-fragment */
export default function NotificationSettings() {
  const [successPrintChecked, setSuccessPrintChecked] = useState(false);
  const [failedPrintChecked, setFailedPrintChecked] = useState(false);

  const handleSuccessPrintSetingValueChange = async (checked: boolean) => {
    const result = await window.electron.ipcRenderer.invoke(
      'update-notification-settings-value',
      { mode: 'success_print', value: checked },
    );
    console.log(result); // prints "foo"
  };
  const handleFailedPrintSetingValueChange = async (checked: boolean) => {
    const result = await window.electron.ipcRenderer.invoke(
      'update-notification-settings-value',
      { mode: 'failed_print', value: checked },
    );
    console.log(result); // prints "foo"
  };

  const loadValues = async () => {
    const result = await window.electron.ipcRenderer.invoke<
      {},
      StoreType['notification']
    >('get-notification-settings');
    const { failedPrintNotification, successPrintNotification } =
      result.data || {};
    console.log('NOTIFICATIONS');
    setSuccessPrintChecked(successPrintNotification || false);
    setFailedPrintChecked(failedPrintNotification || false);
  };

  useEffect(() => {
    loadValues();
    return () => {};
  }, []);

  return (
    <>
      <div className="p-6 bg-gray-50 text-medium text-gray-500 dark:text-gray-400 dark:bg-gray-800 rounded-lg w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Windows Notification
        </h3>
        <div className="space-y-2">
          <div className="flex justify-start items-center gap-2">
            <Checkbox
              id="success_print"
              checked={successPrintChecked}
              onChange={(e) => {
                handleSuccessPrintSetingValueChange(e.target.checked);
                setSuccessPrintChecked(e.target.checked);
              }}
            />
            <Label htmlFor="success_print">Success Print</Label>
          </div>
          <div className="flex justify-start items-center gap-2">
            <Checkbox
              id="failed_print"
              checked={failedPrintChecked}
              onChange={(e) => {
                handleFailedPrintSetingValueChange(e.target.checked);
                setFailedPrintChecked(e.target.checked);
              }}
            />
            <Label htmlFor="failed_print">Failed Print</Label>
          </div>
        </div>
      </div>
    </>
  );
}
