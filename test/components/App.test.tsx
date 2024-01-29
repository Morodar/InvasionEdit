import { screen } from "@testing-library/react";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { MapView } from "../../src/components/map-view/MapView";

describe("App", () => {
    it("renders hello", async () => {
        await ReactThreeTestRenderer.create(<MapView />);
        screen.debug();
        expect(screen.getByRole("heading", { name: "Invasion Edit" })).toBeInTheDocument();
    });
});
