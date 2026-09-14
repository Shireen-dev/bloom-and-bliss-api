const request = require("supertest");
const app = require("../src/app");

const testUser = {
  name: "Test User",
  email: `test.user.${Date.now()}@example.com`,
  password: "secret123",
};

describe("Auth API", () => {
  test("POST /api/auth/register creates a new account", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("POST /api/auth/register rejects a duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(409);
  });

  test("POST /api/auth/register rejects a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: `short.${Date.now()}@example.com`, password: "123" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/login succeeds with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/login fails with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrong-password",
    });
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/auth/me requires a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
