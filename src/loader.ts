import { ZipCodeInfo, RawZipData } from "./types.js"

// Import pre-processed data directly
// @ts-ignore
import packedZipCodeData from "../data/zip-data.js"

/**
 * Separators for the packed data format written by process-data.ts.
 *
 * The packed string is four sections joined by SECTION_SEPARATOR:
 *
 *   0. states   - one "stateName<TAB>stateCode" per line
 *   1. counties - one "countyName<TAB>countyCode" per line
 *   2. places   - one place name per line
 *   3. entries  - one ZIP code per line:
 *                 zipCode, placeIndex, stateIndex, countyIndex, latitude, longitude
 *                 plus communityName and communityCode on the records that have them
 *
 * Indexes are base 36. State, county and place names repeat heavily across the 41,000 records -
 * there are only 53 states and 1,864 county names - so naming each one once and pointing at it is
 * what keeps the file small. None of these separators occur in any GeoNames field.
 */
export const SECTION_SEPARATOR = "\u0000"
export const LINE_SEPARATOR = "\n"
export const FIELD_SEPARATOR = "\t"

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
    if (typeof packedZipCodeData !== "string" || !packedZipCodeData) {
      throw new Error("ZIP code data not available. Make sure zip-data.js is generated correctly.")
    }

    const sections = packedZipCodeData.split(SECTION_SEPARATOR)

    if (sections.length !== 4) {
      throw new Error("ZIP code data is malformed. Re-run 'npm run process-data' to regenerate it.")
    }

    const states = sections[0].split(LINE_SEPARATOR).map((state) => state.split(FIELD_SEPARATOR))
    const counties = sections[1].split(LINE_SEPARATOR).map((county) => county.split(FIELD_SEPARATOR))
    const places = sections[2].split(LINE_SEPARATOR)

    for (const entry of sections[3].split(LINE_SEPARATOR)) {
      const fields = entry.split(FIELD_SEPARATOR)
      const state = states[parseInt(fields[2], 36)]
      const county = counties[parseInt(fields[3], 36)]

      const info: ZipCodeInfo = {
        zipCode: fields[0],
        placeName: places[parseInt(fields[1], 36)],
        stateName: state[0],
        stateCode: state[1],
        countyName: county[0],
        countyCode: county[1],
        latitude: parseFloat(fields[4]),
        longitude: parseFloat(fields[5])
      }

      // Only add optional fields if they have values
      if (fields[6]) {
        info.communityName = fields[6]
      }

      if (fields[7]) {
        info.communityCode = fields[7]
      }

      zipMap.set(info.zipCode, info)
    }

    return zipMap
  } catch (error) {
    console.error("Error loading ZIP code data:", error)
    return new Map() // Return empty map in case of error
  }
}
