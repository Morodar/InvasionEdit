export function combineClassNames(...names: (string | undefined)[]): string {
    return names.filter((name): name is string => name != undefined).join(" ");
}
