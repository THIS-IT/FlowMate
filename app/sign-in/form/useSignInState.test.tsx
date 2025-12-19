import type React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSignInState } from "./useSignInState";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const createFormEvent = (form?: HTMLFormElement) =>
  ({
    preventDefault: vi.fn(),
    currentTarget: form ?? document.createElement("form"),
  } as unknown as React.FormEvent<HTMLFormElement>);

describe("useSignInState", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useSignInState());

    expect(result.current.state.email).toBe("");
    expect(result.current.state.password).toBe("");
    expect(result.current.state.showPassword).toBe(false);
    expect(result.current.state.errors).toEqual({});
    expect(result.current.state.isSignInDisabled).toBe(true);
  });

  it("validates email in realtime", () => {
    const { result } = renderHook(() => useSignInState());

    act(() => result.current.actions.handleEmailChange("   "));
    expect(result.current.state.errors.email).toBe("Email is required.");

    act(() => result.current.actions.handleEmailChange("not-an-email"));
    expect(result.current.state.errors.email).toBe("Please enter a valid email.");

    act(() => result.current.actions.handleEmailChange("user@example.com"));
    expect(result.current.state.errors.email).toBeUndefined();
  });

  it("validates password length", () => {
    const { result } = renderHook(() => useSignInState());

    act(() => result.current.actions.handlePasswordChange("123"));
    expect(result.current.state.errors.password).toBe("Password must be at least 6 characters.");

    act(() => result.current.actions.handlePasswordChange("123456"));
    expect(result.current.state.errors.password).toBeUndefined();
  });

  it("toggles password visibility", () => {
    const { result } = renderHook(() => useSignInState());

    expect(result.current.state.showPassword).toBe(false);
    act(() => result.current.actions.toggleShowPassword());
    expect(result.current.state.showPassword).toBe(true);
    act(() => result.current.actions.toggleShowPassword());
    expect(result.current.state.showPassword).toBe(false);
  });

  it("enables sign in only when both fields are filled", () => {
    const { result } = renderHook(() => useSignInState());

    expect(result.current.state.isSignInDisabled).toBe(true);

    act(() => result.current.actions.handleEmailChange("user@example.com"));
    act(() => result.current.actions.handlePasswordChange("123456"));

    expect(result.current.state.isSignInDisabled).toBe(false);
  });

  it("stays disabled when validation errors exist", () => {
    const { result } = renderHook(() => useSignInState());

    act(() => result.current.actions.handleEmailChange("bad-email"));
    act(() => result.current.actions.handlePasswordChange("123456"));

    expect(result.current.state.errors.email).toBeDefined();
    expect(result.current.state.isSignInDisabled).toBe(true);
  });

  it("validates on submit and calls onValid when data is correct", () => {
    const form = document.createElement("form");
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.value = "user@example.com";
    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "12345";
    form.append(emailInput, passwordInput);

    const { result } = renderHook(() => useSignInState());

    act(() => {
      result.current.actions.handleSubmit(createFormEvent(form));
    });
    expect(result.current.state.errors.password).toBe(
      "Password must be at least 6 characters.",
    );

    const onValid = vi.fn();
    passwordInput.value = "123456";
    act(() => {
      result.current.actions.handleSubmit(createFormEvent(form), onValid);
    });

    expect(result.current.state.errors.password).toBeUndefined();
    expect(onValid).toHaveBeenCalledWith({ email: "user@example.com", password: "123456" });
  });
});
