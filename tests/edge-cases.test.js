const request = require("supertest");
const app = require("../src/app");

const testUser = {
  name: "Edge Case User",
  email: `edge.case.${Date.now()}@example.com`,
  password: "secret123",
};

let authToken;

describe("Auth API — Edge Cases", () => {
  test("POST /api/auth/register rejects missing email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "No Email", password: "secret123" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/register rejects missing password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "No Password", email: `nopass.${Date.now()}@example.com` });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/login succeeds with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test("POST /api/auth/login rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongPassword999" });
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/auth/login rejects unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "doesnotexist@example.com", password: "whatever123" });
    expect(res.statusCode).toBe(401);
  });
});

describe("Products API — Edge Cases", () => {
  test("GET /api/products returns an array of products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
});

 test("GET /api/products/:id returns 404 for a non-existent product", async () => {
    const res = await request(app).get("/api/products/999999");
    expect(res.statusCode).toBe(404);
});
});

describe("Cart API — Authorization Edge Cases", () => {
  test("GET /api/cart without a token is rejected", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/cart with an invalid token is rejected", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/cart with a valid token succeeds", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("Orders API — Authorization Edge Cases", () => {
  test("GET /api/orders without a token is rejected", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/orders without a token is rejected", async () => {
    const res = await request(app).post("/api/orders").send({});
    expect(res.statusCode).toBe(401);
  });
});