import { ZipCodeInfo, ZipLookupResult, StateResult, Coordinates } from "./types.js"
import { loadZipCodeData } from "./loader.js"

// Load ZIP code data during module initialization
const zipCodeMap = loadZipCodeData()

/**
 * Finds complete information for a ZIP code
 * @param zipCode 5-digit ZIP code to look up
 * @returns Object with location data and validity flag
 */
export function find(zipCode: string): ZipLookupResult {
  const info = zipCodeMap.get(zipCode.trim())

  if (!info) {
    return { state: "", stateCode: "", city: "", county: "", latitude: 0, longitude: 0, isValid: false }
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

/** Finds state name and code for a ZIP code */
export function findState(zipCode: string): StateResult {
  const { state, stateCode, isValid } = find(zipCode)
  return { state, stateCode, isValid }
}

/** Finds city name for a ZIP code */
export function findCity(zipCode: string): { city: string; isValid: boolean } {
  const { city, isValid } = find(zipCode)
  return { city, isValid }
}

/** Finds county name for a ZIP code */
export function findCounty(zipCode: string): { county: string; isValid: boolean } {
  const { county, isValid } = find(zipCode)
  return { county, isValid }
}

/** Finds coordinates for a ZIP code */
export function findCoordinates(zipCode: string): Coordinates {
  const { latitude, longitude, isValid } = find(zipCode)
  return { latitude, longitude, isValid }
}

function filterBy(field: "placeName" | "countyName", value: string, stateCode: string): ZipCodeInfo[] {
  if (!value || !stateCode) {
    return []
  }

  const normalizedValue = value.trim().toLowerCase()
  const normalizedState = stateCode.trim().toUpperCase()

  return [...zipCodeMap.values()].filter(
    (info) => info[field].toLowerCase() === normalizedValue && info.stateCode === normalizedState
  )
}

/**
 * Finds all ZIP codes for a given city and state
 * @param city City name
 * @param stateCode Two-letter state code (e.g., "CA")
 */
export function findByCity(city: string, stateCode: string): ZipCodeInfo[] {
  return filterBy("placeName", city, stateCode)
}

/**
 * Find all ZIP codes in a given county
 * @param countyName County name
 * @param stateCode Two-letter state code
 */
export function findByCounty(countyName: string, stateCode: string): ZipCodeInfo[] {
  return filterBy("countyName", countyName, stateCode)
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

// Create and export all methods as named and default export
const zipcodesUs = {
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

// Export as default and as individual named exports
export default zipcodesUs
