# DeviceInfo

DeviceInfo is a utility for fetching and displaying device brand/model.
It uses [DeviceSpecifications](https://www.devicespecifications.com) to fetch the information based on provided model code(s).
Can also use a [Google Programmable Search Engine](https://support.google.com/programmable-search) when device is not found using DeviceSpecifications.

Data is cached (enabled by default) so it doesn't query the APIs if code/device is cached.

# Installation
Ensure you have Node.js and npm installed before setting up DeviceInfo.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (which includes npm) installed on your system.
- Google Programmable Search Engine setup (not required, disabled by default)

   *For better results, this application can use a Google Programmable Search Engine. [Read more](https://support.google.com/programmable-search/answer/4513751).*

### Steps

1. Clone the repository to your local machine:
   ```
   git clone https://github.com/joaocjesus/deviceInfo.git
   ```
2. Install the necessary npm packages:
   ```
   npm install
   ```
3. Check/modify configuration options in in `config/config.ts`


#### If using Google Programmable Search Engine:

4. Set environment variables in `.env`:
- Rename `.env.example` to `.env`
- Set `API_KEY` and `CUSTOM_SEARCH_ID` variables
   - `API_KEY`: Your Google Custom Search API key
   - `CUSTOM_SEARCH_ID`: The Search Engine ID


# Usage
DeviceInfo can be used either by providing a single model code via the command line or by passing a text file containing a list of model codes.

**For the available parameters, run from command-line:**
```
npm run usage
```

# FAQ

### Getting error 429 when using Google Programmable Search Engine
   
If query returns error 429, it might mean the search query allowance has been surpassed (free tier = 100 requests per day).

Google is offering a good amount of credits for free if you setup billing (at the time of writing)

### Device not found

I've used several ways to try and find the device based on the manufacturer model code, but some codes are harder to find, specially for less known brands.
If you find a device manually, you can add it to the cache file, so it uses that match when running DeviceInfo.

### Device is incorrect

I've attempted to make it as precise as possible (around 99% based on my testing with over 700+ model codes), but some errors might happen. Open to suggestions.

# Contacts

Email: johncjesus@gmail.com

GitHub: https://github.com/joaocjesus
