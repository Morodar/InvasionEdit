import globals from "globals";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
    { ignores: ["dist"] },
    {
        // Put eslintConfigPrettier as last element
        // https://github.com/prettier/eslint-config-prettier
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            ...tseslint.configs.recommended,
            eslintConfigPrettier,
        ],
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "react-refresh": reactRefresh,
        },
        rules: {
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "react-hooks/set-state-in-effect": ["warn"],
        },
    },
);
