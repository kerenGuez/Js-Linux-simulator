const express = require("express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const app = express();

require("./startups/routes")(app);

const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Linux API",
      version: "1.0.0",
      description: "A terminal-like API",
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ],
  },
  apis: ["./routes/*.js"]
}

const specs = swaggerJSDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);
// for (r of app._router.stack) {
//   const res = String(r.regexp).replace(
//     new RegExp("/i$|[^a-z]|api|v1", "gm"),
//     ""
//   );
//   console.log(res);
// }

module.exports = server;
