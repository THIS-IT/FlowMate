import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    include: ["app/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["app/**/*.ts"],
      exclude: [
        "app/**/*.tsx",  
        "**/*.d.ts",
        "vitest.setup.ts",
        "vitest.config.*",
        "next.config.*",
        "postcss.config.*",
        "tailwind.config.*",
        "node_modules/**",
        "coverage/**",
        ".next/**",
      ],
    },
  },
});
