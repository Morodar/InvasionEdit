import { MainMenuBar } from "../../../src/pages/edit/fld/components/main-menu/MainMenuBar";
import { screen } from "@testing-library/react";
import { FldMapContextProvider } from "../../../src/context/fld/FldMapContextProvider";
import { renderSut } from "../../testUtils";

describe("MainMenuBar", () => {
    it("renders title", () => {
        renderSut(
            <FldMapContextProvider>
                <MainMenuBar />
            </FldMapContextProvider>,
        );
        expect(screen.getByRole("heading", { name: "app_name" })).toBeInTheDocument();
    });
});
