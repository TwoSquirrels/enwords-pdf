"use strict";

const { serve } = require("@hono/node-server");
const { Hono } = require("hono");

const { generateExam, writePDF, books } = require("./index");

const app = new Hono();

app.get("/api/:bookId", async (c) => {
  const bookId = c.req.param("bookId");
  const examArgs = [
    parseInt(c.req.query("l")),
    parseInt(c.req.query("r")),
    parseInt(c.req.query("n")),
    parseInt(c.req.query("s"), 16),
  ].filter((arg) => arg != null && !Number.isNaN(arg));

  const book = books[bookId];
  if (!book) throw new Error(`${bookId} は存在しません。`);

  const words = await book.fetch();
  const exam = await generateExam(words, bookId, book.name, ...examArgs);
  const doc = await writePDF(exam);

  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", 'attachment; filename="exam.pdf"');
  c.header("Cache-Control", "no-cache, no-store, must-revalidate");

  return c.body(doc);
});

serve({ fetch: app.fetch, port: 80 });

console.table(
  Object.entries(books).reduce(
    (table, [bookId, book]) => ({ ...table, [book.name]: `http://localhost/api/${bookId}` }),
    {}
  )
);
