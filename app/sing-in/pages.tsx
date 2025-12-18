"use client";
import Link from "next/link";
import { useSingInState } from "./form/useSingInState";

export default function SingIn() {
    const {
        state: {
            email,
            password,
            showPassword,
            errors
        },
        actions: {
            handlePasswordChange,
            toggleShowPassword,
            handleEmailChange
        }
    } = useSingInState();
    return (
        <div className="min-h-screen bg-slate-100 text-slate-800">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                            FR
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">
                            Sign in to FlowRay
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Use your company account to continue.
                        </p>
                    </div>

                    <form className="space-y-5">
                        <div className="space-y-2">
                            <label
                                className="block text-sm font-medium text-slate-700"
                                htmlFor="email"
                            >
                                Email
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
                            <div className="flex items-center justify-between">
                                <label
                                    className="block text-sm font-medium text-slate-700"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                                    className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500 cursor-pointer"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                                    defaultChecked
                                />
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                        >
                            Sign in
                        </button>

                        <Link
                            href="/create-account"
                            className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Create account
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
