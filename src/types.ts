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

/**
 * Interface for standardized ZIP code lookup results
 */
export interface ZipLookupResult {
  state: string
  stateCode: string
  city: string
  county: string
  latitude: number
  longitude: number
  isValid: boolean
}

/**
 * Interface for coordinates result
 */
export interface Coordinates {
  latitude: number
  longitude: number
  isValid: boolean
}

/**
 * Interface for state result
 */
export interface StateResult {
  state: string
  stateCode: string
  isValid: boolean
}

/**
 * Interface for the default export
 */
export interface ZipCodeUtils {
  find: (zipCode: string) => ZipLookupResult
  findState: (zipCode: string) => StateResult
  findCity: (zipCode: string) => { city: string; isValid: boolean }
  findCounty: (zipCode: string) => { county: string; isValid: boolean }
  findCoordinates: (zipCode: string) => Coordinates
  findByCity: (city: string, stateCode: string) => ZipCodeInfo[]
  findByCounty: (countyName: string, stateCode: string) => ZipCodeInfo[]
  findByRadius: (latitude: number, longitude: number, radiusMiles: number) => ZipCodeInfo[]
  getStates: () => Array<{ code: string; name: string }>
}
