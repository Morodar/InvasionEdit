import { MainMenuBar } from "../../../src/components/main-menu/MainMenuBar";
import { render, screen } from "@testing-library/react";

describe("MainMenuBar", () => {
    it("renders title", () => {
        render(<MainMenuBar />);
        expect(screen.getByRole("heading", { name: "Invasion Edit" })).toBeInTheDocument();
    });
});
