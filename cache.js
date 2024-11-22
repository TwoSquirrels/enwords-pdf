"use strict";

const fs = require("fs");

exports.cacheDir = async function cacheDir() {
  let cacheDir = "/var/cache/enwords-pdf";
  try {
    await fs.promises.access("/var/cache");
    await fs.promises.mkdir(cacheDir, { recursive: true });
  } catch (e) {
    cacheDir = __dirname + "/.cache";
    await fs.promises.mkdir(cacheDir, { recursive: true });
  }
  return cacheDir;
};
