const fs = require("fs").promises;
const path = require("path");

(async () => {
  const datFolder = path.resolve(__dirname, "..", "datFiles");
  const files = await fs.readdir(datFolder);
  const datFiles = files
    .filter(f => f.match(/\.dat(\.xml)?$/i))
    .map(f => `${datFolder}/${f}`);

  console.log("\x1Bc");

  for (const datFile of datFiles) {
    console.log(datFile);
  }
})();
