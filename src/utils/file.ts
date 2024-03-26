import fs from 'fs';
import path from 'path';
import { stringify } from 'csv';

type writeToFileProps = {
  values: Array<unknown>;
  outputFile: string;
  columns?: string[];
  message?: string;
}

const encoding = "utf8";

/**
 * Reads text from a file.
 * @param filename - The path to the input file containing the text.
 * @returns An array of lines of text.
 */
const readTXTFile = (filename: string) => {
  let lines;
  try {
    lines = fs.readFileSync(filename, 'utf-8')
      .toString()
      .replace(/\r/g, "")
      .split('\n');

  } catch (error) {
    console.error(error);
  }
  return lines;
}

/**
 * Reads JSON data from a file.
 * @param filename - The path to the input file containing the JSON data.
 * @returns The JSON data.
 */
const readJSONFile = (filename: string) => {
  let contents: string = '';
  try {
    contents = fs.readFileSync(filename, 'utf-8');
  } catch (error) {
    throw Error(`${error}`);
  }
  if (contents) {
    return JSON.parse(contents);
  }
}

/**
 * Creates directory if it doesn't exist
 * @param outputFile - The path to the file.
 */
const createDirIfNotPresent = (outputFile: string) => {
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

/**
 * Writes the provided values to a CSV file.
 * @param values - The data to be written to the CSV.
 * @param outputFile - The path of the output CSV file.
 */
const writeToCSV = ({ values, outputFile, columns, message }: writeToFileProps) => {
  stringify(values, { columns, header: true }, (err, csvOutput) => {
    if (err) throw err;
    createDirIfNotPresent(outputFile);
    fs.writeFileSync(outputFile, csvOutput, { encoding });
    console.info(message || `CSV results written to ${outputFile}`);
  });
}

/**
 * Writes the provided values to a TXT file.
 * @param values - The data to be written to the TXT.
 * @param outputFile - The path of the output TXT file.
 */
const writeToTXT = ({ values, outputFile, message }: writeToFileProps) => {
  try {
    createDirIfNotPresent(outputFile);
    fs.writeFileSync(outputFile, values.join('\n'), { encoding });
    console.info(message || `Text results written to ${outputFile}`);
  }
  catch (error) {
    console.error(error);
  }
}

/**
 * Writes the provided values in JSON format to a file.
 * @param values - The data to be written to the JSON file.
 * @param outputFile - The path of the output JSON file.
 */
const writeToJSON = ({ values, outputFile, message }: writeToFileProps) => {
  try {
    createDirIfNotPresent(outputFile);
    fs.writeFileSync(outputFile, JSON.stringify(values), { encoding });
    console.info(message || `JSON results written to ${outputFile}`);
  }
  catch (error) {
    console.error(error);
  }
}

export { readTXTFile, readJSONFile, writeToCSV, writeToTXT, writeToJSON };
