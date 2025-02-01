export function cloneDataView(view: DataView): DataView {
    const clonedBuffer = new ArrayBuffer(view.byteLength);
    const clonedView = new DataView(clonedBuffer);
    for (let i = 0; i < view.byteLength; i++) {
        clonedView.setUint8(i, view.getUint8(i));
    }
    return clonedView;
}
