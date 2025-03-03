"use strict";

const { Hono } = require("hono");
const { serve } = require("@hono/node-server");
const { serveStatic } = require("@hono/node-server/serve-static");

const { generateExam, writePDF, books } = require("./index");

const app = new Hono();

app.onError((err, c) => {
  console.error(err);
  return c.status(500).text("Internal Server Error");
});

app.use("*", serveStatic({ root: "./static" }));

app.get("/api/books", async (c) => {
  return c.json(
    Object.entries(books).map(([bookId, book]) => ({
      id: bookId,
      name: book.name,
      amazon: book.asin && `https://www.amazon.co.jp/dp/${book.asin}`,
    })),
  );
});

app.get("/api/pdf/:bookId", async (c) => {
  const bookId = c.req.param("bookId")?.toLowerCase();
  const range0 = parseInt(c.req.query("l")) || Infinity;
  const range1 = parseInt(c.req.query("r")) || 1;
  const num = parseInt(c.req.query("n")) || 50;
  const seed = parseInt(c.req.query("s"), 16) || null;

  if (!books.hasOwnProperty(bookId)) return c.status(404).json({ error: `${bookId} は存在しません。` });
  const book = books[bookId];

  const words = await book.fetch();
  const exam = await generateExam(words, bookId, book.name, range0, range1, num, seed);
  const doc = await writePDF(exam);
  console.log(`Generated ${exam.defaultFileName}`);

  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename="${exam.defaultFileName}"`);
  c.header("Cache-Control", "no-cache, no-store, must-revalidate");

  return c.body(doc);
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
  console.table(
    Object.entries(books).reduce(
      (table, [bookId, book]) => ({ ...table, [book.name]: `http://localhost:${info.port}/api/pdf/${bookId}` }),
      {},
    ),
  );
});
