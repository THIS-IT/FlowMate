"use client";

import Link from "next/link";
import { useCreateAccountState, type Role } from "./form/useCreateAccountState";

export default function CreateAccount() {
  const {
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
      handleEmailChange,
      handlePasswordChange,
      handleConfirmPasswordChange,
      setName,
      handleRoleChange,
      toggleVisibility,
      handleSubmit,
      toggleShowPassword,
      toggleShowConfirmPassword,
    },
  } = useCreateAccountState();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
              FR
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Create your FlowRay account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Set up access to the node-based workflow engine for your team.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) =>
              handleSubmit(e, (payload) => {
                // place API call or navigation here
                console.log("ready to submit", payload);
              })
            }
          >
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="name"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.name
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                name="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.email
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="role"
              >
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={role}
                  className={`w-full appearance-none rounded-lg border bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.role
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                    }`}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  aria-invalid={Boolean(errors.role)}
                >
                  <option value="PM">PM</option>
                  <option value="SA">SA</option>
                  <option value="DEV">Dev</option>
                  <option value="QA">QA</option>
                  <option value="OTHER">Other (custom)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Choose "Other" for special roles and set visibility below.
              </p>
              {errors.role && <p className="text-xs text-rose-600">{errors.role}</p>}
            </div>

            <div
              className={`space-y-2 overflow-hidden transition-all duration-500 ease-in-out ${isOtherRole
                  ? "max-h-[260px] opacity-100 translate-y-0"
                  : "pointer-events-none max-h-0 opacity-0 -translate-y-2"
                }`}
              aria-hidden={!isOtherRole}
              data-testid="visibility-section"
              data-visibility-section="true"
            >
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Visibility (for Other role)
                </label>
                <span className="text-xs text-slate-500">Select what this role can see</span>
              </div>
              <div
                className={`grid grid-cols-2 gap-2 rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 ${errors.visibility ? "border-rose-300" : "border-slate-200"
                  }`}
              >
                {["PM", "SA", "DEV", "QA"].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="visibility"
                      value={item}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                      checked={visibility.includes(item)}
                      onChange={() => toggleVisibility(item)}
                      disabled={!isOtherRole}
                    />
                    {item}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Leave unchecked if not using a custom role.
              </p>
              {errors.visibility && <p className="text-xs text-rose-600">{errors.visibility}</p>}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full rounded-lg border bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.password
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                    }`}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full rounded-lg border bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.confirmPassword
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                    }`}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={toggleShowConfirmPassword}
                  className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-xs text-rose-600">{errors.confirmPassword}</p>
              ) : (
                <p
                  className={`text-xs ${passwordsMatch
                      ? "text-emerald-600"
                      : password || confirmPassword
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                >
                  {passwordsMatch
                    ? "Passwords match."
                    : password || confirmPassword
                      ? "Passwords do not match yet."
                      : "Please enter and confirm your password."}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Create account
            </button>

            {submitMessage && (
              <p className="text-center text-sm font-medium text-emerald-600">{submitMessage}</p>
            )}

            <div className="flex items-center justify-center text-sm text-slate-600">
              <span className="mr-2">Already have an account?</span>
              <Link
                href="/"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
