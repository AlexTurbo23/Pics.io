import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import playwrightPlugin from "eslint-plugin-playwright";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      playwright: playwrightPlugin,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Playwright
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "warn",
      "playwright/valid-expect": "error",
      "playwright/no-wait-for-timeout": "warn",
      "playwright/prefer-web-first-assertions": "warn",
    },
  },
  {
    ignores: ["node_modules/", "playwright-report/", "test-results/"],
  },
];
