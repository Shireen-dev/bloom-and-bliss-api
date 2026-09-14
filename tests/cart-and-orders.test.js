const request = require("supertest");
const app = require("../src/app");

let token;

beforeAll(async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Cart Tester",
    email: `cart.tester.${Date.now()}@example.com`,
    password: "secret123",
  });
  token = res.body.token;
});

describe("Cart API", () => {
  test("GET /api/cart starts empty for a new user", async () => {
    const res = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  test("POST /api/cart adds an item", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: 1, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  test("PUT /api/cart/:productId updates quantity", async () => {
    const res = await request(app)
      .put("/api/cart/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  test("DELETE /api/cart/:productId removes an item", async () => {
    const res = await request(app).delete("/api/cart/1").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toEqual([]);
  });
});

describe("Orders API", () => {
  const shipping = { name: "Cart Tester", address: "1 Main St", city: "Springfield", zip: "12345", phone: "555-0100" };

  test("POST /api/orders fails on an empty cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ shipping });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/orders succeeds after adding an item, and clears the cart", async () => {
    await request(app).post("/api/cart").set("Authorization", `Bearer ${token}`).send({ productId: 2, quantity: 3 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ shipping });
    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.order.items).toHaveLength(1);
    expect(orderRes.body.order.total).toBeGreaterThan(0);

    const cartRes = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
    expect(cartRes.body.items).toEqual([]);
  });

  test("GET /api/orders returns the user's order history", async () => {
    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });
});
