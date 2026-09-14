const bcrypt = require("bcryptjs");
const { readDB, writeDB } = require("../db");
const { signToken } = require("../utils/token");
const { requireFields, isValidEmail } = require("../utils/validate");

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function register(req, res) {
  const missing = requireFields(req.body, ["name", "email", "password"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }
  const { name, email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id: db.nextUserId, name, email, passwordHash };
  db.users.push(user);
  db.nextUserId += 1;
  db.carts[user.id] = [];
  writeDB(db);

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.status(201).json({ token, user: publicUser(user) });
}

function login(req, res) {
  const missing = requireFields(req.body, ["email", "password"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }
  const { email, password } = req.body;

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: publicUser(user) });
}

function me(req, res) {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
}

module.exports = { register, login, me };
