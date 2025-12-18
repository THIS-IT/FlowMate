import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSingInState } from "./useSingInState";

describe("useSingInState", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useSingInState());

    expect(result.current.state.email).toBe("");
    expect(result.current.state.password).toBe("");
    expect(result.current.state.showPassword).toBe(false);
    expect(result.current.state.errors).toEqual({});
    expect(result.current.state.isSignInDisabled).toBe(true);
  });

  it("validates email in realtime", () => {
    const { result } = renderHook(() => useSingInState());

    act(() => result.current.actions.handleEmailChange("   "));
    expect(result.current.state.errors.email).toBe("Email is required.");

    act(() => result.current.actions.handleEmailChange("not-an-email"));
    expect(result.current.state.errors.email).toBe("Please enter a valid email.");

    act(() => result.current.actions.handleEmailChange("user@example.com"));
    expect(result.current.state.errors.email).toBeUndefined();
  });

  it("validates password length", () => {
    const { result } = renderHook(() => useSingInState());

    act(() => result.current.actions.handlePasswordChange("123"));
    expect(result.current.state.errors.password).toBe("Password must be at least 6 characters.");

    act(() => result.current.actions.handlePasswordChange("123456"));
    expect(result.current.state.errors.password).toBeUndefined();
  });

  it("toggles password visibility", () => {
    const { result } = renderHook(() => useSingInState());

    expect(result.current.state.showPassword).toBe(false);
    act(() => result.current.actions.toggleShowPassword());
    expect(result.current.state.showPassword).toBe(true);
    act(() => result.current.actions.toggleShowPassword());
    expect(result.current.state.showPassword).toBe(false);
  });

  it("enables sign in only when both fields are filled", () => {
    const { result } = renderHook(() => useSingInState());

    expect(result.current.state.isSignInDisabled).toBe(true);

    act(() => result.current.actions.handleEmailChange("user@example.com"));
    act(() => result.current.actions.handlePasswordChange("123456"));

    expect(result.current.state.isSignInDisabled).toBe(false);
  });

  it("stays disabled when validation errors exist", () => {
    const { result } = renderHook(() => useSingInState());

    act(() => result.current.actions.handleEmailChange("bad-email"));
    act(() => result.current.actions.handlePasswordChange("123456"));

    expect(result.current.state.errors.email).toBeDefined();
    expect(result.current.state.isSignInDisabled).toBe(true);
  });
});
