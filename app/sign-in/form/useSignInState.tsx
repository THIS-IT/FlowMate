"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { SignInErrors, SignInPayload } from "../schema/useSignInSchema";
import { validateSignInField, validateSignInForm } from "../schema/useSignInSchema";

export function useSignInState() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultRedirectPath = "/create-account";

  const setFieldError = (key: keyof SignInErrors, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!message) delete next[key];
      else next[key] = message;
      return next;
    });
  };

  const handleEmailChange = (value: string) => {
    const nextValue = value.trimStart();
    setEmail(nextValue);
    setFieldError("email", validateSignInField("email", nextValue));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFieldError("password", validateSignInField("password", value));
  };

  const buildCandidateValues = (e: FormEvent<HTMLFormElement>): SignInPayload => {
    const formData = new FormData(e.currentTarget);
    return {
      email: String(formData.get("email") ?? email).trim(),
      password: String(formData.get("password") ?? password),
    };
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>, onValid?: (payload: SignInPayload) => void) => {
    e.preventDefault();

    const candidateValues = buildCandidateValues(e);
    const validation = validateSignInForm(candidateValues);

    setEmail(candidateValues.email);
    setPassword(candidateValues.password);
    setErrors(validation.errors);

    if (validation.success) {
      onValid?.(validation.data);
      return { valid: true as const, payload: validation.data };
    }

    return { valid: false as const, payload: undefined };
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmitWithRedirect = async (
    e: FormEvent<HTMLFormElement>,
    options?: { redirectTo?: string; delayMs?: number; onValid?: (payload: SignInPayload) => void },
  ) => {
    if (isSubmitting) return { valid: false as const, payload: undefined };

    const result = handleSubmit(e, options?.onValid);
    if (!result.valid) return result;

    setIsSubmitting(true);
    try {
      const delayMs = options?.delayMs ?? 0;
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));

      const redirectTo = options?.redirectTo ?? defaultRedirectPath;
      if (redirectTo) router.push(redirectTo);

      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidationErrors = Object.keys(errors).length > 0;

  const isSignInDisabled = useMemo(() => {
    return isSubmitting || !email.trim() || !password || hasValidationErrors;
  }, [isSubmitting, email, password, hasValidationErrors]);

  return {
    state: {
      email,
      password,
      showPassword,
      errors,
      isSignInDisabled,
      isSubmitting,
    },
    actions: {
      handleEmailChange,
      handlePasswordChange,
      toggleShowPassword,
      handleSubmit,
      handleSubmitWithRedirect,
    },
  };
}
