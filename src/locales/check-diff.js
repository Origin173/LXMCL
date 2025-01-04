#!/usr/bin/env node
/**
 * This script compares locale JSON files, checking for missing or extra keys
 * compared to a reference locale file.
 *
 * Usage:
 *   npm run check-locales-diff zh-Hant
 *
 * Parameters:
 *   locale_key (optional) : str
 *   The locale key represents the base language, defaulted to 'zh-Hans',
 *   which determines the reference locale file against which all other locale files will be compared.
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

function flattenDict(obj, parentKey = "") {
  const items = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        items.push(...flattenDict(value, newKey));
      } else {
        items.push(newKey);
      }
    }
  }
  return items;
}

function loadLocaleFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function compareKeys(baseKeys, targetKeys) {
  const baseSet = new Set(baseKeys);
  const targetSet = new Set(targetKeys);
  const missing = [...baseSet].filter((k) => !targetSet.has(k)).sort();
  const extra = [...targetSet].filter((k) => !baseSet.has(k)).sort();
  return [missing, extra];
}

function main(localeKey) {
  const localesPath = path.resolve(__dirname);
  const baseLocalePath = path.join(localesPath, `${localeKey}.json`);

  if (!fs.existsSync(baseLocalePath)) {
    console.log(`Locale file '${localeKey}.json' not found in: ${localesPath}`);
    return;
  }

  const baseLocale = loadLocaleFile(baseLocalePath);
  const baseKeys = flattenDict(baseLocale).sort();

  fs.readdirSync(localesPath).forEach((fileName) => {
    if (fileName.endsWith(".json") && fileName !== `${localeKey}.json`) {
      const targetLocalePath = path.join(localesPath, fileName);
      const targetLocale = loadLocaleFile(targetLocalePath);
      const targetKeys = flattenDict(targetLocale).sort();

      const [missing, extra] = compareKeys(baseKeys, targetKeys);

      if (missing.length === 0 && extra.length === 0) {
        console.log(
          chalk.green(`'${fileName}' is identical to '${localeKey}.json'.`)
        );
      } else {
        console.log(`Comparing ${fileName}:`);
        console.log(`${missing.length} missing, ${extra.length} extra keys`);

        missing.forEach((key) => {
          console.log(chalk.red(`  Missing:   ${key}`));
        });
        extra.forEach((key) => {
          console.log(chalk.green(`  Extra:     ${key}`));
        });
      }
      console.log("-".repeat(40));
    }
  });
}

main(process.argv[2] || "zh-Hans");
