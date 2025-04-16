const fs = require("fs");
const https = require("https");
const path = require("path");

const url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

// Resolve output path relative to the script location
const outputPath = path.resolve(
  __dirname,
  "../../src-tauri/assets/game/version.txt"
);

https
  .get(url, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        const versionIds = json.versions.map((v) => v.id).reverse(); // Oldest to newest
        const text = versionIds.join("\n");

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        fs.writeFileSync(outputPath, text);
        console.log(`Version list saved to: ${outputPath}`);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  })
  .on("error", (err) => {
    console.error("Error fetching data:", err);
  });
