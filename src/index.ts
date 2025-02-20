import { ZipCodeInfo } from "./types"
import { loadZipCodeData } from "./loader"

// Load ZIP code data during module initialization
// This creates the in-memory database when the module is first required
const zipCodeMap = loadZipCodeData()

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
 * Normalized ZIP code lookup helper
 * @param zipCode ZIP code to normalize and look up
 * @returns Tuple of [normalized ZIP code, lookup result]
 */
function normalizedLookup(zipCode: string): [string, ZipCodeInfo | null] {
  const normalizedZip = zipCode.trim()

  if (!/^\d{5}$/.test(normalizedZip)) {
    return [normalizedZip, null]
  }

  return [normalizedZip, zipCodeMap.get(normalizedZip) || null]
}

/**
 * Finds complete information for a ZIP code
 * @param zipCode 5-digit ZIP code to look up
 * @returns Object with location data and validity flag
 */
export function find(zipCode: string): ZipLookupResult {
  const [normalized, info] = normalizedLookup(zipCode)

  if (!info) {
    return {
      state: "",
      stateCode: "",
      city: "",
      county: "",
      latitude: 0,
      longitude: 0,
      isValid: false
    }
  }

  return {
    state: info.stateName,
    stateCode: info.stateCode,
    city: info.placeName,
    county: info.countyName,
    latitude: info.latitude,
    longitude: info.longitude,
    isValid: true
  }
}

/**
 * Finds state information for a ZIP code
 * @param zipCode 5-digit ZIP code to look up
 * @returns State name and code with validity flag
 */
export function findState(zipCode: string): StateResult {
  const [normalized, info] = normalizedLookup(zipCode)

  if (!info) {
    return {
      state: "",
      stateCode: "",
      isValid: false
    }
  }

  return {
    state: info.stateName,
    stateCode: info.stateCode,
    isValid: true
  }
}

/**
 * Finds city name for a ZIP code
 * @param zipCode 5-digit ZIP code to look up
 * @returns City name or empty string with validity flag
 */
export function findCity(zipCode: string): { city: string; isValid: boolean } {
  const [normalized, info] = normalizedLookup(zipCode)

  if (!info) {
    return {
      city: "",
      isValid: false
    }
  }

  return {
    city: info.placeName,
    isValid: true
  }
}

/**
 * Finds county name for a ZIP code
 * @param zipCode 5-digit ZIP code to look up
 * @returns County name or empty string with validity flag
 */
export function findCounty(zipCode: string): { county: string; isValid: boolean } {
  const [normalized, info] = normalizedLookup(zipCode)

  if (!info) {
    return {
      county: "",
      isValid: false
    }
  }

  return {
    county: info.countyName,
    isValid: true
  }
}

/**
 * Finds coordinates for a ZIP code
 * @param zipCode 5-digit ZIP code to look up
 * @returns Latitude and longitude with validity flag
 */
export function findCoordinates(zipCode: string): Coordinates {
  const [normalized, info] = normalizedLookup(zipCode)

  if (!info) {
    return {
      latitude: 0,
      longitude: 0,
      isValid: false
    }
  }

  return {
    latitude: info.latitude,
    longitude: info.longitude,
    isValid: true
  }
}

/**
 * Finds all ZIP codes for a given city and state
 * @param city City name
 * @param stateCode Two-letter state code (e.g., "CA")
 * @returns Array of matching ZIP codes with their information
 */
export function findByCity(city: string, stateCode: string): ZipCodeInfo[] {
  if (!city || !stateCode) {
    return []
  }

  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = stateCode.trim().toUpperCase()

  const results: ZipCodeInfo[] = []

  zipCodeMap.forEach((info) => {
    if (info.placeName.toLowerCase() === normalizedCity && info.stateCode === normalizedState) {
      results.push(info)
    }
  })

  return results
}

/**
 * Find all ZIP codes in a given county
 * @param countyName County name
 * @param stateCode Two-letter state code
 * @returns Array of matching ZIP codes with their information
 */
export function findByCounty(countyName: string, stateCode: string): ZipCodeInfo[] {
  if (!countyName || !stateCode) {
    return []
  }

  const normalizedCounty = countyName.trim().toLowerCase()
  const normalizedState = stateCode.trim().toUpperCase()

  const results: ZipCodeInfo[] = []

  zipCodeMap.forEach((info) => {
    if (info.countyName.toLowerCase() === normalizedCounty && info.stateCode === normalizedState) {
      results.push(info)
    }
  })

  return results
}

/**
 * Find ZIP codes within a radius of a given location
 * @param latitude Center point latitude
 * @param longitude Center point longitude
 * @param radiusMiles Radius in miles
 * @returns Array of ZIP codes within the radius, sorted by distance
 */
export function findByRadius(latitude: number, longitude: number, radiusMiles: number): ZipCodeInfo[] {
  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMiles) || radiusMiles <= 0) {
    return []
  }

  const results: Array<ZipCodeInfo & { distance: number }> = []

  zipCodeMap.forEach((info) => {
    const distance = calculateDistance(latitude, longitude, info.latitude, info.longitude)

    if (distance <= radiusMiles) {
      results.push({
        ...info,
        distance
      })
    }
  })

  // Sort by distance from center point
  return results.sort((a, b) => a.distance - b.distance).map(({ distance, ...rest }) => rest)
}

/**
 * Calculates distance between two coordinate points using the Haversine formula
 * @param lat1 First point latitude
 * @param lon1 First point longitude
 * @param lat2 Second point latitude
 * @param lon2 Second point longitude
 * @returns Distance in miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Earth's radius in miles
  const earthRadius = 3958.8

  // Convert to radians
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Returns all states with their codes and names
 * @returns Array of state objects with code and name
 */
export function getStates(): Array<{ code: string; name: string }> {
  const statesMap = new Map<string, string>()

  zipCodeMap.forEach((info) => {
    if (!statesMap.has(info.stateCode)) {
      statesMap.set(info.stateCode, info.stateName)
    }
  })

  return Array.from(statesMap.entries()).map(([code, name]) => ({ code, name }))
}

// Export types
export { ZipCodeInfo }

// Public API
export default {
  find,
  findState,
  findCity,
  findCounty,
  findCoordinates,
  findByCity,
  findByCounty,
  findByRadius,
  getStates
}
