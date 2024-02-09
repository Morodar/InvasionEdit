import { StorageItems } from "./StorageItems";

export interface DebugSettings {
    showDebugCube: boolean;
    showDebugCube3x3: boolean;
    showDebugCursorPosition: boolean;
}

export class DebugSettingsService {
    saveSettings(settings: DebugSettings) {
        console.log("saving debug settings");
        const json = JSON.stringify(settings);
        localStorage.setItem(StorageItems.FLD_DEBUG_SETTINGS_KEY, json);
    }

    loadSettings(): DebugSettings {
        try {
            const jsonStr = localStorage.getItem(StorageItems.FLD_DEBUG_SETTINGS_KEY) ?? "{}";
            const json = JSON.parse(jsonStr) as Record<string, unknown>;
            console.log("loading debug settings");
            if (typeof json !== "object" || json == null) {
                return this.createDefault();
            }

            return {
                showDebugCube: this.readBooleanOrDefault(json, "showDebugCube"),
                showDebugCube3x3: this.readBooleanOrDefault(json, "showDebugCube3x3"),
                showDebugCursorPosition: this.readBooleanOrDefault(json, "showDebugCursorPosition"),
            };
        } catch (Error) {
            return this.createDefault();
        }
    }

    readBooleanOrDefault(obj: Record<string, unknown>, property: string): boolean {
        const value = obj[property];
        if (typeof value === "boolean") {
            return value;
        }
        return false;
    }

    createDefault = (): DebugSettings => ({
        showDebugCube: false,
        showDebugCursorPosition: false,
        showDebugCube3x3: false,
    });
}
