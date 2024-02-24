const fs = require('fs');
const path = require('path');
const csv = require('csv-stringify');

const NOT_FOUND_FILE = true;
const NOTFOUND_TO_MAIN_OUTPUT = true;
const OUTPUT_STATS = true;

const DEFAULT_INPUT_FILE = './data/device-codes.txt';
const OUTPUT_DIR = './output';

/**
 * Fetches device data for a given code from the specified endpoint.
 * @param code - The device code to search for.
 * @returns The device data as a JSON object, or logs an error message if the fetch fails.
 */
async function fetchDeviceData(code) {
  const endpoint = `https://www.devicespecifications.com/index.php?action=search&language=en&search=${code}`;

  try {
    console.log(`Retrieving ${code}...`);
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Extracts device information from the fetched data.
 * @param data - The fetched data containing device information.
 * @returns The device brand and model if available, otherwise logs an appropriate message.
 */
function getDevice(data) {
  if (data.length > 0) {
    const deviceInfo = data[0];
    const regex = /<div style=".+">(.+)<\/div>/;
    const match = deviceInfo.html.match(regex);

    if (match) {
      const device = match[1];
      console.log(device);
      return device;
    } else {
      console.log("Unable to extract brand and model using regex");
    }
  } else {
    console.log('No device found');
  }
}

/**
 * Writes the provided values to a CSV file.
 * @param values - The data to be written to the CSV.
 * @param outputFile - The path of the output CSV file.
 */
function writeOutput(values, outputFile) {
  csv.stringify(values, { header: true }, (err, csvOutput) => {
    if (err) throw err;
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, csvOutput);
    console.log(`Results written to ${outputFile}`);
  });
}

/**
 * Reads device codes from a file.
 * @param filename - The path to the input file containing device codes.
 * @returns An array of device codes.
 */
function readFile(filename) {
  try {
    const codes = fs.readFileSync(filename, 'utf-8').split('\n');
    return codes;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Processes device codes from an input file and writes the results to an output CSV file.
 * @param inputFilename - The path to the input file containing device codes.
 * @param outputFilename - The path to the output CSV file where results will be written.
 */
async function processCodes(inputFilename, outputFilename) {
  const notFoundOutputFile = outputFilename.replace('.csv', '_not-found.csv');
  const results = [];
  const results_notfound = [];
  let retries = 0;
  let retriesFound = 0;

  console.log(`Input file: ${inputFilename}`);
  console.log(`Output file: ${outputFilename}\n`);

  const codes = readFile(inputFilename);

  for (const code of codes) {
    let comment = '';
    let data = await fetchDeviceData(code.trim()); // Fetch data for code
    let device = getDevice(data);

    // If not found, retry
    if (!device) {
      let codeRetry = 0;
      let shortCode = code.trim();

      if (shortCode.includes('/')) {
        shortCode = shortCode.split('/')[0];
      } else {
        shortCode = shortCode.slice(0, -1);
      }

      retries++;

      do {
        comment = `${code} not found. Using ${shortCode}`;
        codeRetry++;
        data = await fetchDeviceData(shortCode);  // Fetch data for shortened code
        device = getDevice(data);
        if (device) {
          retriesFound++;
        } else {
          shortCode = shortCode.slice(0, -1);
        }
      }
      while (!device && codeRetry < 3 && shortCode.length > 4);
    }

    if (!device) {
      if (NOT_FOUND_FILE) {
        results_notfound.push({ code });
      }
      if (NOTFOUND_TO_MAIN_OUTPUT) {
        results.push({ code, device, comment });
      }
    } else {
      results.push({ code, device, comment });
    }
    console.log();
  }

  if (OUTPUT_STATS) {
    const stats = { code: `Total: ${codes.length}`, device: `Not found: ${results_notfound.length}` };
    stats.comment = `Found on retries: ${retriesFound} out of ${retries}`;
    results.push(stats);
  }

  // Write results to CSV
  writeOutput(results, outputFilename);
  if (results_notfound.length > 0) {
    writeOutput(results_notfound, notFoundOutputFile);
  }
}

/**
 * Fetches and displays device data for a given code.
 * @param code - The device code to fetch and display information for.
 */
async function displayDevice(code) {
  const data = await fetchDeviceData(code.trim());
  getDevice(data);
}

/**
 * Displays help information on how to use the script.
 */
function printHelp() {
  console.log("DeviceInfo v0.1");
  console.log("---------------\n");
  console.log("Usage:\n");
  console.log("No parameters\t\t\t\tRun with defaults");
  console.log("<manufacturer_code>\t\t\tGet device from code (output to console)");
  console.log("<input_txt_file> <output_csv_file>\tProvide custom filenames for input and output");
  console.log("[? -? -h -help]\t\t\t\tThis help message\n");
  console.log("Examples:\n");
  console.log("node deviceInfo SM-S918B");
  console.log("node deviceInfo ./new_codes.txt ./output/output.csv");
  process.exit();
}

// If more parameters exist
if (process.argv.length > 4) {
  printHelp(true);
}

// Assumes no arguments and run with defaults
if (process.argv.length === 2) {
  const inputFile = DEFAULT_INPUT_FILE;
  const outputFile = OUTPUT_DIR + '/device_info.csv';
  processCodes(inputFile, outputFile);
}

// Get code from command-line arguments and outputs to console
if (process.argv.length === 3) {
  const arg = process.argv[2];
  if (['?', '-?', '-h', '-help'].includes(arg)) {
    printHelp();

  }
  displayDevice(arg);
}

// Assumes input and output filenames are provided
if (process.argv.length === 4) {
  let inputFile = process.argv[2];
  let outputFile = process.argv[3];
  processCodes(inputFile, outputFile);
}
