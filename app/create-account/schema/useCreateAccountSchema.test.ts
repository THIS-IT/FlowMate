import { describe, expect, it } from "vitest";
import {
  useCreateAccountValidate,
  validateCreateAccountField,
  validateCreateAccountForm,
  extractCreateAccountErrors,
  type CreateAccountPayload,
} from "./useCreateAccountSchema";

describe("useCreateAccountSchema", () => {
  it("parses a valid payload and trims email", () => {
    const parsed = useCreateAccountValidate.safeParse({
      name: "Jane",
      email: "  jane@example.com ",
      role: "PM",
      password: "password123",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("jane@example.com");
      expect(parsed.data.visibility).toEqual([]);
    }
  });

  it("requires visibility when role is OTHER", () => {
    const result = useCreateAccountValidate.safeParse({
      name: "Jane",
      email: "jane@example.com",
      role: "OTHER",
      visibility: [],
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = extractCreateAccountErrors(result.error);
      expect(errors.visibility).toBe("Select at least one role to grant visibility.");
    }
  });

  it("surface field errors from helpers", () => {
    expect(validateCreateAccountField("name", "")).toBe("Name is required.");
    expect(validateCreateAccountField("email", "bad")).toBe("Please enter a valid email.");
    expect(validateCreateAccountField("password", "123")).toBe(
      "Password must be at least 6 characters.",
    );
  });

  it("validates form helper end-to-end", () => {
    const payload: CreateAccountPayload = {
      name: "Jane",
      email: "jane@example.com",
      role: "OTHER",
      visibility: [],
      password: "password123",
    };

    const invalid = validateCreateAccountForm(payload);
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.errors.visibility).toBe("Select at least one role to grant visibility.");
    }

    const valid = validateCreateAccountForm({ ...payload, visibility: ["PM"] });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.visibility).toEqual(["PM"]);
    }
  });
});
