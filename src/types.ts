/**
 * Represents information about a ZIP code location
 */
export interface ZipCodeInfo {
  /** 5-digit ZIP code */
  zipCode: string
  /** City or place name */
  placeName: string
  /** Full state name (e.g., "California") */
  stateName: string
  /** Two-letter state code (e.g., "CA") */
  stateCode: string
  /** County name */
  countyName: string
  /** FIPS county code */
  countyCode: string
  /** Optional community name */
  communityName?: string
  /** Optional community code */
  communityCode?: string
  /** Latitude in decimal degrees */
  latitude: number
  /** Longitude in decimal degrees */
  longitude: number
}

/**
 * Internal representation of raw data from GeoNames file
 */
export interface RawZipData {
  countryCode: string
  zipCode: string
  placeName: string
  stateName: string
  stateCode: string
  countyName: string
  countyCode: string
  communityName: string
  communityCode: string
  latitude: number
  longitude: number
  accuracy: number
}
