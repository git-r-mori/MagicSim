import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            "attach",
            "args",
            "position",
            "rotation",
            "castShadow",
            "receiveShadow",
            "intensity",
            "emissive",
            "emissiveIntensity",
            "toneMapped",
            "transparent",
            "sizeAttenuation",
            "depthWrite",
            "count",
            "array",
            "itemSize",
            "roughness",
            "metalness",
            "shadow-mapSize",
            "shadow-camera-far",
            "shadow-camera-left",
            "shadow-camera-right",
            "shadow-camera-top",
            "shadow-camera-bottom",
            "shadow-bias",
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.sst/**",
      "pkg/frontend/scripts/**",
      "scripts/**",
    ],
  },
  {
    files: ["sst.config.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  prettier
);
