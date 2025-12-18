"use client";
import { FormErrors } from "@/app/create-account/form/useCreateAccountState";
import { useState } from "react";

export function useSingInState() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

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

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (value.length < 6) {
            setFieldError("password", "Password must be at least 6 characters.");
        } else {
            setFieldError("password", undefined);
        }
    };

    const toggleShowPassword = () => setShowPassword((prev) => !prev);
    const hasValidationErrors = Object.keys(errors).length > 0;
    const isSignInDisabled = !email || !password || hasValidationErrors;
    return {
        state: {
            email,
            password,
            showPassword,
            errors,
            isSignInDisabled
        },
        actions: {
            handlePasswordChange,
            toggleShowPassword,
            handleEmailChange
        },
    };
}
