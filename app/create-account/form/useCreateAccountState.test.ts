import type React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCreateAccountState } from "./useCreateAccountState";
import {
  validateCreateAccountField,
  validateCreateAccountForm,
  useCreateAccountValidate,
} from "../schema/useCreateAccountSchema";

const createFormEvent = (form?: HTMLFormElement) =>
  ({
    preventDefault: vi.fn(),
    currentTarget: form ?? document.createElement("form"),
  } as unknown as React.FormEvent<HTMLFormElement>);

describe("useCreateAccountState", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useCreateAccountState());
    expect(result.current.state.role).toBe("PM");
    expect(result.current.state.email).toBe("");
    expect(result.current.state.visibility).toEqual([]);
    expect(result.current.state.errors).toEqual({});
  });

  it("validates email in realtime", () => {
    const { result } = renderHook(() => useCreateAccountState());
    act(() => result.current.actions.handleEmailChange("not-an-email"));
    expect(result.current.state.errors.email).toBe("Please enter a valid email.");

    act(() => result.current.actions.handleEmailChange("user@example.com"));
    expect(result.current.state.errors.email).toBeUndefined();
  });

  it("trims email input when validating", () => {
    const { result } = renderHook(() => useCreateAccountState());
    act(() => result.current.actions.handleEmailChange("   user@example.com  "));
    expect(result.current.state.errors.email).toBeUndefined();
  });

  it("validates password and confirm password in realtime", () => {
    const { result } = renderHook(() => useCreateAccountState());

    act(() => result.current.actions.handlePasswordChange("123"));
    expect(result.current.state.errors.password).toBe("Password must be at least 6 characters.");

    act(() => result.current.actions.handleConfirmPasswordChange("123"));
    expect(result.current.state.errors.confirmPassword).toBe(
      "Please confirm with at least 6 characters.",
    );

    act(() => result.current.actions.handlePasswordChange("123456"));
    act(() => result.current.actions.handleConfirmPasswordChange("1234567"));
    expect(result.current.state.errors.confirmPassword).toBe("Passwords do not match.");

    act(() => result.current.actions.handleConfirmPasswordChange("123456"));
    expect(result.current.state.errors.password).toBeUndefined();
    expect(result.current.state.errors.confirmPassword).toBeUndefined();
  });

  it("requires visibility when role is Other and returns payload on valid submit", () => {
    const { result } = renderHook(() => useCreateAccountState());

    act(() => {
      result.current.actions.setName("Jane Doe");
      result.current.actions.handleEmailChange("jane@example.com");
      result.current.actions.handlePasswordChange("password123");
      result.current.actions.handleConfirmPasswordChange("password123");
      result.current.actions.handleRoleChange("OTHER");
    });

    act(() => {
      result.current.actions.handleSubmit(createFormEvent());
    });
    expect(result.current.state.errors.visibility).toBe(
      "Select at least one role to grant visibility.",
    );

    const onValid = vi.fn();
    act(() => {
      result.current.actions.toggleVisibility("PM");
    });
    act(() => {
      result.current.actions.handleSubmit(createFormEvent(), onValid);
    });

    expect(result.current.state.errors.visibility).toBeUndefined();
    expect(onValid).toHaveBeenCalledTimes(1);
    expect(onValid.mock.calls[0][0]).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      role: "OTHER",
      visibility: ["PM"],
      password: "password123",
    });
  });
});

describe("create account schema helpers", () => {
  it("returns field level errors", () => {
    expect(validateCreateAccountField("name", "")).toBe("Name is required.");
    expect(validateCreateAccountField("email", "bad")).toBe("Please enter a valid email.");
    expect(validateCreateAccountField("password", "123")).toBe(
      "Password must be at least 6 characters.",
    );
  });

  it("validates payload and enforces visibility for OTHER role", () => {
    const result = validateCreateAccountForm({
      name: "Jane",
      email: "jane@example.com",
      role: "OTHER",
      visibility: [],
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.visibility).toBe("Select at least one role to grant visibility.");
    }
  });

  it("parses valid payload with defaults", () => {
    const parsed = useCreateAccountValidate.safeParse({
      name: "Jane",
      email: "jane@example.com",
      role: "PM",
      password: "password123",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.visibility).toEqual([]);
    }
  });
});
