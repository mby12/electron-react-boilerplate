/* eslint-disable no-nested-ternary */
/* eslint-disable react/style-prop-object */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Button, Modal, Tabs } from 'flowbite-react';
import { MdDashboard } from 'react-icons/md';
import { GrHelpBook } from 'react-icons/gr';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ToastContainer } from 'react-toastify';
import { DashboardComponent } from './components/dashboard';
import SettingsModalBase from './components/settings/modal_base';

function Hello() {
  const [printerConnected, setPrinterConnected] = useState<number>(-1);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const cc = window.electron.ipcRenderer.on(
      'load-store-printer-config',
      (config) => {
        console.log(config);
      },
    );
    const connectionChecker = window.electron.ipcRenderer.on<number>(
      'printer-connection-result',
      (config) => {
        setPrinterConnected(config);
      },
    );

    const openSettingsModalListener = window.electron.ipcRenderer.on(
      'open-settings-modal',
      () => {
        if (!openModal) setOpenModal(true);
      },
    );

    window.electron.ipcRenderer.sendMessage('load-print-statistic', ['full']);
    return () => {
      cc();
      connectionChecker();
      openSettingsModalListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // window.electron.ipcRenderer.sendMessage('ipc-example', 'a');
  return (
    <div>
      <ToastContainer />

      <Modal show={openModal} onClose={() => setOpenModal(false)} popup>
        <Modal.Header className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600">
          Settings
        </Modal.Header>

        <Modal.Body className="flex-1 overflow-auto p-6">
          <SettingsModalBase />
        </Modal.Body>
        <Modal.Footer className="flex items-center justify-end space-x-2 rounded-b border-gray-200 p-6 dark:border-gray-600 border-t">
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="p-4">
        <div>
          Printer Connection :{' '}
          <span
            className={classNames({
              'font-bold': true,
              'text-red-500': printerConnected === 2,
              'text-blue-500': printerConnected === -10,
              'text-yellow-300': printerConnected === -1,
              'text-emerald-500': printerConnected === 0,
            })}
          >
            {printerConnected === 0
              ? 'CONNECTED'
              : printerConnected === -1
              ? 'CONNECTING'
              : printerConnected === -10
              ? 'APP NOT CONFIGURED'
              : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto px-4">
        <Tabs aria-label="Full width tabs" style="fullWidth">
          <Tabs.Item active title="Dashboard" icon={MdDashboard}>
            <DashboardComponent printerConnected={printerConnected} />
          </Tabs.Item>
          <Tabs.Item title="Dokumentasi" icon={GrHelpBook}>
            This is{' '}
            <span className="font-medium text-gray-800 dark:text-white">
              Profile tab&apos;s associated content
            </span>
            . Clicking another tab will toggle the visibility of this one for
            the next. The tab JavaScript swaps classes to control the content
            visibility and styling.
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
