import { Request, Response } from 'express';
import {
  ThermalPrinter,
  PrinterTypes,
  CharacterSet,
  BreakLine,
} from 'node-thermal-printer';
import axios from 'axios';
import { ActionPrintBody } from './types';

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
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: 'tcp://192.168.8.25:9100', // Printer interface
      characterSet: CharacterSet.PC852_LATIN2, // Printer character set
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
    console.log('connected', isConnected);

    const { arg } = request.body;

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
    try {
      const execute = await printer.execute();
      console.log('Print done!', execute);
      printer.clear();
    } catch (error) {
      console.error('Print failed:', error);
    }
    return response.success({ data: true });
  } catch (error) {
    console.log(error);

    return response.handleCatch(error);
  }
}
