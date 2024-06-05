import { ReactElement } from "react";
import { MainLayout } from "../../../layout/MainLayout";
import { EditLevelContextProvider, useEditLevelContext } from "./EditLevelContext";
import { LevelView } from "../../../domain/pck/level/components/LevelView";
import { LevelPckFileSelection } from "./LevelPckFileSelection";
import { FldName } from "../../../domain/fld/file/FldName";
import { DebugSettingsButton } from "../../../common/debug/DebugSettingsButton";

const PageEditLevel = (): ReactElement => {
    return (
        <EditLevelContextProvider>
            <EditLevel />
        </EditLevelContextProvider>
    );
};

const EditLevel = (): ReactElement => {
    const { levelPck } = useEditLevelContext();

    if (levelPck) {
        return (
            <MainLayout withPadding={false} centerElements={<FldName />} rightSideElements={<DebugSettingsButton />}>
                <LevelView />
            </MainLayout>
        );
    }

    return (
        <MainLayout withPadding={true}>
            <LevelPckFileSelection />
        </MainLayout>
    );
};

export default PageEditLevel;
