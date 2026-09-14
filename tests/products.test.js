const request = require("supertest");
const app = require("../src/app");

describe("Products API", () => {
  test("GET /api/products returns the full catalog", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test("GET /api/products?category=Romantic filters results", async () => {
    const res = await request(app).get("/api/products?category=Romantic");
    expect(res.statusCode).toBe(200);
    res.body.products.forEach((p) => {
      expect(p.category.toLowerCase()).toBe("romantic");
    });
  });

  test("GET /api/products/:id returns a single product", async () => {
    const res = await request(app).get("/api/products/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.product.id).toBe(1);
  });

  test("GET /api/products/:id returns 404 for a missing product", async () => {
    const res = await request(app).get("/api/products/999999");
    expect(res.statusCode).toBe(404);
  });

  test("POST /api/products is rejected without a token", async () => {
    const res = await request(app).post("/api/products").send({ name: "X", price: 10, category: "Bright" });
    expect(res.statusCode).toBe(401);
  });
});
