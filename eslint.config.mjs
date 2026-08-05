import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.netlify/**",
      "**/.nx/**",
      "**/.output/**",
      "**/.nitro/**",
      "**/.tanstack/**",
      "**/routeTree.gen.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,ts,tsx,astro}"],
    plugins: { "@nx": nx },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            {
              sourceTag: "type:app",
              onlyDependOnLibsWithTags: [
                "type:core",
                "type:data",
                "type:theme"
              ]
            },
            {
              sourceTag: "type:data",
              onlyDependOnLibsWithTags: ["type:core"]
            },
            {
              sourceTag: "type:core",
              onlyDependOnLibsWithTags: ["type:core"]
            },
            {
              sourceTag: "type:theme",
              onlyDependOnLibsWithTags: ["type:theme"]
            },
            {
              sourceTag: "scope:marketing",
              onlyDependOnLibsWithTags: ["type:theme"]
            }
          ]
        }
      ]
    }
  }
);
