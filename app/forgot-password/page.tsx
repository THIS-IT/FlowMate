"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!value.trim()) {
      setError("Email is required.");
    } else if (!validateEmail(value)) {
      setError("Please enter a valid email.");
    } else {
      setError(undefined);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail) {
      setError("Email is required.");
      setMessage("");
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(nextEmail)) {
      setError("Please enter a valid email.");
      setMessage("");
      setIsSubmitting(false);
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    setMessage("");
    // place API call here
    setTimeout(() => {
      setMessage("If that email is registered, we'll send a reset link shortly.");
      setIsSubmitting(false);
    }, 900);
  };

  const isDisabled = isSubmitting || !email.trim() || Boolean(error);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <LoadingOverlay show={isSubmitting} label="Sending reset link..." />
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fade-in-card w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
              FR
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Reset your password</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your work email and we will send a reset link.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  error
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                }`}
                aria-invalid={Boolean(error)}
              />
              {error ? (
                <p className="text-xs text-rose-600">{error}</p>
              ) : (
                <p className="text-xs text-slate-500">We will never share your email.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
                isDisabled ? "bg-slate-300 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              Send reset link
            </button>

            {message && (
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Link href="/sign-in" className="font-semibold text-sky-600 hover:text-sky-700">
                Back to sign in
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/create-account"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
