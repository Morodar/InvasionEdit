import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            include: ["src"],
        },
        environment: "jsdom",
        globals: true,
        setupFiles: ["./test/setup.ts"],
    },
});
