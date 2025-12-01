import type React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCreateAccountForm } from "./useCreateAccountForm";

const createFormEvent = (form?: HTMLFormElement) =>
  ({
    preventDefault: vi.fn(),
    currentTarget: form ?? document.createElement("form"),
  } as unknown as React.FormEvent<HTMLFormElement>);

describe("useCreateAccountForm", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useCreateAccountForm());
    expect(result.current.state.role).toBe("PM");
    expect(result.current.state.email).toBe("");
    expect(result.current.state.visibility).toEqual([]);
    expect(result.current.state.errors).toEqual({});
  });

  it("validates email in realtime", () => {
    const { result } = renderHook(() => useCreateAccountForm());
    act(() => result.current.actions.handleEmailChange("not-an-email"));
    expect(result.current.state.errors.email).toBe("Please enter a valid email.");

    act(() => result.current.actions.handleEmailChange("user@example.com"));
    expect(result.current.state.errors.email).toBeUndefined();
  });

  it("validates password and confirm password in realtime", () => {
    const { result } = renderHook(() => useCreateAccountForm());

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
    const { result } = renderHook(() => useCreateAccountForm());

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
