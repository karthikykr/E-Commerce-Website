import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Flat config
const eslintConfig = [
  // Next.js & TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignore generated folders
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Add Prettier plugin & rules
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...prettier.rules, // disables ESLint rules that conflict with Prettier
      "prettier/prettier": "error", // marks Prettier issues as ESLint errors
    },
  },
];

export default eslintConfig;
