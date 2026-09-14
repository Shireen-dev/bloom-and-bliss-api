const { readDB, writeDB } = require("../db");
const { requireFields } = require("../utils/validate");

// POST /api/orders  { shipping: { name, address, city, zip, phone } }
// Builds an order from the user's current cart, then clears the cart.
function createOrder(req, res) {
  const missing = requireFields(req.body.shipping || {}, ["name", "address", "city", "zip", "phone"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required shipping field(s): ${missing.join(", ")}` });
  }

  const db = readDB();
  const cart = db.carts[req.user.id] || [];
  if (cart.length === 0) {
    return res.status(400).json({ error: "Cannot place an order with an empty cart" });
  }

  const items = cart.map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      name: product ? product.name : "Unknown product",
      price: product ? product.price : 0,
      quantity: item.quantity,
      subtotal: product ? Number((product.price * item.quantity).toFixed(2)) : 0,
    };
  });
  const total = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

  const order = {
    id: db.nextOrderId,
    userId: req.user.id,
    items,
    total,
    shipping: req.body.shipping,
    status: "placed",
    createdAt: new Date().toISOString(),
  };

  db.orders.push(order);
  db.nextOrderId += 1;
  db.carts[req.user.id] = [];
  writeDB(db);

  res.status(201).json({ order });
}

// GET /api/orders  - current user's order history
function getMyOrders(req, res) {
  const db = readDB();
  const orders = db.orders.filter((o) => o.userId === req.user.id);
  res.json({ count: orders.length, orders });
}

// GET /api/orders/:id  - a single order (only its owner can view it)
function getOrder(req, res) {
  const db = readDB();
  const order = db.orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: "You do not have access to this order" });
  }
  res.json({ order });
}

module.exports = { createOrder, getMyOrders, getOrder };
