import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const BASE_DIR = "/InvasionEdit/";

// https://vitejs.dev/config/
export default defineConfig({
    base: BASE_DIR,
    build: {
        chunkSizeWarningLimit: 1000,
    },
    define: {
        "import.meta.env.BASE_DIR": JSON.stringify(BASE_DIR),
    },
    plugins: [
        react({
            babel: {
                plugins: ["babel-plugin-react-compiler"],
            },
        }),
    ],
});
