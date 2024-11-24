"use strict";

const path = require("path");
const fs = require("fs");
const tabletojson = require("tabletojson").Tabletojson;

class Book {
  constructor(name, fetcher, asin = null) {
    this.name = name;
    this.fetch = fetcher;
    this.asin = asin;
  }
}

class UkaruEigo extends Book {
  constructor(name, id, asin = null) {
    super(
      name,
      () =>
        fs.promises
          .readFile(this.jsonPath, "UTF8")
          .then((file) => JSON.parse(file))
          .catch((_e) => this.download()),
      asin
    );

    this.ukaruEigoId = id;
  }

  get jsonPath() {
    return __dirname + `/.cache/${this.ukaruEigoId}.json`;
  }

  async download() {
    const url = `https://ukaru-eigo.com/${this.ukaruEigoId}/`;
    console.log(`${this.name}データを ${url} からダウンロード中...`);
    const words = (await tabletojson.convertUrl(url))[0].map((word) => ({
      id: parseInt(word["No"] ?? word["No."] ?? word["番号"]),
      en: (word["単語"] ?? word["英単語"] ?? "").trim(),
      jp: (word["意味"] ?? "").trim(),
    }));

    await fs.promises.mkdir(path.dirname(this.jsonPath), { recursive: true });
    await fs.promises.writeFile(this.jsonPath, JSON.stringify(words, null, 2) + "\n", "UTF8");
    return words;
  }
}

exports.Book = Book;

exports.books = {
  complete: new UkaruEigo("有名単語帳融合", "complete-word-list"),
  leap: new UkaruEigo("必携英単語 LEAP", "leap-word-list", "4410144227"),
  passtanP1: new UkaruEigo("英検準１級 でる順パス単 (５訂版)", "passtan-p1-word-list", "401094983X"),
  systan: new UkaruEigo("システム英単語 (５訂版)", "systan-word-list", "4796111379"),
  tangoOu: new UkaruEigo("単語王 2202", "tango-ou-word-list", "404604411X"),
  tanjukugoexP1: new UkaruEigo("英検準１級 単熟語 EX (第２版)", "tanjukugoex-p1-word-list", "B0C23NPYK7"),
  target1400: new UkaruEigo("英単語ターゲット 1400 (５訂版)", "target-1400-word-list", "4010346477"),
  target1400only: new UkaruEigo("英単語ターゲット not 1900 but 1400", "target-1400-only"),
  target1900: new UkaruEigo("英単語ターゲット 1900 (６訂版)", "target-1900-word-list", "4010346469"),
  target1900_5: new UkaruEigo("英単語ターゲット 1900 (５訂版)", "target-1900-5th-word-list", "4010339179"),
  teppeki: new UkaruEigo("鉄壁 (改訂版)", "teppeki-word-list", "404604411X"),
};
