// scripts/download-data.js
// This script downloads the GeoNames US ZIP code data file

const fs = require("fs")
const path = require("path")
const https = require("https")
const { once } = require("events")
const { createWriteStream } = require("fs")
const { pipeline } = require("stream/promises")

// URL for the US ZIP code data from GeoNames
const ZIP_DATA_URL = "https://download.geonames.org/export/zip/US.zip"

// Create data directory if it doesn't exist
const dataDir = path.resolve(__dirname, "../data")
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory: ${dataDir}`)
  fs.mkdirSync(dataDir, { recursive: true })
}

// Path for the downloaded ZIP file
const zipPath = path.join(dataDir, "US.zip")
const txtPath = path.join(dataDir, "US.txt")

// Download the ZIP file
async function downloadFile(url, dest) {
  console.log(`Downloading from ${url} to ${dest}...`)

  const file = createWriteStream(dest)

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`))
          return
        }

        pipeline(response, file)
          .then(() => resolve())
          .catch(reject)
      })
      .on("error", reject)
  })
}

// Extract the ZIP file
async function extractZipFile(zipPath, txtPath) {
  console.log(`Extracting ${zipPath}...`)

  // For simplicity, we're using an external unzip command
  // You might want to use a proper unzip library like 'unzipper' in real code
  const { exec } = require("child_process")

  return new Promise((resolve, reject) => {
    // Try to use the unzip command if available
    exec(`unzip -p ${zipPath} US.txt > ${txtPath}`, (error) => {
      if (error) {
        console.log("unzip command failed, trying a different method...")
        // If unzip command fails, try a different approach
        try {
          // Try to use the require('unzipper') module if available
          const unzipper = require("unzipper")
          fs.createReadStream(zipPath)
            .pipe(unzipper.Parse())
            .on("entry", (entry) => {
              if (entry.path === "US.txt") {
                entry.pipe(fs.createWriteStream(txtPath))
                resolve()
              } else {
                entry.autodrain()
              }
            })
            .on("error", reject)
            .on("close", resolve)
        } catch (e) {
          console.error("Could not extract the ZIP file automatically.")
          console.log("Please extract US.txt from the downloaded ZIP file manually:")
          console.log(`1. Open ${zipPath}`)
          console.log(`2. Extract US.txt to ${txtPath}`)
          console.log("3. Then run the process-data.ts script")
          resolve()
        }
      } else {
        resolve()
      }
    })
  })
}

// Main function
async function main() {
  try {
    // Check if the txt file already exists
    if (fs.existsSync(txtPath)) {
      console.log(`US.txt already exists at ${txtPath}`)
      return
    }

    // Download the ZIP file
    await downloadFile(ZIP_DATA_URL, zipPath)
    console.log(`Downloaded to ${zipPath}`)

    // Extract the ZIP file
    await extractZipFile(zipPath, txtPath)

    // Check if extraction was successful
    if (fs.existsSync(txtPath)) {
      console.log(`US.txt has been extracted to ${txtPath}`)

      // Now you can run the process-data.ts script
      console.log("Now run the process-data.ts script to generate the processed data file:")
      console.log("npm run prebuild")
    } else {
      console.log("Extraction might have failed. Please extract US.txt manually as described above.")
    }
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

// Run the script
main()
