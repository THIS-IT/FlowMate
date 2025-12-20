import { z } from "zod";

export const signInSchemaValidate = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .pipe(z.email({ message: "Please enter a valid email." })),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type SignInPayload = z.infer<typeof signInSchemaValidate>;
export type SignInErrors = Partial<Record<keyof SignInPayload, string>>;

export const extractSignInErrors = (error: z.ZodError<SignInPayload>): SignInErrors => {
  const next: SignInErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if ((key === "email" || key === "password") && !next[key]) {
      next[key] = issue.message;
    }
  }

  return next;
};

export function validateSignInField<K extends keyof SignInPayload>(
  key: K,
  value: SignInPayload[K],
): string | undefined {
  const result = signInSchemaValidate.shape[key].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateSignInForm(
  values: SignInPayload,
):
  | { success: true; data: SignInPayload; errors: {} }
  | { success: false; errors: SignInErrors } {
  const result = signInSchemaValidate.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  return { success: false, errors: extractSignInErrors(result.error) };
}
