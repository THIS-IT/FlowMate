import { describe, it, expect } from "vitest";

describe("types/validator", () => {
  it("loads the validator module without runtime errors", async () => {
    const mod = await import("./validator");
    expect(mod).toBeDefined();
  });
});
