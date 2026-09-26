import { ZipCodeInfo, RawZipData } from "./types.js"

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
