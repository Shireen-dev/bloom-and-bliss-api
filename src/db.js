// Tiny file-based database. Reads/writes data/db.json synchronously.
// This keeps the project dependency-free for storage (no MySQL/Postgres/Mongo
// server required) while still giving every route a persistent, shared,
// structured data store - the "non-relational database" for this project.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readDB, writeDB };
