#!/usr/bin/env node
/**
 * This script compares locale JSON files, checking for missing or extra keys
 * compared to a reference locale file.
 *
 * Usage:
 *   npm run check-locales-diff --zh-Hant
 *
 *Parameters:
 *  locale_key (optional) : str
 *   The locale key represents the base language, defaulted to ‘en’,
 *  which determines the reference locale file against which all other locale files will be compared.
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

/** 读取并解析指定 JSON 文件 */
function loadLocaleFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/** 比较基准文件与目标文件，返回缺失和多余的 key */
function compareKeys(baseKeys, targetKeys) {
  const baseSet = new Set(baseKeys);
  const targetSet = new Set(targetKeys);
  const missing = [...baseSet].filter((k) => !targetSet.has(k)).sort();
  const extra = [...targetSet].filter((k) => !baseSet.has(k)).sort();
  return [missing, extra];
}

/** 主逻辑：从基准语言名读取 JSON，然后与同目录其他文件比较 */
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
        console.log(`Comparing ${fileName}：`);
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

// ============== 直接写死取第三个参数 ==============
let rawArg = process.argv[2];

// 如果没传，就用 'zh-Hans'
if (!rawArg) {
  rawArg = "zh-Hans";
}

// 如果传了 '--zh-Hant' 之类，去掉开头的 '--'
if (rawArg.startsWith("--")) {
  rawArg = rawArg.slice(2);
}

// 这就是最终的基准语言
const baseLocale = rawArg;
console.log(`Using base locale: ${baseLocale}`);

main(baseLocale);
