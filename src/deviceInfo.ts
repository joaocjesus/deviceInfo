import dotenv from 'dotenv';
dotenv.config();

import log from "./utils/log.js";
import getFromDeviceSpecifications from './api/getFromDeviceSpecifications.js';
import getFromGoogleSearch from './api/getFromGoogleSearch.js';
import { writeToCSV, writeToTXT, readTXTFile, writeToJSON, readJSONFile } from './utils/file.js';
import { printHelp } from './utils/console.js';
import {
  NOT_FOUND_FILE,
  NOTFOUND_TO_MAIN_OUTPUT,
  OUTPUT_STATS,
  USE_GOOGLE_CUSTOM_SEARCH,
  DEFAULT_INPUT_FILE,
  DEFAULT_OUTPUT_FILE,
  OUTPUT_SINGLE_QUERY_TO_FILE,
  WRITE_TO_CACHE,
  READ_FROM_CACHE,
  CACHE_FILE,
  USE_DEVICE_SPECIFICATIONS,
} from './config/config.js';

type ProcessCodesProps = {
  inputFile: string;
  code?: string;
  outputFile?: string;
};

type DeviceInfo = {
  code: string;
  device?: string;
  comment?: string;
} | undefined;

const results: Array<DeviceInfo> = [];
const results_notfound: Array<DeviceInfo> = [];
const results_notfound_plain: Array<string> = [];
const googleSearchResults: Array<string> = [];
let codes: string[] = [];
let cache: Array<DeviceInfo>;
let codesCount: number;
let cacheEnabled = false;
let outputFile = DEFAULT_OUTPUT_FILE;
const separator = '-'.repeat(50) + '\n'; // Print dashes as a separator

/**
 * Processes device codes from an input file and writes the results to an output CSV file.
 * @param inputFilename - The path to the input file containing device codes.
 * @param outputFilename - The path to the output CSV file where results will be written.
 */
async function processCodes({ code, inputFile, outputFile }: ProcessCodesProps) {
  console.info(`Input file: ${inputFile}`);
  console.info(`Output file: ${outputFile}\n`);

  if (code) {
    codes = [code];
  } else {
    try {
      codes = readTXTFile(inputFile) || [];
    }
    catch (error) {
      console.error(error);
    }
  }
  codesCount = codes?.length;
  if (!codes || codesCount === 0) throw Error('No codes found!');
  console.info(`${codesCount} codes to process!\n`);

  if (READ_FROM_CACHE || WRITE_TO_CACHE) {
    console.info('Loading cache...');
    try {
      cache = readJSONFile(CACHE_FILE);
      if (cache) console.info(`Cache loaded: ${cache.length} items!`);
      cacheEnabled = true;
    }
    catch (error) {
      console.warn(`Not able to read cache file (${CACHE_FILE}).`)
      if (WRITE_TO_CACHE) cache = [];
    }
  }

  console.info(separator);
  let count = 0;
  for (const code of codes) {
    let device;
    let comment;
    let modelCode = code.trim();
    console.info(`(${++count}/${codesCount}) ${code}`);
    if (cacheEnabled) {
      const cached = cache.find((item: DeviceInfo) => item && item.code === modelCode);
      if (cached) {
        device = cached.device;
        console.info('Cached:', device);
        comment = `Cached`;
      } else {
        console.info('Not in cache!');
      }
    }

    if (USE_DEVICE_SPECIFICATIONS) {
      if (!device) {
        // Attempting to find device via DeviceSpecifications
        device = await getFromDeviceSpecifications(modelCode);
        if (device) {
          comment = `Found via DeviceSpecifications`;
        }
      }

      // If not found, retry if it contains a '/'
      if (!device && modelCode.includes('/')) {
        let trimmed;
        trimmed = modelCode.split('/')[0];
        // Attempting to find device via DeviceSpecifications
        device = await getFromDeviceSpecifications(trimmed);
        if (device) {
          comment += ` (trimmed '/')`;
        }
      }
    }

    // If not found in DeviceSpecifications, use Google Search
    if (!device && USE_GOOGLE_CUSTOM_SEARCH) {
      const model = code.trim();
      // Attempting to find device via Google Custom Search
      device = await getFromGoogleSearch(model);
      if (device) {
        googleSearchResults.push(model);
        comment = 'Found via Google Custom Search';
        log(comment);
      }
    }

    // Write results
    if (!device) {
      if (NOT_FOUND_FILE) {
        results_notfound.push({ code });
        results_notfound_plain.push(code);
      }
      if (NOTFOUND_TO_MAIN_OUTPUT) {
        results.push({ code, device: '', comment: 'Not found!' });
      }
    } else {
      results.push({ code, device, comment });
    }
    console.info(); // Line break
  }
  saveResults();
}

async function saveResults() {
  return new Promise(resolve => {
    const stats: DeviceInfo[] = [];
    if (OUTPUT_STATS) {
      const gSearchEnabled = USE_GOOGLE_CUSTOM_SEARCH ? '' : ' (Not enabled)';
      const googleFound = `Found with Google Search: ${googleSearchResults.length}${gSearchEnabled}`;
      const statsContent: DeviceInfo = {
        code: `Total: ${codesCount}   Processed: ${results.length}`,
        comment: `${cache ? `Already cached: ${cache.length}   ` : ''}Not found: ${results_notfound.length}`,
        device: googleFound,
      };
      stats.push(statsContent);
      console.info(separator); // Print dashes as a separator
      console.info(Object.values(statsContent).join('\n'));
      console.info(); // Line break
    }

    if (WRITE_TO_CACHE && results.length > 0) {
      let values = results;
      let newItems = 0;
      if (cache) {
        // Check if device already exists in cache and adds it if it doesn't
        for (const filteredDevice of results) {
          if (filteredDevice && filteredDevice.device && filteredDevice?.device.length > 0) {
            const foundInCache = cache.find((item: DeviceInfo) => item?.code && item.code === filteredDevice.code);
            if (!foundInCache) {
              cache.push(filteredDevice);
              newItems++;
            }
          }
        }
        values = cache;
      }

      writeToJSON({
        values,
        outputFile: CACHE_FILE,
        message: newItems > 0
          ? `Cached ${newItems} new result(s)!`
          : 'Cache: No new devices found to store.',
      });
    }

    // Write results to CSV
    if (outputFile) {
      if (results.length > 0) {
        writeToCSV({
          outputFile,
          values: [...results, ...stats],
          message: `Results written to ${outputFile}`,
          columns: ['code', 'device', 'comment'],
        });
      }
      if (results_notfound.length > 0) {
        const notFoundOutputTXT = outputFile.replace('.csv', '_not-found.txt');
        writeToTXT({
          values: results_notfound_plain,
          outputFile: notFoundOutputTXT,
          message: `Not found codes written to ${notFoundOutputTXT}`
        });
      }
    }
    resolve(true);
  });
};

async function shutdown(exitType: number | string | Error) {
  console.info(); // Line break
  if (exitType !== 0) {
    console.info(`Exiting (code: ${exitType})...`);
  }
  await saveResults();
  process.exit(isNaN(+exitType) ? 1 : +exitType);
}

[
  'uncaughtException', 'unhandledRejection',
  'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP',
  'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV',
  'SIGUSR2', 'SIGTERM',
].forEach(evt => process.on(evt, shutdown));

// If more parameters exist
if (process.argv.length > 4) {
  printHelp();
}

// Assumes no arguments and run with defaults
if (process.argv.length === 2) {
  processCodes({ inputFile: DEFAULT_INPUT_FILE, outputFile: DEFAULT_OUTPUT_FILE });
}

// Get code from command-line arguments and outputs to console
if (process.argv.length === 3) {
  const arg = process.argv[2];

  if (['?', '-?', '-h', '-help'].includes(arg)) {
    printHelp();
  }

  const inputFile = DEFAULT_INPUT_FILE;
  const outputFile = OUTPUT_SINGLE_QUERY_TO_FILE ? DEFAULT_OUTPUT_FILE : undefined;
  processCodes({ inputFile, outputFile, code: arg });
}

// Assumes input and output filenames are provided
if (process.argv.length === 4) {
  let inputFile = process.argv[2];
  let outputFile = process.argv[3];
  processCodes({ inputFile, outputFile });
}
