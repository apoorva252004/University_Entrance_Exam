import { NextRequest } from "next/server";
import { middleware } from "./middleware";

describe("Middleware", () => {
  it("should pass through all requests", async () => {
    const request = new NextRequest(new URL("http://localhost:3000/admin/dashboard"));
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });

  it("should allow access to login", async () => {
    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });

  it("should allow access to signup", async () => {
    const request = new NextRequest(new URL("http://localhost:3000/signup"));
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });
});
