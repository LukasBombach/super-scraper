const config = require("./config");
const Database = require("./models/database");


const datFile = "FB Alpha (ClrMame Pro XML, Neogeo only).dat.xml";

(async () => {
  await downloadPlatforms(config.platforms);
  await map(datFile);
})();
