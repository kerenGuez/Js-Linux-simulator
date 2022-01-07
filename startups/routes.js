const express = require("express");

const echo = require("../routes/echo");
const cat = require("../routes/cat");
const touch = require("../routes/touch");
const mkdir = require("../routes/mkdir");
const rm = require("../routes/rm");
const rmdir = require("../routes/rmdir");
const cp = require("../routes/cp");
const cd = require("../routes/cd");
const mv = require("../routes/mv");
const pwd = require("../routes/pwd");
const ls = require("../routes/ls");
const head = require("../routes/head");
const tail = require("../routes/tail");
const which = require("../routes/which");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/v1/echo", echo);
  app.use("/api/v1/touch", touch);
  app.use("/api/v1/mkdir", mkdir);
  app.use("/api/v1/cat", cat);
  app.use("/api/v1/rm", rm);
  app.use("/api/v1/rmdir", rmdir);
  app.use("/api/v1/cp", cp);
  app.use("/api/v1/cd", cd);
  app.use("/api/v1/mv", mv);
  app.use("/api/v1/pwd", pwd);
  app.use("/api/v1/ls", ls);
  app.use("/api/v1/head", head);
  app.use("/api/v1/tail", tail);
  app.use("/api/v1/which", which);
};
