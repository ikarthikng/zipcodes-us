// scripts/download-data.js
// This script downloads the GeoNames US ZIP code data file

import * as fs from "fs"
import * as path from "path"
import * as https from "https"
import { createWriteStream } from "fs"
import { pipeline } from "stream/promises"
import { exec } from "child_process"
import { fileURLToPath } from "url"

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// URL for the US ZIP code data from GeoNames
const ZIP_DATA_URL = "https://download.geonames.org/export/zip/US.zip"

// Create data directory if it doesn't exist (outside the src folder)
const projectRoot = path.resolve(__dirname, "../../") // Go up from src/scripts to project root
const dataDir = path.join(projectRoot, "data")
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

  return new Promise((resolve, reject) => {
    // Try to use the unzip command if available
    exec(`unzip -p ${zipPath} US.txt > ${txtPath}`, (error) => {
      if (error) {
        console.log("unzip command failed, trying a different method...")
        // If unzip command fails, try a different approach
        try {
          // Dynamic import for ESM
          import("unzipper")
            .then((unzipper) => {
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
            })
            .catch((e) => {
              console.error("Could not extract the ZIP file automatically.")
              console.log("Please extract US.txt from the downloaded ZIP file manually:")
              console.log(`1. Open ${zipPath}`)
              console.log(`2. Extract US.txt to ${txtPath}`)
              console.log("3. Then run the process-data script")
              resolve()
            })
        } catch (e) {
          console.error("Could not extract the ZIP file automatically.")
          console.log("Please extract US.txt from the downloaded ZIP file manually:")
          console.log(`1. Open ${zipPath}`)
          console.log(`2. Extract US.txt to ${txtPath}`)
          console.log("3. Then run the process-data script")
          resolve()
        }
      } else {
        resolve()
      }
    })
  })
}

// Delete the ZIP file
function deleteZipFile(zipPath) {
  console.log(`Deleting ZIP file: ${zipPath}`)
  return fs.promises.unlink(zipPath)
}

// Main function
async function main() {
  try {
    // Remove existing files if they exist
    if (fs.existsSync(txtPath)) {
      console.log(`Removing existing US.txt file: ${txtPath}`)
      await fs.promises.unlink(txtPath)
    }

    if (fs.existsSync(zipPath)) {
      console.log(`Removing existing ZIP file: ${zipPath}`)
      await fs.promises.unlink(zipPath)
    }

    // Download the ZIP file
    await downloadFile(ZIP_DATA_URL, zipPath)
    console.log(`Downloaded to ${zipPath}`)

    // Extract the ZIP file
    await extractZipFile(zipPath, txtPath)

    // Check if extraction was successful
    if (fs.existsSync(txtPath)) {
      console.log(`US.txt has been extracted to ${txtPath}`)

      // Delete the ZIP file after successful extraction
      try {
        await deleteZipFile(zipPath)
        console.log("ZIP file deleted successfully")
      } catch (deleteError) {
        console.warn(`Warning: Could not delete ZIP file: ${deleteError.message}`)
      }

      // Now you can run the process-data script
      console.log("Now run the process-data script to generate the processed data file:")
      console.log("npm run prebuild")
    } else {
      console.log("Extraction might have failed. Please extract US.txt manually as described above.")
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the script
main()
