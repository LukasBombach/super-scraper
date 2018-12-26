const path = require("path");
const DatFile = require("./models/datfile");

const datPath = path.resolve(
  __dirname,
  "datFiles",
  "FB Alpha (ClrMame Pro XML, Neogeo only).dat.xml"
);

(async () => {
  const data = await DatFile.get(datPath);
  console.log(data);
})();
