"use strict";

const path = require("path");
const fs = require("fs");
const MersenneTwister = new require("mersenne-twister");
const PDFDocument = require("pdfkit-table");

const { Book, books } = require("./book");

const clamp = (v, low, high) => Math.min(Math.max(v, low), high);
const minmax = (x, y) => [Math.min(x, y), Math.max(x, y)];

async function fetchFont() {
  const ttf = __dirname + "/.cache/BIZUDPGothic-Regular.ttf";

  try {
    await fs.promises.access(ttf);
  } catch (e) {
    const URL = "https://github.com/googlefonts/morisawa-biz-ud-gothic/raw/refs/heads/main/fonts/ttf/BIZUDPGothic-Regular.ttf";
    console.log(`モリサワの BIZ UD ゴシックを ${URL} からダウンロード中...`);
    const font = await (await fetch(URL)).arrayBuffer();

    await fs.promises.mkdir(path.dirname(ttf), { recursive: true });
    await fs.promises.writeFile(ttf, Buffer.from(font));
  }

  return ttf;
}

exports.generateExam = async function generateExam(
  words,
  name = "英単語テスト",
  range0 = Infinity,
  range1 = 1,
  num = 50,
  seed = null
) {
  const [l, r] = minmax(clamp(range0, 1, words.length), clamp(range1, 1, words.length));
  const n = clamp(num, 1, r - l + 1);
  const s = seed || Math.floor(Math.random() * 2 ** 16);

  const mt19937 = new MersenneTwister(s);

  const w = words
    .map((word) => ({ ...word, r: mt19937.random() }))
    .filter((word) => word.id >= l && word.id <= r)
    .sort((a, b) => a.r - b.r)
    .slice(0, n);
  return {
    title: `${name} ${l}\u{FF5E}${r} (SEED:${s.toString(16).toUpperCase().padStart(4, "0")})`,
    en2jp: w.map(({ id, en, jp }) => [id, en, "\u{3000}".repeat(jp.length)]),
    jp2en: w.map(({ id, en, jp }) => [id, `(${en[0]})`, jp]),
    answer: w.map(({ id, en, jp }) => [id, en, jp]),
  };
};

exports.writePDF = async function writePDF(stream, exam) {
  const doc = new PDFDocument({ margin: 16, size: "A4" });
  doc.pipe(stream);
  doc.font(await fetchFont());

  const n = exam.answer.length;

  let isLeft = true;
  for (const name of ["en2jp", "jp2en", "answer"]) {
    if (!isLeft) doc.addPage();

    doc
      .fontSize(16)
      .text(`\n${exam.title}【${{ en2jp: `和訳編`, jp2en: `英訳編`, answer: `解答編` }[name]}】`, { align: "center" });

    doc.fontSize(12).text(`${name === "answer" ? n * 2 : ""}/${n * 2}\n\n`, { align: "right" });

    const wordAlign = name === "jp2en" ? "left" : "center";
    const headerCommon = { valign: "center", headerColor: "white" };
    const headers = [
      { label: "番号", width: 30, align: "right", ...headerCommon },
      { label: "単語", width: 100, align: wordAlign, ...headerCommon },
      { label: "意味", width: 150, align: "left", ...headerCommon },
      { label: "番号", width: 30, align: "right", ...headerCommon },
      { label: "単語", width: 100, align: wordAlign, ...headerCommon },
      { label: "意味", width: 150, align: "left", ...headerCommon },
    ];
    const rows = exam[name]
      .reduce(
        (rows, row) =>
          rows.length === 0 || rows.at(-1).length >= 6
            ? [...rows, row]
            : [...rows.slice(0, rows.length - 1), [...rows.at(-1), ...row]],
        []
      )
      .map((row) => [...row, ...new Array(6 - row.length)]);
    await doc.table(
      { headers, rows },
      {
        divider: {
          header: { disabled: false, width: 1, opacity: 1.0 },
          horizontal: { disabled: false, width: 0.5, opacity: 1.0 },
          vertical: { disabled: false, width: 0.25, opacity: 1.0 },
        },
        padding: 4,
        minRowHeight: clamp(560 / Math.ceil(exam[name].length / 2), 20, 40),
        prepareHeader: () => doc.fontSize(10),
        prepareRow: (_row, i, _j, _rectRow, { x, y, width, height }) => {
          (i === 0 ? [0, width] : [width]).forEach((dx) =>
            doc
              .lineWidth(0.5)
              .moveTo(x + dx, y)
              .lineTo(x + dx, y + height)
              .stroke()
          );
          doc.fontSize(i % 3 === 1 ? 9 : 7);
        },
      }
    );

    isLeft = false;
  }

  doc.end();
};

exports.Book = Book;

exports.books = books;
