/* Set the parameters according to your requirements */

// Default input file with codes if not provided via command line
export const DEFAULT_INPUT_FILE = './data/device-codes.txt';

// Default putput directory if not provided via command line
export const OUTPUT_DIR = './output';

// Default input file with codes if not provided via command line
export const DEFAULT_OUTPUT_FILE = OUTPUT_DIR + '/device_info.csv';

// Write output to file
export const OUTPUT_SINGLE_QUERY_TO_FILE = false;

// Saves 'not found' devices to a separate file
export const NOT_FOUND_FILE = true;

// Saves 'not found' devices to main output file
export const NOTFOUND_TO_MAIN_OUTPUT = true;

// Whether it adds an extra row at the end of the file with some stats
export const OUTPUT_STATS = true;

// Uses Google Custom Search service if device is not found using DeviceSpecifications
// This requires a Google Programmable Search Engine setup (https://support.google.com/programmable-search/answer/4513751)
// Also requires the API_KEY and CUSTOM_SEARCH_ID environment variables to be set.
// E.g.: https://customsearch.googleapis.com/customsearch/v1?key=<APIKey>&cx=<CustomSearchID>
export const USE_GOOGLE_CUSTOM_SEARCH = false;
export const GOOGLE_CUSTOM_SEARCH_URL = 'https://customsearch.googleapis.com/customsearch/v1';

// Caches results for future queries
export const WRITE_TO_CACHE = true;
export const READ_FROM_CACHE = true;
export const CACHE_FILE =  './data/deviceInfoCache.json';

// Logs certain output to console if DEBUG_MODE=true
export const DEBUG_MODE = false;
