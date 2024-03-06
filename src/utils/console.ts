/**
 * Displays help information on how to use the script.
 */
export const printHelp = () => {
    console.info("DeviceInfo v0.1");
    console.info("---------------\n");
    console.info("Usage:\n");
    console.info("No parameters\t\t\t\tRun with defaults");
    console.info("<manufacturer_code>\t\t\tGet device from code (output to console)");
    console.info("<input_txt_file> <output_csv_file>\tProvide custom filenames for input and output");
    console.info("[? -? -h -help]\t\t\t\tThis help message\n");
    console.info("Examples:\n");
    console.info("npm start SM-S918B");
    console.info("npm start ./data/device-codes.txt ./output/new-output.csv");
    console.info("npm start ./new_codes.txt ./output/output.csv");
    process.exit();
  }
  