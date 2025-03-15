/**
 * Creates a deep copy of a DataView object.
 *
 * Creates new ArrayBuffer and copies the content of given dataView.
 *
 * @param {DataView} view - The original DataView to be cloned.
 * @returns {DataView} A new DataView that is an exact duplicate of the input.
 */
export function cloneDataView(view: DataView): DataView {
    const clonedBuffer = new ArrayBuffer(view.byteLength);
    const clonedView = new DataView(clonedBuffer);
    for (let i = 0; i < view.byteLength; i++) {
        clonedView.setUint8(i, view.getUint8(i));
    }
    return clonedView;
}
