/* eslint-disable react/jsx-props-no-spreading */
import { Button, Label, TextInput } from 'flowbite-react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormValues = {
  ip_address: string;
  port: string;
};
/* eslint-disable react/jsx-no-useless-fragment */
export default function PrinterSettings() {
  const { register, handleSubmit, setValue } = useForm<FormValues>();

  const saveSettings: SubmitHandler<FormValues> = async (data) => {
    const result = await window.electron.ipcRenderer.invoke('save-printer-ip', [
      data.ip_address,
      data.port,
    ]);
    console.log(result); // prints "foo"
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(`Failed to save: ${result.message}`);
    }
  };

  const loadPrinterSettings = async () => {
    const result = await window.electron.ipcRenderer.invoke<
      {},
      { ip: string; port: string }
    >('load-printer-network-setting');
    // setValue('ip_address', '');
    const { ip, port } = result.data || {};
    setValue('ip_address', ip || '');
    setValue('port', port || '');
  };

  useEffect(() => {
    loadPrinterSettings();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="p-6 bg-gray-50 text-medium text-gray-500 dark:text-gray-400 dark:bg-gray-800 rounded-lg w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Printer Device
        </h3>
        <form onSubmit={handleSubmit(saveSettings)}>
          <div className="mb-2">
            <div className="block">
              <Label htmlFor="email1" value="IP Address" />
            </div>
            <TextInput
              id="email1"
              type="text"
              {...register('ip_address')}
              required
            />
          </div>
          <div className="mb-2">
            <div className="block">
              <Label htmlFor="port" value="Port" />
            </div>
            <TextInput id="port" type="text" {...register('port')} required />
          </div>
          {/* <div className="mb-2">
          <div className="block">
            <Label htmlFor="subnet" value="Subnet Mask" />
          </div>
          <TextInput
            id="subnet"
            type="text"
            placeholder="255.255.255.0"
            required
          />
        </div>
        <div className="mb-2">
          <div className="block">
            <Label htmlFor="gateway" value="Gateway" />
          </div>
          <TextInput
            id="gateway"
            type="text"
            placeholder="192.168.1.1"
            required
          />
        </div> */}

          <div className="flex justify-end">
            <Button color="blue" type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
