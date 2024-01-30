import { App } from "../../src/components/App";
import { render, screen } from "@testing-library/react";

describe("App", () => {
    test("renders hello", () => {
        render(<App />);
        expect(screen.getByRole("heading", { name: "Invasion Edit" })).toBeInTheDocument();
    });
});
