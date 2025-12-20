import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  signInSchemaValidate,
  validateSignInField,
  validateSignInForm,
  extractSignInErrors,
  type SignInPayload,
} from "./useSignInSchema";

describe("useSignInSchema", () => {
  it("parses a valid payload and trims email", () => {
    const parsed = signInSchemaValidate.safeParse({
      email: "  user@example.com ",
      password: "password123",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("user@example.com");
    }
  });

  it("collects errors for invalid payload", () => {
    const result = signInSchemaValidate.safeParse({
      email: "",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = extractSignInErrors(result.error);
      expect(errors.email).toBe("Email is required.");
      expect(errors.password).toBe("Password must be at least 6 characters.");
    }
  });

  it("ignores non-string issue paths when extracting errors", () => {
    const error = new ZodError<SignInPayload>([
      { code: "custom", path: [0], message: "index issue" },
      { code: "custom", path: ["email"], message: "Email is required." },
    ]);

    const errors = extractSignInErrors(error);
    expect(errors.email).toBe("Email is required.");
    expect(errors).not.toHaveProperty("0");
  });

  it("returns field-level errors from helper", () => {
    expect(validateSignInField("email", "")).toBe("Email is required.");
    expect(validateSignInField("email", "bad")).toBe("Please enter a valid email.");
    expect(validateSignInField("password", "123")).toBe(
      "Password must be at least 6 characters.",
    );
    expect(validateSignInField("password", "password123")).toBeUndefined();
  });

  it("validates form helper end-to-end", () => {
    const payload: SignInPayload = {
      email: "user@example.com",
      password: "password123",
    };

    const valid = validateSignInForm(payload);
    expect(valid.success).toBe(true);

    const invalid = validateSignInForm({ ...payload, password: "123" });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.errors.password).toBe("Password must be at least 6 characters.");
    }
  });
});
