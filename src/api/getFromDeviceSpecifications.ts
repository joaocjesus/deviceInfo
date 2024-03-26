interface DeviceData {
  html: string;
}

/**
 * Extracts device information from the fetched data.
 * @param data - The fetched data containing device information.
 * @returns The device brand and model if available, otherwise logs an appropriate message.
 */
const getDeviceFromDSData = (data: DeviceData[]): string | undefined => {
    if (data.length > 0) {
      const deviceInfo = data[0];
      const regex = /<div style=".+">(.+)<\/div>/;
      const match = deviceInfo.html.match(regex);
  
      if (match) {
        const device = match[1];
        console.info('Found: ', device);
        return device;
      } else {
        console.error("Unable to extract brand and model using regex!");
      }
    } else {
      console.error('No device found!');
    }
  }
  
/**
 * Fetches device data for a given code from the specified endpoint.
 * @param code - The device code to search for.
 * @returns The device name, or logs an error message if the fetch fails.
 */
const getFromDeviceSpecifications = async (code: string): Promise<string | undefined> => {
    const endpoint = `https://www.devicespecifications.com/index.php?action=search&language=en&search=${code}`;
    let response;
    let data;
    try {
        console.info(`Retrieving '${code}' via DeviceSpecifications...`);
        response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }

        data = await response.json();
        return getDeviceFromDSData(data);
    } catch (error) {
        throw Error(`${error}\nresponse: ${JSON.stringify(response)}\ndata: ${JSON.stringify(data)}`);
    }
}

export default getFromDeviceSpecifications;
