import { z } from "zod";

export const useCreateAccountValidate = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .pipe(z.email({ message: "Please enter a valid email." })),
  role: z.enum(["PM", "SA", "DEV", "QA", "OTHER"], { message: "Role is required." }),
  visibility: z.array(z.string()).default([]),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
}).superRefine((data, ctx) => {
  if (data.role === "OTHER" && data.visibility.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["visibility"],
      message: "Select at least one role to grant visibility.",
    });
  }
});

export type CreateAccountPayload = z.infer<typeof useCreateAccountValidate>;
export type CreateAccountErrors = Partial<Record<keyof CreateAccountPayload, string>>;

const createAccountKeys = new Set<keyof CreateAccountPayload>(
    Object.keys(useCreateAccountValidate.shape) as Array<keyof CreateAccountPayload>,
);

export const extractCreateAccountErrors = (
    error: z.ZodError<CreateAccountPayload>,
): CreateAccountErrors => {
    const next: CreateAccountErrors = {};
    for (const issue of error.issues) {
        const key = issue.path[0] as keyof CreateAccountPayload;
        if (createAccountKeys.has(key) && !next[key]) {
            next[key] = issue.message;
        }
    }

    return next;
};

export function validateCreateAccountField<K extends keyof CreateAccountPayload>(
    key: K,
    value: CreateAccountPayload[K],
): string | undefined {
    const result = useCreateAccountValidate.shape[key].safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
}


export function validateCreateAccountForm(
    values: CreateAccountPayload,
):
    | { success: true; data: CreateAccountPayload; errors: {} }
    | { success: false; errors: CreateAccountErrors } {
    const result = useCreateAccountValidate.safeParse(values);

    if (result.success) {
        return { success: true, data: result.data, errors: {} };
    }

    return { success: false, errors: extractCreateAccountErrors(result.error) };
}
