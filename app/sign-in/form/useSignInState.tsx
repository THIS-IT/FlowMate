"use client";
import { useState, type FormEvent } from "react";

type SignInErrors = Partial<Record<"email" | "password", string>>;
type SignInPayload = { email: string; password: string };

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function useSignInState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});

  const setFieldError = (key: keyof SignInErrors, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!message) {
        delete next[key];
      } else {
        next[key] = message;
      }
      return next;
    });
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!value.trim()) {
      setFieldError("email", "Email is required.");
    } else if (!validateEmail(value)) {
      setFieldError("email", "Please enter a valid email.");
    } else {
      setFieldError("email", undefined);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length < 6) {
      setFieldError("password", "Password must be at least 6 characters.");
    } else {
      setFieldError("password", undefined);
    }
  };

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>,
    onValid?: (payload: SignInPayload) => void,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextEmail = ((formData.get("email") as string | null) ?? email ?? "").trim();
    const nextPassword = (formData.get("password") as string | null) ?? password ?? "";

    const nextErrors: SignInErrors = {};
    if (!nextEmail) {
      nextErrors.email = "Email is required.";
    } else if (!validateEmail(nextEmail)) {
      nextErrors.email = "Please enter a valid email.";
    }
    if (nextPassword.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setEmail(nextEmail);
    setPassword(nextPassword);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const payload = { email: nextEmail, password: nextPassword };
      onValid?.(payload);
      return { valid: true as const, payload };
    }

    return { valid: false as const, payload: undefined };
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const hasValidationErrors = Object.keys(errors).length > 0;
  const isSignInDisabled = !email.trim() || !password || hasValidationErrors;

  return {
    state: {
      email,
      password,
      showPassword,
      errors,
      isSignInDisabled,
    },
    actions: {
      handlePasswordChange,
      toggleShowPassword,
      handleEmailChange,
      handleSubmit,
    },
  };
}
