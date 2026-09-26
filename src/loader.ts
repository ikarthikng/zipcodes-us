import { ZipCodeInfo } from "./types.js"

// Import pre-processed data directly
// @ts-ignore
import zipCodeDataArray from "../data/zip-data.js"

/**
 * Loads ZIP code data - works in both browser and Node environments
 * @returns Map of ZIP codes to their information
 */
export function loadZipCodeData(): Map<string, ZipCodeInfo> {
  const zipMap = new Map<string, ZipCodeInfo>()

  try {
    // Use the imported data array
    if (zipCodeDataArray && Array.isArray(zipCodeDataArray)) {
      for (const item of zipCodeDataArray) {
        zipMap.set(item.zipCode, item)
      }
    } else {
      throw new Error("ZIP code data not available. Make sure zip-data.js is generated correctly.")
    }

    return zipMap
  } catch (error) {
    console.error("Error loading ZIP code data:", error)
    return new Map() // Return empty map in case of error
  }
}
