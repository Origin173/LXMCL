/**
 * Sync missing keys from English to other locales
 * This script will copy missing keys from en.json to other locale files
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(__dirname, "../../src/locales");
const EN_FILE = path.join(LOCALES_DIR, "en.json");

// Helper function to get nested value
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

// Helper function to set nested value
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Helper function to collect all keys from an object
function collectKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Main function
async function syncMissingKeys() {
  console.log("Loading English locale...");
  const enContent = JSON.parse(fs.readFileSync(EN_FILE, "utf-8"));
  const allEnKeys = collectKeys(enContent);

  console.log(`Total keys in English: ${allEnKeys.length}`);

  // Process other locale files
  const localeFiles = ["fr.json", "ja.json", "zh-Hant.json"];

  for (const localeFile of localeFiles) {
    const filePath = path.join(LOCALES_DIR, localeFile);
    console.log(`\nProcessing ${localeFile}...`);

    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const existingKeys = collectKeys(content);

    // Find missing keys
    const missingKeys = allEnKeys.filter((key) => !existingKeys.includes(key));

    console.log(`  Missing keys: ${missingKeys.length}`);

    if (missingKeys.length > 0) {
      // Add missing keys with English values
      for (const key of missingKeys) {
        const enValue = getNestedValue(enContent, key);
        setNestedValue(content, key, enValue);
      }

      // Write back to file
      fs.writeFileSync(
        filePath,
        JSON.stringify(content, null, 2) + "\n",
        "utf-8"
      );
      console.log(`  ✅ Added ${missingKeys.length} keys to ${localeFile}`);
    } else {
      console.log(`  ✅ No missing keys in ${localeFile}`);
    }
  }

  console.log("\n✅ Sync completed!");
}

syncMissingKeys().catch(console.error);
