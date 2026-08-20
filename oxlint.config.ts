import { defineConfig } from "oxlint";

export default defineConfig({
    // Enable plugins that were used in the original ESLint config
    plugins: ["react", "typescript", "import", "vitest"],
    
    // Rules configuration matching the original ESLint setup
    rules: {
        // TypeScript rules (from @typescript-eslint/eslint-plugin)
        "typescript/no-unused-vars": "warn",
        "typescript/no-explicit-any": "warn",
        "typescript/no-non-null-assertion": "warn",
        
        // React rules
        "react/jsx-no-target-blank": "warn",
        "react/no-unknown-property": "warn",
        "react/react-in-jsx-scope": "off",
        
        // React hooks rules (from eslint-plugin-react-hooks)
        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",
        
        // Import rules
        "import/no-cycle": "warn",
        "import/no-duplicates": "warn",
        
        // General ESLint rules
        "no-console": "warn",
        "no-unused-vars": "warn",
    },
    
    // Files to ignore (matching the original ESLint config)
    ignorePatterns: ["dist", "node_modules", ".git", "public"],
    
    // React settings
    settings: {
        react: {
            version: "19.2.8",
        },
    },
});
