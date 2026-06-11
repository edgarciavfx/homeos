import typescriptEslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default typescriptEslint.config(
  ...typescriptEslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    ignores: [".next/**"],
  },
);
