export async function readFile(blob: Blob | File): Promise<ArrayBuffer> {
    if ("arrayBuffer" in blob) return await blob.arrayBuffer();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject();
        reader.readAsArrayBuffer(blob);
    });
}
