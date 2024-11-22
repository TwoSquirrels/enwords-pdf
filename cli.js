"use strict";

const fs = require("fs");

const { generateExam, writePDF, books } = require("./index");

async function exportPDF(bookId = "complete", pdf = "", ...examArgs) {
  const book = books[bookId];
  if (!book) throw new Error(`${bookId} は存在しません。`);

  const words = await book.fetch();
  const exam = await generateExam(words, bookId, book.name, ...examArgs);
  console.log(`\n${exam.title} (${exam.answer.length * 2} 点満点)`);
  console.table(exam.answer);

  console.log("\nPDF 出力中...");
  await writePDF(exam, fs.createWriteStream(pdf || exam.defaultFileName));
  console.log("PDF 出力完了！");
}

const [bookId, pdf, range0Str, range1Str, numStr, seedStr] = process.argv.slice(2);

exportPDF(
  ...[bookId, pdf, parseInt(range0Str), parseInt(range1Str), parseInt(numStr), parseInt(seedStr, 16)].filter(
    (arg) => arg != null && !Number.isNaN(arg),
  ),
).catch(console.error);
