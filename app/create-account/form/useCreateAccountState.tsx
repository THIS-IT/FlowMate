"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  type CreateAccountPayload,
  type CreateAccountErrors,
  validateCreateAccountField,
  validateCreateAccountForm,
} from "../schema/useCreateAccountSchema";

export type Role = CreateAccountPayload["role"];

export type FormErrors = CreateAccountErrors & { confirmPassword?: string };

export function useCreateAccountState() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("PM");
  const [visibility, setVisibility] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState("");

  const isOtherRole = role === "OTHER";
  const passwordsMatch = useMemo(
    () => password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword],
  );

  const setFieldError = (key: keyof FormErrors, message?: string) => {
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

  const handleRoleChange = (value: Role) => {
    setRole(value);
    if (value !== "OTHER") {
      setVisibility([]);
      setFieldError("visibility", undefined);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFieldError("email", validateCreateAccountField("email", value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFieldError("password", validateCreateAccountField("password", value));
    // also re-evaluate confirm matching
    if (confirmPassword.length > 0) {
      if (value !== confirmPassword) {
        setFieldError("confirmPassword", "Passwords do not match.");
      } else if (confirmPassword.length < 6) {
        setFieldError("confirmPassword", "Please confirm with at least 6 characters.");
      } else {
        setFieldError("confirmPassword", undefined);
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value.length < 6) {
      setFieldError("confirmPassword", "Please confirm with at least 6 characters.");
    } else if (value !== password) {
      setFieldError("confirmPassword", "Passwords do not match.");
    } else {
      setFieldError("confirmPassword", undefined);
    }
  };

  const toggleVisibility = (value: string) => {
    if (!isOtherRole) return;
    setVisibility((prev) => {
      const next = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      if (next.length > 0) {
        setFieldError("visibility", undefined);
      }
      return next;
    });
  };

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>,
    onValid?: (payload: CreateAccountPayload) => void,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nameValue = (name || (formData.get("name") as string | null) || "").trim();
    const emailValue = (email || (formData.get("email") as string | null) || "").trim();
    const payloadCandidate: CreateAccountPayload = {
      name: nameValue,
      email: emailValue,
      role,
      visibility,
      password,
    };

    const validation = validateCreateAccountForm(payloadCandidate);
    const nextErrors: FormErrors = validation.success ? {} : { ...validation.errors };

    if (confirmPassword.length < 6) {
      nextErrors.confirmPassword = "Please confirm with at least 6 characters.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (validation.success && !nextErrors.confirmPassword) {
      setSubmitMessage("All set! Ready to create the account.");
      onValid?.(validation.data);
      return { valid: true, payload: validation.data };
    }

    setSubmitMessage("");
    return { valid: false as const, payload: undefined };
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  return {
    state: {
      name,
      email,
      role,
      visibility,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      errors,
      submitMessage,
      isOtherRole,
      passwordsMatch,
    },
    actions: {
      setName,
      handleRoleChange,
      toggleVisibility,
      handleSubmit,
      toggleShowPassword,
      toggleShowConfirmPassword,
      handleEmailChange,
      handlePasswordChange,
      handleConfirmPasswordChange,
    },
  };
}
