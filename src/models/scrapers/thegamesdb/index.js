const fs = require("fs").promises;
const path = require("path");

const scrapedDataFolder = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "scrapedData"
);

class TheGamesDb {
  static async scrapeDatJson(fileName) {
    const games = await TheGamesDb.getGames(fileName);
    await TheGamesDb.createFolder(fileName);
  }

  static async getGames(fileName) {
    const filePath = path.resolve(scrapedDataFolder, filename, "index.json");
    const fileContents = await fs.readFile(filePath);
    return JSON.parse(fileContents);
  }

  static async createFolder(fileName) {
    const filePath = path.resolve(scrapedDataFolder, filename, "thegamesdb");
    await fs.mkdir(filePath);
  }
}

module.exports = TheGamesDb;
