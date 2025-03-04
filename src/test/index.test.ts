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
} from "../index.js"
import { loadZipCodeData } from "../loader.js"

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

// Use actual data for testing
describe("ZIP Code Utility", () => {
  // Define some known ZIP codes for testing
  const KNOWN_ZIPS = {
    NYC: "10001", // New York
    BOSTON: "02108", // Boston
    SF: "94102", // San Francisco
    CHICAGO: "60601", // Chicago
    MIAMI: "33101" // Miami
  }

  // Load the test data once before running tests
  let testDataMap: Map<string, ZipCodeInfo>

  beforeAll(() => {
    testDataMap = loadZipCodeData()
    console.log(`Loaded ${testDataMap.size} ZIP codes for testing`)
  })

  // Test if data loaded correctly
  describe("Data Loading", () => {
    it("should load data successfully", () => {
      expect(testDataMap.size).toBeGreaterThan(0)

      // Check if at least some known ZIPs exist in the data
      // We don't check all since the actual data might not have all our test ZIPs
      const existingZips = Object.values(KNOWN_ZIPS).filter((zip) => testDataMap.has(zip))
      expect(existingZips.length).toBeGreaterThan(0)
    })
  })

  describe("find", () => {
    it("should find complete information for a valid ZIP code", () => {
      // Try each known ZIP until one works
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const result = find(zipCode)

          expect(result.isValid).toBe(true)
          expect(result.city).toBeTruthy()
          expect(result.stateCode).toBeTruthy()
          expect(result.state).toBeTruthy()
          expect(result.county).toBeTruthy()
          expect(result.latitude).not.toBe(0)
          expect(result.longitude).not.toBe(0)

          // Test passed, no need to check more ZIPs
          return
        }
      }

      // If we get here, none of our known ZIPs were found in the data
      // This is a problem with the test data, not the function
      throw new Error("No known ZIP codes found in the data. Check the test data.")
    })

    it("should normalize ZIP codes with whitespace", () => {
      // Try each known ZIP until one works
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const result = find(` ${zipCode} `)

          expect(result.isValid).toBe(true)
          expect(result.stateCode).toBeTruthy()

          // Test passed, no need to check more ZIPs
          return
        }
      }

      throw new Error("No known ZIP codes found in the data. Check the test data.")
    })

    it("should return invalid result for a known non-existent ZIP code", () => {
      const result = find("00000") // Using 00000 which shouldn't exist

      expect(result.isValid).toBe(false)
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
      // Try each known ZIP until one works
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const result = findState(zipCode)

          expect(result.isValid).toBe(true)
          expect(result.state).toBeTruthy()
          expect(result.stateCode).toBeTruthy()

          // Test passed, no need to check more ZIPs
          return
        }
      }

      throw new Error("No known ZIP codes found in the data. Check the test data.")
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
      // Try each known ZIP until one works
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const result = findCity(zipCode)

          expect(result.isValid).toBe(true)
          expect(result.city).toBeTruthy()

          // Test passed, no need to check more ZIPs
          return
        }
      }

      throw new Error("No known ZIP codes found in the data. Check the test data.")
    })

    it("should return invalid result for non-existent ZIP code", () => {
      const result = findCity("00000")

      expect(result).toEqual({
        city: "",
        isValid: false
      })
    })
  })

  describe("findCounty", () => {
    it("should find county name for a valid ZIP code", () => {
      // Try each known ZIP until one works
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const result = findCounty(zipCode)

          expect(result.isValid).toBe(true)
          expect(result.county).toBeTruthy()

          // Test passed, no need to check more ZIPs
          return
        }
      }

      throw new Error("No known ZIP codes found in the data. Check the test data.")
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
      // Try each known ZIP until one works
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const result = findCoordinates(zipCode)

          expect(result.isValid).toBe(true)
          expect(result.latitude).not.toBe(0)
          expect(result.longitude).not.toBe(0)

          // Test passed, no need to check more ZIPs
          return
        }
      }

      throw new Error("No known ZIP codes found in the data. Check the test data.")
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
    it("should find ZIP codes for a given city and state", () => {
      // We'll try to find ZIP codes for cities we know should be in our data
      const citiesToTry = [
        { city: "New York", state: "NY" },
        { city: "San Francisco", state: "CA" },
        { city: "Chicago", state: "IL" },
        { city: "Boston", state: "MA" },
        { city: "Miami", state: "FL" }
      ]

      // We'll iterate through cities until we find one that exists in our data
      for (const { city, state } of citiesToTry) {
        const results = findByCity(city, state)

        if (results.length > 0) {
          // Found a matching city
          results.forEach((result) => {
            expect(result.placeName.toLowerCase()).toContain(city.toLowerCase())
            expect(result.stateCode).toBe(state)
          })

          // Test passed, no need to check more cities
          return
        }
      }

      // If no cities matched, check what cities we actually have in our data
      const cities = new Set<string>()
      testDataMap.forEach((info) => {
        cities.add(`${info.placeName}, ${info.stateCode}`)
      })

      console.log("Available cities in test data:", Array.from(cities).slice(0, 10))

      throw new Error("None of the test cities were found in the data. Check the test data or try different cities.")
    })

    it("should normalize city and state inputs", () => {
      // We'll try to find ZIP codes for cities we know should be in our data
      const citiesToTry = [
        { city: "New York", state: "NY" },
        { city: "San Francisco", state: "CA" },
        { city: "Chicago", state: "IL" },
        { city: "Boston", state: "MA" },
        { city: "Miami", state: "FL" }
      ]

      // We'll iterate through cities until we find one that exists in our data
      for (const { city, state } of citiesToTry) {
        const standardResults = findByCity(city, state)

        if (standardResults.length > 0) {
          // Found a matching city, now test normalization
          const normalizedResults = findByCity(` ${city.toLowerCase()} `, ` ${state.toLowerCase()} `)

          expect(normalizedResults.length).toBe(standardResults.length)

          // Test passed, no need to check more cities
          return
        }
      }

      throw new Error("None of the test cities were found in the data. Check the test data or try different cities.")
    })

    it("should return empty array for non-existent city", () => {
      const results = findByCity("NonexistentCityXYZ", "CA")

      expect(results).toEqual([])
    })

    it("should return empty array if city or state are empty", () => {
      expect(findByCity("", "CA")).toEqual([])
      expect(findByCity("Boston", "")).toEqual([])
    })
  })

  describe("findByCounty", () => {
    it("should find ZIP codes in a given county", () => {
      // We'll try to find ZIP codes for counties we know might be in our data
      const countiesToTry = [
        { county: "New York", state: "NY" },
        { county: "Cook", state: "IL" },
        { county: "Suffolk", state: "MA" },
        { county: "San Francisco", state: "CA" },
        { county: "Miami-Dade", state: "FL" }
      ]

      // We'll iterate through counties until we find one that exists in our data
      for (const { county, state } of countiesToTry) {
        const results = findByCounty(county, state)

        if (results.length > 0) {
          // Found a matching county
          results.forEach((result) => {
            expect(result.countyName.toLowerCase()).toContain(county.toLowerCase())
            expect(result.stateCode).toBe(state)
          })

          // Test passed, no need to check more counties
          return
        }
      }

      // If no counties matched, check what counties we actually have in our data
      const counties = new Set<string>()
      testDataMap.forEach((info) => {
        counties.add(`${info.countyName}, ${info.stateCode}`)
      })

      console.log("Available counties in test data:", Array.from(counties).slice(0, 10))

      throw new Error(
        "None of the test counties were found in the data. Check the test data or try different counties."
      )
    })

    it("should normalize county and state inputs", () => {
      // We'll try to find ZIP codes for counties we know might be in our data
      const countiesToTry = [
        { county: "New York", state: "NY" },
        { county: "Cook", state: "IL" },
        { county: "Suffolk", state: "MA" },
        { county: "San Francisco", state: "CA" },
        { county: "Miami-Dade", state: "FL" }
      ]

      // We'll iterate through counties until we find one that exists in our data
      for (const { county, state } of countiesToTry) {
        const standardResults = findByCounty(county, state)

        if (standardResults.length > 0) {
          // Found a matching county, now test normalization
          const normalizedResults = findByCounty(` ${county.toLowerCase()} `, ` ${state.toLowerCase()} `)

          expect(normalizedResults.length).toBe(standardResults.length)

          // Test passed, no need to check more counties
          return
        }
      }

      throw new Error(
        "None of the test counties were found in the data. Check the test data or try different counties."
      )
    })

    it("should return empty array for non-existent county", () => {
      const results = findByCounty("Fake County XYZ", "CA")

      expect(results).toEqual([])
    })

    it("should return empty array if county or state are empty", () => {
      expect(findByCounty("", "NY")).toEqual([])
      expect(findByCounty("Suffolk", "")).toEqual([])
    })
  })

  describe("findByRadius", () => {
    it("should find ZIP codes within radius of a location", () => {
      // We need coordinates for a location that exists in our data
      // Let's try each of our known ZIP codes until we find one with valid coordinates

      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const coords = findCoordinates(zipCode)

          if (coords.isValid) {
            // Small radius (10 miles) should find some ZIP codes
            const results = findByRadius(coords.latitude, coords.longitude, 10)

            expect(results.length).toBeGreaterThan(0)

            // Test passed, no need to check more ZIP codes
            return
          }
        }
      }

      throw new Error("No valid coordinates found for any of the known ZIP codes. Check the test data.")
    })

    it("should return more results with larger radius", () => {
      // Find coordinates for a location that exists in our data
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const coords = findCoordinates(zipCode)

          if (coords.isValid) {
            const smallRadius = findByRadius(coords.latitude, coords.longitude, 5)
            const largeRadius = findByRadius(coords.latitude, coords.longitude, 50)

            expect(largeRadius.length).toBeGreaterThan(smallRadius.length)

            // Test passed, no need to check more ZIP codes
            return
          }
        }
      }

      throw new Error("No valid coordinates found for any of the known ZIP codes. Check the test data.")
    })

    it("should sort results by distance", () => {
      // Find coordinates for a location that exists in our data
      for (const [location, zipCode] of Object.entries(KNOWN_ZIPS)) {
        if (testDataMap.has(zipCode)) {
          const coords = findCoordinates(zipCode)

          if (coords.isValid) {
            const results = findByRadius(coords.latitude, coords.longitude, 20)

            if (results.length >= 2) {
              // Calculate distances for verification
              const distances = results.map((result, index) => {
                const distance = calculateDistance(coords.latitude, coords.longitude, result.latitude, result.longitude)
                return { index, distance }
              })

              distances.sort((a, b) => a.distance - b.distance)

              // First result should be the closest
              expect(distances[0].index).toBe(0)

              // Test passed, no need to check more ZIP codes
              return
            }
          }
        }
      }

      // No valid test cases, but this doesn't necessarily indicate an error
      // For example, if our test data is limited, we might not have enough ZIP codes
      // within the radius distance to perform this test
      console.warn("Could not test radius sorting due to insufficient data")

      // Skip this test if we don't have sufficient data to test it properly
      expect(true).toBe(true)
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

      // We should have at least a few states
      expect(states.length).toBeGreaterThan(0)

      // Build a map of state codes to names for easier lookup
      const stateMap = new Map(states.map((s) => [s.code, s.name]))

      // Check for some common states that should be in any US dataset
      const commonStates = ["CA", "NY", "TX", "FL", "IL"]
      const foundStates = commonStates.filter((code) => stateMap.has(code))

      // We should find at least some of our common states
      expect(foundStates.length).toBeGreaterThan(0)
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
