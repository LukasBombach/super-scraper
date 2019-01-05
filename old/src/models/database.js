const fs = require("fs").promises;
const existsSync = require("fs").existsSync;
const path = require("path");
const DatFile = require("./datfile");

const datFolder = path.resolve(__dirname, "..", "..", "datFiles");
const scrapedDataFolder = path.resolve(__dirname, "..", "..", "scrapedData");

class Database {
  static async buildForDatFile(datFile) {
    const games = await DatFile.get(Database.srcPath(datFile));
    const distPath = Database.distPath(datFile);
    const indexFile = path.resolve(distPath, "index.json");
    await Database.createDistFolders(distPath);
    await fs.writeFile(indexFile, JSON.stringify(games, null, 2));
  }

  static async createDistFolders(distPath) {
    const distExists = existsSync(distPath);
    if (!distExists) await fs.mkdir(distPath);
  }
  static srcPath(datFile) {
    return path.resolve(datFolder, datFile);
  }

  static distPath(datFile) {
    const baseName = datFile.replace(/\.dat(\.xml)?$/i, "");
    return path.resolve(scrapedDataFolder, baseName);
  }
}

module.exports = Database;
