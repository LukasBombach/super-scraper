const { promisify } = require("util");
const fs = require("fs");
const xml2js = require("xml2js");

const parseString = promisify(xml2js.parseString);
const readFile = promisify(fs.readFile);

class DatFile {
  static async get(path) {
    const xml = await readFile(path);
    const json = await parseString(xml);
    return DatFile.formatDatJson(json);
  }

  static formatDatJson(json) {
    return json.datafile.game.map(game => DatFile.formatGame(game));
  }

  static formatGame(game) {
    const name = game.$.name;
    const title = game.description[0];
    const year = parseInt(game.year[0], 10);
    const manufacturer = game.manufacturer[0];
    const roms = game.rom.map(rom => DatFile.formatRom(rom));
    return { name, title, year, manufacturer, roms };
  }

  static formatRom(rom) {
    const name = rom.$.name;
    const size = parseInt(rom.$.size, 10);
    const crc = rom.$.crc
      ? rom.$.crc.toLowerCase().padStart(8, "0")
      : undefined;
    return { name, crc, size };
  }
}

module.exports = DatFile;
