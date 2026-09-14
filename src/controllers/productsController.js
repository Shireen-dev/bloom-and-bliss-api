const { readDB, writeDB } = require("../db");
const { requireFields } = require("../utils/validate");

// GET /api/products?category=Romantic
function getAll(req, res) {
  const db = readDB();
  const { category } = req.query;
  let products = db.products;
  if (category && category !== "All") {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ count: products.length, products });
}

// GET /api/products/:id
function getOne(req, res) {
  const db = readDB();
  const product = db.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
}

// POST /api/products  (protected)
function create(req, res) {
  const missing = requireFields(req.body, ["name", "price", "category"]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }
  if (typeof req.body.price !== "number" || req.body.price <= 0) {
    return res.status(400).json({ error: "price must be a positive number" });
  }

  const db = readDB();
  const product = {
    id: db.nextProductId,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    tagline: req.body.tagline || "",
    description: req.body.description || "",
    flowers: req.body.flowers || [],
    stemCount: req.body.stemCount || "",
    size: req.body.size || "",
    image: req.body.image || "",
  };
  db.products.push(product);
  db.nextProductId += 1;
  writeDB(db);
  res.status(201).json({ product });
}

// PUT /api/products/:id  (protected)
function update(req, res) {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const allowedFields = ["name", "price", "category", "tagline", "description", "flowers", "stemCount", "size", "image"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      db.products[index][field] = req.body[field];
    }
  });

  writeDB(db);
  res.json({ product: db.products[index] });
}

// DELETE /api/products/:id  (protected)
function remove(req, res) {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const [deleted] = db.products.splice(index, 1);
  writeDB(db);
  res.json({ message: "Product deleted", product: deleted });
}

module.exports = { getAll, getOne, create, update, remove };
