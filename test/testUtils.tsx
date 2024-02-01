import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export const renderSut = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
};
