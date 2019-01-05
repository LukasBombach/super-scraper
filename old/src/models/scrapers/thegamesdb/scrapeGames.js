const fs = require("fs").promises;
const promisify = require("util").promisify;
const xml2js = require("xml2js");
const fetch = require("node-fetch");
const _ = require("lodash");
const Queue = require("p-queue");
const chalk = require("chalk");

const parseString = promisify(xml2js.parseString);

const parseOptions = {
  trim: true,
  firstCharLowerCase: true,
  normalize: true,
  explicitArray: false,
  parseNumbers: true,
  parseBooleans: true,
  attrkey: "attrs",
  charkey: "value"
};

const keyMap = {
  GameTitle: "title",
  Overview: "description",
  Similar: "similarGames",
  "Co-op": "coop"
};

async function scrapeGames(games, gamesPath) {
  const jsons = fs.readdirSync(gamesPath);
  games = games.filter(({ name }) => !jsons.includes(`${name}.json`));
  const total = games.length;
  const start = process.hrtime();
  const errors = [];

  console.log(`Scraping ${total} games`);

  const queue = new Queue({ concurrency: 1 });
  const queueItems = games.map((game, i) => async () => {
    const start = process.hrtime();
    process.stdout.write(
      chalk.dim(`${((i / total) * 100).toFixed(2)}% (${i} / ${total}) `)
    );
    process.stdout.write(`${game.title} `);
    try {
      await scrapeGame(gamesPath, game.name);
    } catch (err) {
      errors.push(err);
      process.stdout.write(chalk.red(`${err.message} `));
    }
    const elapsedTime = process.hrtime(start);
    const elapsedTimeReadable = `${elapsedTime[0]}.${parseInt(
      elapsedTime[1] / 1000000,
      10
    )}s`;
    process.stdout.write(chalk.dim(`${elapsedTimeReadable}\n`));
  });
  await queue.addAll(queueItems);
  const elapsedTime = process.hrtime(start);
  const elapsedTimeReadable = `${elapsedTime[0]}.${parseInt(
    elapsedTime[1] / 1000000,
    10
  )}s`;
  console.log(`All done. Took ${elapsedTimeReadable}`);
  if (errors.length)
    console.log("Errors:\n", errors.map(err => ` - ${err.message}`).join("\n"));
}

async function scrapeGame(gamesPath, name) {
  const result = await fetch(
    `http://legacy.thegamesdb.net/api/GetGame.php?id=${name}`
  );
  const xml = await result.text();
  const { Data } = await parseString(xml, parseOptions);
  const { Game } = Data;
  const game = _.mapKeys(Game, (v, k) => keyMap[k] || _.camelCase(k));
  await formatGame(game);
  await fs.writeFile(
    `${gamesPath}/${game.id}.json`,
    JSON.stringify(game, null, 2)
  );
}

function formatGame(game) {
  game.id = parseInt(game.id, 10);
  game.platformId = parseInt(game.platformId, 10);
  game.players = parseInt(game.players, 10);
  game.rating = parseFloat(game.rating);
  game.releaseDate = new Date(game.releaseDate);
  game.alternateTitles = !game.alternateTitles
    ? []
    : Array.isArray(game.alternateTitles.title)
    ? game.alternateTitles.title
    : [game.alternateTitles.title];
  game.genres = game.genres ? game.genres.genre : [];
  game.coop = game.coop === "Yes";
  game.similarGames = formatSimilarGames(game.similarGames);
  game.images.fanart = formatImages(game.images.fanart);
  game.images.boxart = formatImages(game.images.boxart);
  game.images.banner = formatImages(game.images.banner);
  game.images.screenshot = formatImages(game.images.screenshot);
  game.images.clearlogo = formatImages(game.images.clearlogo);
}

function formatSimilarGames(similarGames) {
  if (!similarGames || !similarGames.Game) return [];
  const simGames = Array.isArray(similarGames.Game)
    ? similarGames.Game
    : [similarGames.Game];
  return simGames.map(({ id, PlatformId }) => ({
    id: parseInt(id, 10),
    platformId: parseInt(PlatformId, 10)
  }));
}

function formatImages(images) {
  if (!images) return [];
  if (!Array.isArray(images)) images = [images];
  return images.map(image => {
    const original = image.original ? image.original : image;
    const attrs = original.attrs || null;
    const src = `http://legacy.thegamesdb.net/banners/${original.value}`;
    const thumb = image.thumb
      ? `http://legacy.thegamesdb.net/banners/${image.thumb}`
      : null;
    const width = attrs ? parseInt(attrs.width, 10) : null;
    const height = attrs ? parseInt(attrs.height, 10) : null;
    return { src, thumb, width, height };
  });
}

module.exports = scrapeGames;
