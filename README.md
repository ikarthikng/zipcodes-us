# zipcodes-us

A lightweight and efficient US ZIP code lookup library with no external dependencies.

[![npm version](https://badge.fury.io/js/zipcodes-us.svg)](https://badge.fury.io/js/zipcodes-us.svg)
[![Tests](https://github.com/ikarthikng/zipcodes-us/actions/workflows/test-and-publish.yml/badge.svg)](https://github.com/ikarthikng/zipcodes-us/actions?query=workflow%3A"Test+and+Publish")
[![npm downloads](https://img.shields.io/npm/dm/zipcodes-us)](https://www.npmjs.com/package/zipcodes-us)
[![license](https://img.shields.io/npm/l/zipcodes-us)](https://github.com/ikarthikng/zipcodes-us/blob/master/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/zipcodes-us)](https://bundlephobia.com/package/zipcodes-us)

> I try my best to monitor the required dependencies daily and publish updates to the npm package whenever changes are detected.

## 🔄 **Data Last Checked/Updated:** _13th October 2025_

## Features

- Fast in-memory ZIP code lookups
- Multiple lookup methods for different use cases
- Find ZIP codes by city, state, and county
- Find ZIP codes within a radius of coordinates
- Returns complete information including state, city, county, and coordinates
- **Universal compatibility** - works in both Node.js and browser/React environments
- TypeScript support with full type definitions
- Zero runtime dependencies

## Why Choose zipcodes-us?

- **🚀 Zero Dependencies** - No bloat, just pure functionality
- **⚡ Lightning Fast** - In-memory lookups with instant results
- **🌐 Universal** - Same code works in Node.js, React, Next.js, and browsers
- **📦 Tiny Bundle** - Minimal impact on your bundle size
- **🔄 Always Up-to-Date** - Data checked and updated daily
- **💪 Type-Safe** - Full TypeScript support out of the box
- **🎯 Battle-Tested** - Reliable and production-ready

**Compared to alternatives:**

- Unlike `zipcode-to-timezone`, we provide complete geographic data
- Unlike `zipcodes`, we support both Node.js and browsers seamlessly
- Unlike manual API calls, no rate limits or network latency

## 🚀 Try It Now

**Live Demo:** [CodeSandbox Demo](https://codesandbox.io/p/sandbox/little-haze-cc7h58)

**Quick Example:**

```javascript
import zipcodes from "zipcodes-us"

// One line to get complete ZIP code info
const info = zipcodes.find("90210")
// → { city: 'Beverly Hills', state: 'California', ... }
```

## Installation

```bash
npm install zipcodes-us
```

## Usage

This library works seamlessly in both Node.js and browser/React environments with no configuration needed.

### Basic Usage

```typescript
import zipcodes from "zipcodes-us"

// Complete lookup with validity check
const info = zipcodes.find("90210")
console.log(info)
/* Output:
{
  state: 'California',
  stateCode: 'CA',
  city: 'Beverly Hills',
  county: 'Los Angeles',
  latitude: 34.0901,
  longitude: -118.4065,
  isValid: true
}
*/

// For invalid ZIP codes, returns empty values with isValid: false
const invalid = zipcodes.find("00000")
console.log(invalid)
/* Output:
{
  state: '',
  stateCode: '',
  city: '',
  county: '',
  latitude: 0,
  longitude: 0,
  isValid: false
}
*/

// Get just the state information
const stateInfo = zipcodes.findState("10001")
console.log(stateInfo) // { state: 'New York', stateCode: 'NY', isValid: true }

// Get just the city
const cityInfo = zipcodes.findCity("60601")
console.log(cityInfo) // { city: 'Chicago', isValid: true }

// Get just the county
const countyInfo = zipcodes.findCounty("94105")
console.log(countyInfo) // { county: 'San Francisco', isValid: true }

// Get just the coordinates
const coords = zipcodes.findCoordinates("02108")
console.log(coords) // { latitude: 42.3588, longitude: -71.0707, isValid: true }

// Find ZIP codes for a city
const bostonZips = zipcodes.findByCity("Boston", "MA")
console.log(`Boston has ${bostonZips.length} ZIP codes`)

// Find ZIP codes in a county
const kingCountyZips = zipcodes.findByCounty("King", "WA")
console.log(`King County has ${kingCountyZips.length} ZIP codes`)

// Find ZIP codes within 10 miles of coordinates
const nearby = zipcodes.findByRadius(37.7749, -122.4194, 10)
console.log(`Found ${nearby.length} ZIP codes within 10 miles of San Francisco`)

// Get all states
const states = zipcodes.getStates()
console.log(`The US has ${states.length} states and territories with ZIP codes`)
```

### Node.js Example

```typescript
import zipcodes from "zipcodes-us"
import fs from "fs"

// Find all ZIP codes for a specific city
const bostonZips = zipcodes.findByCity("Boston", "MA")

// Save the data to a file
fs.writeFileSync("boston-zips.json", JSON.stringify(bostonZips, null, 2))

console.log(`Saved ${bostonZips.length} Boston ZIP codes to file`)
```

### React/Browser Example

```jsx
import React, { useState } from "react"
import zipcodes from "zipcodes-us"

function ZipCodeLookup() {
  const [zipCode, setZipCode] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleLookup = () => {
    setError("")
    const info = zipcodes.find(zipCode)

    if (info.isValid) {
      setResult(info)
    } else {
      setError("Invalid ZIP code")
      setResult(null)
    }
  }

  return (
    <div>
      <h2>ZIP Code Lookup</h2>
      <div>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter ZIP code"
          maxLength={5}
        />
        <button onClick={handleLookup}>Lookup</button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {result && (
        <div>
          <h3>Results for {zipCode}</h3>
          <p>
            <strong>City:</strong> {result.city}
          </p>
          <p>
            <strong>State:</strong> {result.state} ({result.stateCode})
          </p>
          <p>
            <strong>County:</strong> {result.county}
          </p>
          <p>
            <strong>Coordinates:</strong> {result.latitude}, {result.longitude}
          </p>
        </div>
      )}
    </div>
  )
}

export default ZipCodeLookup
```

## 💡 Common Use Cases

### Validate ZIP Codes

```typescript
// Check if a ZIP code is valid
const info = zipcodes.find("90210")
if (info.isValid) {
  console.log(`Valid ZIP in ${info.city}, ${info.state}`)
}
```

### Auto-Complete City/State from ZIP

```typescript
// User enters ZIP, auto-fill city and state
const { city, state } = zipcodes.find(userZipCode)
addressForm.city.value = city
addressForm.state.value = state
```

### Find All ZIP Codes in a City

```typescript
// Get all ZIP codes for a specific city
const allBostonZips = zipcodes.findByCity("Boston", "MA")
console.log(`Boston has ${allBostonZips.length} ZIP codes`)
```

### Geographic Proximity Search

```typescript
// Find ZIP codes within 50 miles of coordinates
const nearbyZips = zipcodes.findByRadius(37.7749, -122.4194, 50)
// Use these for location-based features
```

### Display Location Information

```typescript
// Show detailed location info from just a ZIP code
const info = zipcodes.find("10001")
displayMap(info.latitude, info.longitude)
showDetails(`${info.city}, ${info.county} County, ${info.state}`)
```

## API

`find(zipCode: string): ZipLookupResult`

Returns complete information for a ZIP code with an `isValid` flag. Always returns an object, even for invalid ZIP codes.

```typescript
interface ZipLookupResult {
  state: string // Full state name
  stateCode: string // Two-letter state code
  city: string // City/place name
  county: string // County name
  latitude: number // Decimal latitude
  longitude: number // Decimal longitude
  isValid: boolean // Whether the ZIP code exists
}

// Internal ZipCodeInfo interface used by findByCity, findByCounty, and findByRadius methods
interface ZipCodeInfo {
  zipCode: string // 5-digit ZIP code
  placeName: string // City or place name
  stateName: string // Full state name
  stateCode: string // Two-letter state code
  countyName: string // County name
  countyCode: string // FIPS county code
  communityName?: string // Optional community name
  communityCode?: string // Optional community code
  latitude: number // Latitude in decimal degrees
  longitude: number // Longitude in decimal degrees
}
```

`findState(zipCode: string): StateResult`

Returns state information for a ZIP code with validity check.

```typescript
interface StateResult {
  state: string // Full state name
  stateCode: string // Two-letter state code
  isValid: boolean // Whether the ZIP code exists
}
```

`findCity(zipCode: string): { city: string; isValid: boolean }`

Returns city name for a ZIP code with validity check.

`findCounty(zipCode: string): { county: string; isValid: boolean }`

Returns county name for a ZIP code with validity check.

`findCoordinates(zipCode: string): Coordinates`

Returns latitude and longitude for a ZIP code with validity check.

```typescript
interface Coordinates {
  latitude: number // Decimal latitude
  longitude: number // Decimal longitude
  isValid: boolean // Whether the ZIP code exists
}
```

`findByCity(city: string, stateCode: string): ZipCodeInfo[]`

Finds all ZIP codes for a given city and state. Returns an array of ZipCodeInfo objects.

`findByCounty(countyName: string, stateCode: string): ZipCodeInfo[]`

Finds all ZIP codes in a given county. Returns an array of ZipCodeInfo objects.

`findByRadius(latitude: number, longitude: number, radiusMiles: number): ZipCodeInfo[]`

Finds ZIP codes within a radius of coordinates, sorted by distance. Returns an array of ZipCodeInfo objects.

`getStates(): Array<{ code: string, name: string }>`

Returns all states with their codes and names.

## How Browser Compatibility Works

The library automatically determines the environment it's running in:

- **In browsers/React**: Uses pre-processed bundled data for optimal performance
- **In Node.js**: Can fall back to reading the data file directly if needed

This dual-loading strategy ensures the package works efficiently in any JavaScript environment without any additional configuration.

## Related Projects

Looking for Indian postal codes? Check out **[postalcodes-india](https://github.com/ikarthikng/postalcodes-india)** - the same functionality for India! 🇮🇳

## Data Source

This package uses GeoNames ZIP code data (under Creative Commons Attribution 4.0 License).

## License

MIT
