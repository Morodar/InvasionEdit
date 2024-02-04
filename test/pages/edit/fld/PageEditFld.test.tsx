import { screen } from "@testing-library/react";
import PageEditFld from "../../../../src/pages/edit/fld/PageEditFld";
import { renderSut } from "../../../testUtils";

describe("MainPageEditFld", () => {
    it("renders app name", () => {
        renderSut(<PageEditFld />);
        expect(screen.getByRole("heading", { name: "app_name" })).toBeInTheDocument();
    });
});
