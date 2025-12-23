import { ReactElement } from "react";
import { MainLayout } from "../../../layout/MainLayout";
import { EditLevelContextProvider, useEditLevelContext } from "./EditLevelContext";
import { LevelView } from "../../../domain/pck/level/components/LevelView";
import { LevelPckFileSelection } from "./LevelPckFileSelection";
import { FldName } from "../../../domain/fld/file/FldName";
import { DebugSettingsButton } from "../../../common/debug/DebugSettingsButton";
import { SaveLevelButton } from "../../../domain/pck/level/SaveLevelButton";

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
            <MainLayout
                withPadding={false}
                centerElements={<FldName />}
                rightSideElements={
                    <>
                        <DebugSettingsButton />
                        <SaveLevelButton />
                    </>
                }
            >
                <LevelView />
            </MainLayout>
        );
    }

    return (
        <MainLayout withPadding={true} mainMaxWidth={900}>
            <LevelPckFileSelection />
        </MainLayout>
    );
};

export default PageEditLevel;
