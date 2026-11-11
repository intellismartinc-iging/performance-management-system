import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Workspace boundary: web reads shared contracts only. See docs/workspace-blueprint.md.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@pms/backend", "@pms/backend/*", "@pms/database", "@pms/database/*"],
              message: "web may import only @pms/shared-types.",
            },
            {
              group: ["@pms/shared-types/*"],
              message: "Import from the package root: @pms/shared-types.",
            },
            {
              group: ["**/backend/**", "**/packages/**"],
              message: "Do not reach into another workspace by path.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
