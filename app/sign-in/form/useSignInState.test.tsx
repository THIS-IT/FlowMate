import type React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSignInState } from "./useSignInState";
import {
  validateSignInField,
  validateSignInForm,
  signInSchemaValidate,
} from "../schema/useSignInSchema";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
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

  it("trims leading whitespace when validating email", () => {
    const { result } = renderHook(() => useSignInState());

    act(() => result.current.actions.handleEmailChange("   user@example.com"));
    expect(result.current.state.errors.email).toBeUndefined();
    expect(result.current.state.email).toBe("user@example.com");
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

  it("submits with redirect and optional delay", async () => {
    vi.useFakeTimers();
    pushMock.mockClear();

    const form = document.createElement("form");
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.value = "user@example.com";
    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "123456";
    form.append(emailInput, passwordInput);

    const { result } = renderHook(() => useSignInState());

    await act(async () => {
      const promise = result.current.actions.handleSubmitWithRedirect(createFormEvent(form), {
        delayMs: 50,
      });
      await vi.advanceTimersByTimeAsync(50);
      await promise;
    });

    expect(pushMock).toHaveBeenCalledWith("/create-account");
    expect(result.current.state.isSubmitting).toBe(false);

    vi.useRealTimers();
  });

  it("uses custom redirect when provided", async () => {
    pushMock.mockClear();

    const form = document.createElement("form");
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.value = "user@example.com";
    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "123456";
    form.append(emailInput, passwordInput);

    const { result } = renderHook(() => useSignInState());

    await act(async () => {
      await result.current.actions.handleSubmitWithRedirect(createFormEvent(form), {
        redirectTo: "/dashboard",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("returns invalid result without redirect when validation fails", async () => {
    pushMock.mockClear();

    const form = document.createElement("form");
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.value = "bad-email";
    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "123";
    form.append(emailInput, passwordInput);

    const { result } = renderHook(() => useSignInState());

    let submitResult:
      | Awaited<ReturnType<typeof result.current.actions.handleSubmitWithRedirect>>
      | undefined;
    await act(async () => {
      submitResult = await result.current.actions.handleSubmitWithRedirect(createFormEvent(form));
    });

    expect(submitResult?.valid).toBe(false);
    expect(result.current.state.errors.email).toBeDefined();
    expect(pushMock).toHaveBeenCalledTimes(0);
  });

  it("reads and trims email from form data when state is empty", () => {
    pushMock.mockClear();

    const form = document.createElement("form");
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.value = "   user@example.com  ";
    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "123456";
    form.append(emailInput, passwordInput);

    const onValid = vi.fn();
    const { result } = renderHook(() => useSignInState());

    act(() => {
      result.current.actions.handleSubmit(createFormEvent(form), onValid);
    });

    expect(onValid).toHaveBeenCalledWith({ email: "user@example.com", password: "123456" });
    expect(result.current.state.email).toBe("user@example.com");
    expect(result.current.state.password).toBe("123456");
  });

  it("falls back to state values when form fields are missing", () => {
    const form = document.createElement("form"); // no inputs -> triggers ?? email/password path
    const { result } = renderHook(() => useSignInState());

    act(() => {
      result.current.actions.handleEmailChange("   state@example.com  ");
      result.current.actions.handlePasswordChange("state-pass");
    });

    const onValid = vi.fn();
    act(() => {
      result.current.actions.handleSubmit(createFormEvent(form), onValid);
    });

    expect(onValid).toHaveBeenCalledWith({
      email: "state@example.com", // trimmed from state value via ?? path
      password: "state-pass",
    });
    expect(result.current.state.errors.email).toBeUndefined();
    expect(result.current.state.errors.password).toBeUndefined();
  });

  it("short-circuits when already submitting", async () => {
    pushMock.mockClear();

    const form = document.createElement("form");
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.value = "user@example.com";
    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "123456";
    form.append(emailInput, passwordInput);

    const { result } = renderHook(() => useSignInState());

    vi.useFakeTimers();
    let firstPromise: Promise<unknown> | undefined;
    await act(async () => {
      firstPromise = result.current.actions.handleSubmitWithRedirect(createFormEvent(form), {
        delayMs: 50,
      });
      await Promise.resolve();
    });

    expect(result.current.state.isSubmitting).toBe(true);

    type SubmitResult = Awaited<ReturnType<typeof result.current.actions.handleSubmitWithRedirect>>;
    let secondResult: SubmitResult | undefined;
    await act(async () => {
      secondResult = await result.current.actions.handleSubmitWithRedirect(createFormEvent(form));
    });
    expect(secondResult?.valid).toBe(false);
    expect(pushMock).toHaveBeenCalledTimes(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
      await firstPromise;
    });
    vi.useRealTimers();
  });
});

describe("sign-in schema helpers", () => {
  it("returns field level errors", () => {
    expect(validateSignInField("email", "")).toBe("Email is required.");
    expect(validateSignInField("email", "not-an-email")).toBe("Please enter a valid email.");
    expect(validateSignInField("password", "123")).toBe("Password must be at least 6 characters.");
    expect(validateSignInField("password", "123456")).toBeUndefined();
  });

  it("validates a full payload and trims email", () => {
    const result = validateSignInForm({
      email: "   user@example.com ",
      password: "123456",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("matches the schema definition", () => {
    const parsed = signInSchemaValidate.safeParse({
      email: "person@example.com",
      password: "abcdef",
    });
    expect(parsed.success).toBe(true);
  });
});
