const dat = require("../scrapedData/FB Alpha (ClrMame Pro XML, Neogeo only)/index.json");
const db = require("/Users/lbombach/Projekte/emc/backend/services/thegamesdb/scrapedData/Neo Geo/index.json");

const datNames = [...new Set([].concat.apply([], dat.map(normalize)))];
const dbNames = [...new Set([].concat.apply([], db.map(normalize)))];
const missing = datNames.filter(el => !dbNames.includes(el));

missing.forEach(title => console.log(title));

console.log("\nAll", dat.length, "Missing", missing.length);

function normalize(item) {
  const labels = /\s+([\[\(].*?[\]\)])$/gm;
  const sublines = / - .*?$/gm;
  const separators = /\s*\/\s*/;
  return item.title
    .replace(labels, "")
    .replace(sublines, "")
    .split(separators)
    .map(title => title.trim());
}
