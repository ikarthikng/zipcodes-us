import path from "path"
import zipCodeUtil, {
  find,
  findState,
  findCity,
  findCounty,
  findCoordinates,
  findByCity,
  findByCounty,
  findByRadius,
  getStates,
  ZipCodeInfo
} from "./index"
import { loadZipCodeData } from "./loader"

// Helper function to test distance calculations
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 3958.8 // miles

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

// Use actual data loading instead of mocking
// Note: Tests will use the actual US.txt data file
describe("ZIP Code Utility", () => {
  // Define some known ZIP codes for testing
  // These should exist in the actual data file
  const KNOWN_ZIPS = {
    NYC: "10001", // New York
    BOSTON: "02108", // Boston
    SF: "94102", // San Francisco
    CHICAGO: "60601", // Chicago
    MIAMI: "33101" // Miami
  }

  // Test if data loaded correctly
  describe("Data Loading", () => {
    it("should load data successfully", () => {
      const zipMap = loadZipCodeData()
      expect(zipMap.size).toBeGreaterThan(0)

      // Check if known ZIPs exist in the data
      Object.values(KNOWN_ZIPS).forEach((zip) => {
        expect(zipMap.has(zip)).toBe(true)
      })
    })
  })

  describe("find", () => {
    it("should find complete information for a valid ZIP code", () => {
      const result = find(KNOWN_ZIPS.SF)

      expect(result.isValid).toBe(true)
      expect(result.city).toBeTruthy()
      expect(result.stateCode).toBe("CA")
      expect(result.state).toBe("California")
      expect(result.county).toBeTruthy()
      expect(result.latitude).toBeGreaterThan(0)
      expect(result.longitude).toBeLessThan(0) // West coast longitude is negative
    })

    it("should normalize ZIP codes with whitespace", () => {
      const result = find(` ${KNOWN_ZIPS.NYC} `)

      expect(result.isValid).toBe(true)
      expect(result.stateCode).toBe("NY")
    })

    it("should return invalid result for a known non-existent ZIP code", () => {
      // Choose a ZIP code that's very unlikely to exist (00000 or 99999)
      const result = findCity("00000")

      expect(result).toEqual({
        city: "",
        isValid: false
      })
    })

    it("should return invalid result for improperly formatted ZIP code", () => {
      const invalidZips = ["9410", "941026", "abcde", "941-02"]

      invalidZips.forEach((zip) => {
        const result = find(zip)
        expect(result.isValid).toBe(false)
      })
    })
  })

  describe("findState", () => {
    it("should find state information for a valid ZIP code", () => {
      const result = findState(KNOWN_ZIPS.CHICAGO)

      expect(result).toEqual({
        state: "Illinois",
        stateCode: "IL",
        isValid: true
      })
    })

    it("should return invalid result for non-existent ZIP code", () => {
      const result = findState("99999")

      expect(result).toEqual({
        state: "",
        stateCode: "",
        isValid: false
      })
    })
  })

  describe("findCity", () => {
    it("should find city name for a valid ZIP code", () => {
      const result = findCity(KNOWN_ZIPS.BOSTON)

      expect(result.isValid).toBe(true)
      expect(result.city).toBe("Boston")
    })

    it("should return invalid result for non-existent ZIP code", () => {
      // Using ZIP code 00000 which shouldn't exist in any database
      const result = findCity("00000")

      expect(result).toEqual({
        city: "",
        isValid: false
      })
    })
  })

  describe("findCounty", () => {
    it("should find county name for a valid ZIP code", () => {
      const result = findCounty(KNOWN_ZIPS.NYC)

      expect(result.isValid).toBe(true)
      expect(result.county).toBeTruthy()
    })

    it("should return invalid result for non-existent ZIP code", () => {
      const result = findCounty("invalid")

      expect(result).toEqual({
        county: "",
        isValid: false
      })
    })
  })

  describe("findCoordinates", () => {
    it("should find coordinates for a valid ZIP code", () => {
      const result = findCoordinates(KNOWN_ZIPS.MIAMI)

      expect(result.isValid).toBe(true)
      expect(result.latitude).toBeGreaterThan(25) // Miami is ~25°N
      expect(result.latitude).toBeLessThan(26)
      expect(result.longitude).toBeLessThan(-80) // Miami is ~80°W
      expect(result.longitude).toBeGreaterThan(-81)
    })

    it("should return invalid result for non-existent ZIP code", () => {
      const result = findCoordinates("00001")

      expect(result).toEqual({
        latitude: 0,
        longitude: 0,
        isValid: false
      })
    })
  })

  describe("findByCity", () => {
    it("should find all ZIP codes for a given city and state", () => {
      // San Francisco should have multiple ZIP codes
      const results = findByCity("San Francisco", "CA")

      expect(results.length).toBeGreaterThan(1)
      results.forEach((result) => {
        expect(result.placeName).toBe("San Francisco")
        expect(result.stateCode).toBe("CA")
      })
    })

    it("should normalize city and state inputs", () => {
      const standardResults = findByCity("Boston", "MA")
      const normalizedResults = findByCity(" boston ", " ma ")

      expect(normalizedResults.length).toBe(standardResults.length)
    })

    it("should return empty array for non-existent city", () => {
      const results = findByCity("Nonexistent City XYZ", "CA")

      expect(results).toEqual([])
    })

    it("should return empty array if city or state are empty", () => {
      expect(findByCity("", "CA")).toEqual([])
      expect(findByCity("Boston", "")).toEqual([])
    })
  })

  describe("findByCounty", () => {
    it("should find all ZIP codes in a given county", () => {
      // Try different counties that definitely exist
      const results = findByCounty("New York", "NY")

      expect(results.length).toBeGreaterThan(0)
      results.forEach((result) => {
        expect(result.countyName).toBe("New York")
        expect(result.stateCode).toBe("NY")
      })
    })

    it("should normalize county and state inputs", () => {
      const standardResults = findByCounty("Cook County", "IL")
      const normalizedResults = findByCounty(" cook county ", " il ")

      expect(normalizedResults.length).toBe(standardResults.length)
    })

    it("should return empty array for non-existent county", () => {
      const results = findByCounty("Fake County XYZ", "CA")

      expect(results).toEqual([])
    })

    it("should return empty array if county or state are empty", () => {
      expect(findByCounty("", "NY")).toEqual([])
      expect(findByCounty("Suffolk County", "")).toEqual([])
    })
  })

  describe("findByRadius", () => {
    it("should find ZIP codes within radius of a location", () => {
      // Manhattan coordinates
      const manhattanCoords = findCoordinates(KNOWN_ZIPS.NYC)
      // Small radius (5 miles) should find some ZIP codes in NYC
      const results = findByRadius(manhattanCoords.latitude, manhattanCoords.longitude, 5)

      expect(results.length).toBeGreaterThan(1)

      // Check that at least one result is in NY (more flexible)
      const hasNYResults = results.some((r) => r.stateCode === "NY")
      expect(hasNYResults).toBe(true)
    })

    it("should return more results with larger radius", () => {
      const bostonCoords = findCoordinates(KNOWN_ZIPS.BOSTON)

      const smallRadius = findByRadius(bostonCoords.latitude, bostonCoords.longitude, 5)
      const largeRadius = findByRadius(bostonCoords.latitude, bostonCoords.longitude, 20)

      expect(largeRadius.length).toBeGreaterThan(smallRadius.length)
    })

    it("should sort results by distance", () => {
      const sfCoords = findCoordinates(KNOWN_ZIPS.SF)
      const results = findByRadius(sfCoords.latitude, sfCoords.longitude, 10)

      // The first result should be the closest to the search point
      const distances = results.map((result, index) => {
        const distance = calculateDistance(sfCoords.latitude, sfCoords.longitude, result.latitude, result.longitude)
        return { index, distance }
      })

      distances.sort((a, b) => a.distance - b.distance)

      // First result should be the closest
      expect(distances[0].index).toBe(0)
    })

    it("should return empty array for invalid inputs", () => {
      expect(findByRadius(NaN, -122.4651, 10)).toEqual([])
      expect(findByRadius(37.7057, NaN, 10)).toEqual([])
      expect(findByRadius(37.7057, -122.4651, NaN)).toEqual([])
      expect(findByRadius(37.7057, -122.4651, -5)).toEqual([])
    })
  })

  describe("getStates", () => {
    it("should return all states with their codes", () => {
      const states = getStates()

      // There should be 50+ entries (states + territories)
      expect(states.length).toBeGreaterThan(50)

      // Check some common states exist
      const stateMap = new Map(states.map((s) => [s.code, s.name]))
      expect(stateMap.has("CA")).toBe(true)
      expect(stateMap.get("CA")).toBe("California")
      expect(stateMap.has("NY")).toBe(true)
      expect(stateMap.get("NY")).toBe("New York")
      expect(stateMap.has("TX")).toBe(true)
      expect(stateMap.get("TX")).toBe("Texas")
    })

    it("should return unique states without duplicates", () => {
      const states = getStates()
      const codes = states.map((s) => s.code)
      const uniqueCodes = [...new Set(codes)]

      expect(codes.length).toBe(uniqueCodes.length)
    })
  })

  describe("default export", () => {
    it("should expose all methods through default export", () => {
      expect(zipCodeUtil.find).toBe(find)
      expect(zipCodeUtil.findState).toBe(findState)
      expect(zipCodeUtil.findCity).toBe(findCity)
      expect(zipCodeUtil.findCounty).toBe(findCounty)
      expect(zipCodeUtil.findCoordinates).toBe(findCoordinates)
      expect(zipCodeUtil.findByCity).toBe(findByCity)
      expect(zipCodeUtil.findByCounty).toBe(findByCounty)
      expect(zipCodeUtil.findByRadius).toBe(findByRadius)
      expect(zipCodeUtil.getStates).toBe(getStates)
    })
  })
})
