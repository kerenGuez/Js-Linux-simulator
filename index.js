var fs = require("fs");
const express = require("express");
const app = express();

require("./startups/routes")(app);

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

function getRoutes() {
  return app._router.stack.map(r => {
    return String(r.regexp)
    .replace(new RegExp("/i$|[^a-z]|api|v1", "gm"), "")
  }).filter(r => !!r);
}


const data = getRoutes().join('\n');

fs.writeFile("temp.txt", data, (err) => {
  if (err) console.log(err);
});

module.exports.server = server;
module.exports.baseUrl = `http://localhost:${port}/api/v1`;
module.exports.apiRoutes = getRoutes();
