/* eslint-disable react/jsx-no-useless-fragment */
import classNames from 'classnames';
import { useState } from 'react';
import { TiPrinter } from 'react-icons/ti';
import { IoIosNotifications } from 'react-icons/io';
import PrinterSettings from './pages/printer_settings';
import NotificationSettings from './pages/notification_settings';

type SelectedTab = 'printer' | 'notification';

const selectedTabClass = {
  selected:
    'inline-flex items-center px-4 py-3 text-white bg-blue-700 rounded-lg active w-full dark:bg-blue-600',
  notSelected:
    'inline-flex items-center px-4 py-3 rounded-lg hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-full dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white',
  iconSelected: 'w-4 h-4 me-2 text-white',
  iconNotSelected: 'w-4 h-4 me-2 text-gray-500 dark:text-gray-400',
};

export default function SettingsModalBase() {
  const [selectedTab, setSelectedTab] = useState<SelectedTab>('printer');

  return (
    <>
      <div className="md:flex">
        <ul className="flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0">
          <li>
            <a
              href="#a"
              className={classNames({
                [selectedTabClass.selected]: selectedTab === 'printer',
                [selectedTabClass.notSelected]: selectedTab !== 'printer',
              })}
              aria-current="page"
              onClick={() => setSelectedTab('printer')}
            >
              <TiPrinter
                className={classNames({
                  [selectedTabClass.iconSelected]: selectedTab === 'printer',
                  [selectedTabClass.iconNotSelected]: selectedTab !== 'printer',
                })}
              />
              Print
            </a>
          </li>
          <li>
            <a
              href="#b"
              className={classNames({
                [selectedTabClass.selected]: selectedTab === 'notification',
                [selectedTabClass.notSelected]: selectedTab !== 'notification',
              })}
              onClick={() => setSelectedTab('notification')}
            >
              <IoIosNotifications
                className={classNames({
                  [selectedTabClass.iconSelected]:
                    selectedTab === 'notification',
                  [selectedTabClass.iconNotSelected]:
                    selectedTab !== 'notification',
                })}
              />
              Notification
            </a>
          </li>
        </ul>
        {selectedTab === 'printer' && <PrinterSettings />}
        {selectedTab === 'notification' && <NotificationSettings />}
      </div>
    </>
  );
}
