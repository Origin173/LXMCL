const fs = require("fs");
const path = require("path");

const LOCALE_DIR = path.join(__dirname, "..", "..", "src", "locales");
const MAIN_LOCALE = "zh-Hans.json";
const TARGET_LOCALES = ["fr.json", "ja.json", "zh-Hant.json"];

function flatten(obj, prefix = "") {
  let result = {};
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function unflatten(flatObj) {
  const result = {};
  for (const flatKey in flatObj) {
    const keys = flatKey.split(".");
    let cur = result;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        cur[k] = flatObj[flatKey];
      } else {
        if (!cur[k]) cur[k] = {};
        cur = cur[k];
      }
    });
  }
  return result;
}

function syncWithZhHans(mainFlat, targetFlat) {
  const resultFlat = {};
  for (const key of Object.keys(mainFlat)) {
    resultFlat[key] =
      key in targetFlat ? targetFlat[key] : `%TODO ${mainFlat[key]}`;
  }
  return unflatten(resultFlat);
}

const mainPath = path.join(LOCALE_DIR, MAIN_LOCALE);
const mainData = JSON.parse(fs.readFileSync(mainPath, "utf8"));
const mainFlat = flatten(mainData);

for (const locale of TARGET_LOCALES) {
  const filePath = path.join(LOCALE_DIR, locale);
  if (!fs.existsSync(filePath)) continue;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const targetFlat = flatten(data);
  const synced = syncWithZhHans(mainFlat, targetFlat);
  fs.writeFileSync(filePath, JSON.stringify(synced, null, 2), "utf8");
  console.log(`Synced ${locale} with zh-Hans.json`);
}

console.log("All target locale files synced with zh-Hans.json.");
