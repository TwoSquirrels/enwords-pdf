"use strict";

const fs = require("fs");

const { generateExam, writePDF, books } = require("./index");

async function exportPDF(bookId = "complete", pdf = "./exam.pdf", ...examArgs) {
  const book = books[bookId];
  if (!book) throw new Error(`"${book}" は存在しません。`);

  const words = await book.fetch();
  const exam = await generateExam(words, book.name, ...examArgs);
  console.log(`\n${exam.title} (${exam.answer.length * 2} 点満点)`);
  console.table(exam.answer);

  console.log("\nPDF 出力中...");
  await writePDF(fs.createWriteStream(pdf), exam);
  console.log("PDF 出力完了！");
}

const [bookId, pdf, range0Str, range1Str, numStr, seedStr] = process.argv.slice(2);

exportPDF(
  ...[bookId, pdf, parseInt(range0Str), parseInt(range1Str), parseInt(numStr), parseInt(seedStr)].filter(
    (arg) => arg != null && !Number.isNaN(arg)
  )
).catch(console.error);
