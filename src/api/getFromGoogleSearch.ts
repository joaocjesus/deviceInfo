import { GOOGLE_CUSTOM_SEARCH_URL } from "../config/config.js";
import Brands from "../utils/Brands.js";
import log from "../utils/log.js";

type SearchResponse = {
  items?: [{
    title: string;
    pagemap: {
      metatags: [{ 'og:type': string }];
      'cse_thumbnail': string;
    }
  }]
};

const getGoogleCustomSearchUrl = () => {
  return `${GOOGLE_CUSTOM_SEARCH_URL}?key=${process.env.API_KEY}&cx=${process.env.CUSTOM_SEARCH_ID}`;
}

/**
 * Fetches device data for a given code from the specified endpoint.
 * @param code - The device code to search for.
 * @returns The device name, or logs an error message if the fetch fails.
 */
const getFromGoogleSearch = async (code: string) => {
  const endpoint = `${getGoogleCustomSearchUrl()}&q=${code}`;
  log('Google Custom Search Endpoint: ', endpoint);
  let response;
  let data: SearchResponse = {};
  try {
    console.info(`Retrieving '${code}' via Google Search...`);
    response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Error retrieving device [${code}]: ${response.status}`);
    }

    data = await response.json();

    if (data?.items) {
      let titles: string[] = [];
      data.items.forEach(({ title, pagemap }) => {
        const hasBrandInTitle = Brands.get().find(brand => includesIgnoringCase(title.split(' '), brand));
        const isArticle = pagemap?.metatags.find(metaTag => metaTag['og:type'] === 'article');

        if (hasBrandInTitle && !isArticle) {
          titles.push(title);
        }
      });
      const device = findCommonString(titles);
      if (device) {
        console.info(device);
        return device
      }
    }
    console.error('No device found!');
  } catch (error) {
    console.error(error);
    throw Error(`${error}`);
  }
}

export default getFromGoogleSearch;

const includesIgnoringCase = (array: string[], value: string) => {
  const index = array.findIndex((element: string) => {
    return element.toLowerCase() === value.toLowerCase();
  });

  return index !== -1;
}

const isValidBrand = (word: string) => {
  if (!word) return false;

  const split = word.split(' ', 1);
  const brand = split.length > 0 ? split[0] : word;
  const brands = Brands.get();
  return includesIgnoringCase(brands, brand);
}

function findCommonString(titles: string[]) {
  let potentialBrands: string[] = [];

  // Step 1: Find potential brand words
  for (const title of titles) {
    const words = title.split(/\s+/);
    for (const word of words) {
      // Filtering
      const trimmedWord = word.trim();
      if (trimmedWord.length >= 2) {
        if (isValidBrand(trimmedWord)) {
          potentialBrands.push(trimmedWord);
        }
      }
    }
  }

  log('potentialBrands: ', potentialBrands);

  // Step 2: Find the most common 'brand + model' fragment
  const fragmentCounts: { [key: string]: number } = {};
  for (const title of titles) {
    for (const brand of potentialBrands) {
      const brandIndex = title.indexOf(brand);
      if (brandIndex !== -1) {
        let potentialFragment = title.substring(brandIndex).split(/[^a-z0-9\s]/i)[0].trim();

        // Remove 'vs' as some results are comparisons
        if (potentialFragment.toLowerCase().endsWith(" vs")) {
          potentialFragment = potentialFragment.slice(0, -3); // Remove the "vs" (as some results are comparisons)
        }

        // Prioritize exact matches (as before)
        if (!Object.keys(fragmentCounts).includes(potentialFragment)) {
          fragmentCounts[potentialFragment] = 0;
        }
        fragmentCounts[potentialFragment]++;
      }
    }
  }

  log('fragmentCounts: ', fragmentCounts)

  let mostCommonFragment;
  if (Object.keys(fragmentCounts).length > 0) {
    mostCommonFragment = Object.keys(fragmentCounts).reduce((a, b) => fragmentCounts[a] > fragmentCounts[b] ? a : b);
  }
  return mostCommonFragment;
}
