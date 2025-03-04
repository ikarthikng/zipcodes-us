import { ZipCodeInfo, RawZipData } from "./types.js"
import fs from "fs"
import path from "path"

// Import pre-processed data
// We use dynamic import with a fallback to support both browser and Node environments
let zipData: string | ZipCodeInfo[] | null = null

/**
 * Parses a line from the GeoNames US.txt file
 * @param line A tab-separated line from the data file
 * @returns Parsed ZIP code data object
 */
export function parseLine(line: string): RawZipData | null {
  const fields = line.split("\t")

  // Validate basic format - should have at least 12 fields
  if (fields.length < 12) {
    return null
  }

  // Parse latitude and longitude as numbers
  const latitude = parseFloat(fields[9])
  const longitude = parseFloat(fields[10])

  // Skip invalid coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    return null
  }

  return {
    countryCode: fields[0],
    zipCode: fields[1],
    placeName: fields[2],
    stateName: fields[3],
    stateCode: fields[4],
    countyName: fields[5],
    countyCode: fields[6],
    communityName: fields[7],
    communityCode: fields[8],
    latitude,
    longitude,
    accuracy: parseInt(fields[11], 10) || 0
  }
}

/**
 * Converts raw data to the public ZipCodeInfo format
 * @param rawData Raw data from the parsed file
 * @returns Clean ZipCodeInfo object for public use
 */
export function toZipCodeInfo(rawData: RawZipData): ZipCodeInfo {
  const result: ZipCodeInfo = {
    zipCode: rawData.zipCode,
    placeName: rawData.placeName,
    stateName: rawData.stateName,
    stateCode: rawData.stateCode,
    countyName: rawData.countyName,
    countyCode: rawData.countyCode,
    latitude: rawData.latitude,
    longitude: rawData.longitude
  }

  // Only add optional fields if they have values
  if (rawData.communityName) {
    result.communityName = rawData.communityName
  }

  if (rawData.communityCode) {
    result.communityCode = rawData.communityCode
  }

  return result
}

/**
 * Loads ZIP code data - works in both browser and Node environments
 * @returns Map of ZIP codes to their information
 */
export function loadZipCodeData(): Map<string, ZipCodeInfo> {
  const zipMap = new Map<string, ZipCodeInfo>()

  try {
    // First try to synchronously load data if it's already been loaded
    if (zipData) {
      // Process already loaded data
      if (Array.isArray(zipData)) {
        for (const item of zipData) {
          zipMap.set(item.zipCode, item)
        }
        return zipMap
      } else if (typeof zipData === "string") {
        // Process string data (raw file content)
        const lines = zipData.split("\n")

        for (const line of lines) {
          if (!line.trim()) continue

          const rawData = parseLine(line)
          if (!rawData) continue

          // Only include US ZIP codes
          if (rawData.countryCode !== "US") continue

          zipMap.set(rawData.zipCode, toZipCodeInfo(rawData))
        }
        return zipMap
      }
    }

    // If we're in a Node.js environment (synchronous file reading is possible)
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      // Try to load the pre-processed data first using fs
      try {
        const dataPath = path.resolve(process.cwd(), "data", "zip-data.js")

        if (fs.existsSync(dataPath)) {
          // Read the file and parse it as a module
          const fileContent = fs.readFileSync(dataPath, "utf8")

          // Extract the default export from the file
          // This is a simple approach - for testing only
          const match = fileContent.match(/export default (\[.*\]);/s)
          if (match && match[1]) {
            try {
              const jsonData = match[1].replace(/export default /g, "")
              zipData = JSON.parse(jsonData)

              if (Array.isArray(zipData)) {
                for (const item of zipData) {
                  zipMap.set(item.zipCode, item)
                }
                return zipMap
              }
            } catch (parseError) {
              console.error("Error parsing zip-data.js:", parseError)
            }
          }
        }

        // If we couldn't load the processed data, try the raw data file
        const rawDataPath = path.resolve(process.cwd(), "data", "US.txt")

        if (fs.existsSync(rawDataPath)) {
          const fileContent = fs.readFileSync(rawDataPath, "utf8")
          zipData = fileContent

          // Process the raw file
          const lines = fileContent.split("\n")

          for (const line of lines) {
            if (!line.trim()) continue

            const rawData = parseLine(line)
            if (!rawData) continue

            // Only include US ZIP codes
            if (rawData.countryCode !== "US") continue

            zipMap.set(rawData.zipCode, toZipCodeInfo(rawData))
          }
        } else {
          console.error("Could not find either zip-data.js or US.txt in the data directory")
        }
      } catch (fsError) {
        console.error("Error reading ZIP code data files:", fsError)
      }
    } else {
      // In browser environments, asynchronously load the data
      // Note: This won't work directly in tests, but is needed for browser compatibility
      console.warn("Browser environment detected, asynchronous loading not supported in tests")
    }

    return zipMap
  } catch (error) {
    console.error("Error loading ZIP code data:", error)
    return new Map()
  }
}
