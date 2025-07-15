// tests/integration/auth.test.ts
import request from "supertest";
import app from "../../src/app"; // your express app

describe("Auth Routes", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "test@example.com",
      password: "Test1234",
      role: "user",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
