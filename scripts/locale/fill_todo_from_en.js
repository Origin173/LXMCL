const fs = require("fs");
const path = require("path");

const localesDir = path.resolve(__dirname, "..", "..", "src", "locales");
const enPath = path.join(localesDir, "en.json");
const targetFiles = ["ja.json", "fr.json", "zh-Hant.json"];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function walk(obj, cb, pathParts = []) {
  if (typeof obj === "object" && obj !== null) {
    for (const k of Object.keys(obj)) {
      walk(obj[k], cb, pathParts.concat(k));
    }
  } else {
    cb(obj, pathParts);
  }
}

const en = readJson(enPath);

function getFromEn(pathParts) {
  let cur = en;
  for (const p of pathParts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

for (const file of targetFiles) {
  const fp = path.join(localesDir, file);
  if (!fs.existsSync(fp)) {
    console.warn("skip, not found", fp);
    continue;
  }
  const obj = readJson(fp);
  let replaced = 0;
  function replace(objNode, pathParts = []) {
    if (typeof objNode === "string") {
      if (objNode.includes("%TODO")) {
        const enVal = getFromEn(pathParts);
        if (typeof enVal === "string") {
          // replace the whole string with enVal
          // navigate to parent and set
          let parent = obj;
          for (let i = 0; i < pathParts.length - 1; i++) {
            parent = parent[pathParts[i]];
          }
          parent[pathParts[pathParts.length - 1]] = enVal;
          replaced++;
        } else {
          console.warn("en value not found for", pathParts.join("."));
        }
      }
    } else if (typeof objNode === "object" && objNode !== null) {
      for (const k of Object.keys(objNode)) {
        replace(objNode[k], pathParts.concat(k));
      }
    }
  }
  replace(obj);
  if (replaced > 0) {
    writeJson(fp, obj);
    console.log(`Updated ${file}: replaced ${replaced} entries.`);
  } else {
    console.log(`No %TODO in ${file}.`);
  }
}

console.log("Done.");
