// ESLint rules for packages/. web/ has its own config (Next.js) and backend/ uses oxlint.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["web/**", "backend/**", "**/dist/**", "**/node_modules/**"]),
  {
    files: ["packages/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      // Casing from the naming-conventions skill: camelCase variables and
      // functions, UPPER_CASE constants, PascalCase types.
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "variable", format: ["camelCase", "UPPER_CASE"] },
        { selector: "function", format: ["camelCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
      ],
    },
  },
  {
    // Workspace boundary: shared-types depends on no other workspace package.
    // See docs/workspace-blueprint.md.
    files: ["packages/shared-types/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@pms/*"],
              message:
                "shared-types must not import another workspace package.",
            },
            {
              group: ["**/web/**", "**/backend/**", "**/database/**"],
              message: "Do not reach into another workspace by path.",
            },
          ],
        },
      ],
    },
  },
]);
