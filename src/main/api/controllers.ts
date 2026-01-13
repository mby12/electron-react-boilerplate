import { Request, Response } from 'express';
import {
  ThermalPrinter,
  PrinterTypes,
  CharacterSet,
  BreakLine,
} from 'node-thermal-printer';
import axios from 'axios';
import moment from 'moment';
import { app } from 'electron';
import path from 'path';
import { ActionPrintBody } from './types';
import {
  electronStore,
  updateFailedStatistic,
  updateSuccessStatistic,
} from '../electronStore';
import { showNotification } from '../util';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../../assets');

function getAssetPath(...paths: string[]): string {
  return path.join(RESOURCES_PATH, ...paths);
}

async function getBufferFromUrl(url: string): Promise<Buffer | undefined> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 5000,
    });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    return undefined;
  }
}

export async function printUsingArgs(body: any) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
    interface: `tcp://${electronStore.get('printer.ip')}:${electronStore.get(
      'printer.port',
    )}`, // Printer interface
    characterSet: CharacterSet.PC437_USA, // Printer character set
    removeSpecialCharacters: false, // Removes special characters - default: false
    lineCharacter: '=', // Set character for lines - default: "-"
    breakLine: BreakLine.WORD, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options: {
      // Additional options
      timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
    },
  });

  const isConnected = await printer.isPrinterConnected(); // Check if printer is connected, return bool of status
  if (!isConnected) throw Error('Printer not connected');

  const { arg } = body;

  // eslint-disable-next-line no-restricted-syntax
  for (const printArg of arg) {
    const { CMD, ARGS = undefined } = printArg;
    switch (CMD) {
      case 'ALIGN-CENTER':
        printer.alignCenter();
        break;
      case 'ALIGN-LEFT':
        printer.alignLeft();
        break;
      case 'ALIGN-RIGHT':
        printer.alignRight();
        break;
      case 'TABLE-CUSTOM':
        printer.tableCustom(ARGS);
        break;
      case 'NEWLINE':
        printer.newLine();
        break;
      case 'DRAWLINE':
        printer.drawLine(ARGS);
        break;
      case 'PRINT-QR':
        printer.printQR(ARGS);
        break;
      case 'CUT':
        printer.cut();
        break;
      case 'TEXT-LN':
        printer.println(ARGS);
        break;
      case 'TEXT':
        printer.print(ARGS);
        break;
      case 'LEFT-RIGHT': {
        const [LEFT_STR, RIGHT_STR] = ARGS;
        printer.leftRight(LEFT_STR, RIGHT_STR); // Prints text left and right
        break;
      }
      case 'LOGO': {
        // eslint-disable-next-line no-await-in-loop
        await printer.printImage(getAssetPath('company_logo.png')); // Print PNG image
        break;
      }
      case 'IMAGE-URL': {
        // eslint-disable-next-line no-await-in-loop
        const imageBuffer = await getBufferFromUrl(ARGS);
        if (!imageBuffer) {
          break;
        }
        printer.printImageBuffer(imageBuffer);
        break;
      }
      // case 'FEED':
      //   printer.feed(ARGS as number);
      //   break;
      // case 'FONT':
      //   printer.font(ARGS as FontFamily);
      //   break;
      // case 'LINE_SPACE':
      //   printer.lineSpace(ARGS as number);
      //   break;
      // case 'STYLE':
      //   printer.style(ARGS as StyleString);
      //   break;
      // case 'TEXT':
      //   printer.text(ARGS as string);
      //   break;
      // case 'TABLE':
      //   printer.tableCustom(ARGS as CustomTableItem[]);
      //   break;
      default:
        break;
    }
  }
  const execute = await printer.execute();
  console.log('Print done!', execute, printer.getBuffer(), printer.getText());
  printer.clear();
  electronStore.set('printer.last_payload', body);
  updateSuccessStatistic();
  if (
    (electronStore.get(
      'notification.successPrintNotification',
      false,
    ) as boolean) === true
  ) {
    showNotification({
      title: 'Receipt Printer Successfully',
      body: `With the length of ${printer.getBuffer().length} Bytes`,
    });
  }
}

export async function actionIndex(request: Request, response: Response) {
  return response.json({
    data: true,
  });
}

export async function actionPrint(
  request: Request<{}, {}, ActionPrintBody>,
  response: Response,
) {
  try {
    await printUsingArgs(request.body);
    return response.success({ data: true });
  } catch (error) {
    console.log(error);
    if (
      (electronStore.get(
        'notification.failedPrintNotification',
        false,
      ) as boolean) === true
    ) {
      let message = 'Unknown Internal Error';

      // console.log(error instanceof RequestError, error);
      if (error instanceof Error) {
        message = error.message || message;
      } else if (typeof error === 'string') {
        message = error || message;
      }
      showNotification({ title: 'Failed to Print Receipt', body: message });
    }
    updateFailedStatistic();
    return response.handleCatch(error);
  }
}

export async function testPrint() {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
    interface: `tcp://${electronStore.get('printer.ip')}:${electronStore.get(
      'printer.port',
    )}`, // Printer interface
    characterSet: CharacterSet.PC437_USA, // Printer character set
    removeSpecialCharacters: false, // Removes special characters - default: false
    lineCharacter: '=', // Set character for lines - default: "-"
    breakLine: BreakLine.WORD, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options: {
      // Additional options
      timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
    },
  });
  printer.alignCenter();
  printer.bold(true);
  printer.println('Test Print Successfully');
  printer.println(`<--- ${moment().format('DD MMM YYYY HH:mm:ss')} --->`);
  printer.cut();
  try {
    const execute = await printer.execute();
    console.log('Print done!', execute, printer.getBuffer(), printer.getText());
    printer.clear();
    updateSuccessStatistic();
  } catch (error) {
    updateFailedStatistic();
    console.error('Print failed:', error);
  }
}
