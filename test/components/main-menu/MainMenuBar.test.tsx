import { MainMenuBar } from "../../../src/components/main-menu/MainMenuBar";
import { render, screen } from "@testing-library/react";
import { FldMapContextProvider } from "../../../src/context/fld/FldMapContextProvider";

describe("MainMenuBar", () => {
    it("renders title", () => {
        render(
            <FldMapContextProvider>
                <MainMenuBar />
            </FldMapContextProvider>,
        );
        expect(screen.getByRole("heading", { name: "app_name" })).toBeInTheDocument();
    });
});
