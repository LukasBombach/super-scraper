const Database = require("./models/database");

const datFile = "FB Alpha (ClrMame Pro XML, Neogeo only).dat.xml";

(async () => {
  await Database.buildForDatFile(datFile);
})();
