const { readDB, writeDB } = require("../db");
const { requireFields } = require("../utils/validate");

function getUserCart(db, userId) {
  if (!db.carts[userId]) db.carts[userId] = [];
  return db.carts[userId];
}

function withProductDetails(db, cartItems) {
  return cartItems.map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: product || null,
      subtotal: product ? Number((product.price * item.quantity).toFixed(2)) : 0,
    };
  });
}

// GET /api/cart
function getCart(req, res) {
  const db = readDB();
  const items = withProductDetails(db, getUserCart(db, req.user.id));
  const total = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
  res.json({ items, total });
}

// POST /api/cart  { productId, quantity }
function addItem(req, res) {
  const missing = requireFields(req.body, ["productId"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity) > 0 ? Number(req.body.quantity) : 1;

  const db = readDB();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const cart = getUserCart(db, req.user.id);
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  writeDB(db);
  res.status(201).json({ items: withProductDetails(db, cart) });
}

// PUT /api/cart/:productId  { quantity }
function updateItem(req, res) {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return res.status(400).json({ error: "quantity must be a number >= 0" });
  }

  const db = readDB();
  const cart = getUserCart(db, req.user.id);
  const index = cart.findIndex((i) => i.productId === productId);
  if (index === -1) return res.status(404).json({ error: "Item not in cart" });

  if (quantity === 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }

  writeDB(db);
  res.json({ items: withProductDetails(db, cart) });
}

// DELETE /api/cart/:productId
function removeItem(req, res) {
  const productId = Number(req.params.productId);
  const db = readDB();
  const cart = getUserCart(db, req.user.id);
  const index = cart.findIndex((i) => i.productId === productId);
  if (index === -1) return res.status(404).json({ error: "Item not in cart" });

  cart.splice(index, 1);
  writeDB(db);
  res.json({ items: withProductDetails(db, cart) });
}

// DELETE /api/cart
function clearCart(req, res) {
  const db = readDB();
  db.carts[req.user.id] = [];
  writeDB(db);
  res.json({ items: [] });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
