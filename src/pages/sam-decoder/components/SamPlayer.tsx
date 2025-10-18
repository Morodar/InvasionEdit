import { useEffect, useRef } from "react";

/**
 * Create a WAV Blob from a DataView containing interleaved signed 16-bit PCM samples.
 * Assumes: channels = 2, sampleRate = 22050, samples are Int16 little-endian, interleaved L,R,L,R...
 */
function dataViewToWavBlob(pcmView: DataView, sampleRate = 22050, numChannels = 2): Blob {
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataByteLength = pcmView.byteLength; // PCM data length in bytes
    const wavHeaderByteLength = 44;
    const buffer = new ArrayBuffer(wavHeaderByteLength + dataByteLength);
    const view = new DataView(buffer);

    let offset = 0;

    // Helper to write ASCII strings
    function writeString(str: string) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
        offset += str.length;
    }

    // RIFF chunk descriptor
    writeString("RIFF");
    view.setUint32(offset, 36 + dataByteLength, true); // file length - 8
    offset += 4;
    writeString("WAVE");

    // fmt subchunk
    writeString("fmt ");
    view.setUint32(offset, 16, true); // subchunk1 size (16 for PCM)
    offset += 4;
    view.setUint16(offset, 1, true); // audio format = 1 (PCM)
    offset += 2;
    view.setUint16(offset, numChannels, true); // num channels
    offset += 2;
    view.setUint32(offset, sampleRate, true); // sample rate
    offset += 4;
    view.setUint32(offset, byteRate, true); // byte rate
    offset += 4;
    view.setUint16(offset, blockAlign, true); // block align
    offset += 2;
    view.setUint16(offset, bytesPerSample * 8, true); // bits per sample
    offset += 2;

    // data subchunk
    writeString("data");
    view.setUint32(offset, dataByteLength, true);
    offset += 4;

    // Copy PCM samples (already little-endian signed 16-bit) into the WAV buffer
    // Efficient copy by reading Uint8 from source DataView and writing to target DataView
    const srcU8 = new Uint8Array(pcmView.buffer, pcmView.byteOffset, pcmView.byteLength);
    const dstU8 = new Uint8Array(buffer, wavHeaderByteLength, dataByteLength);
    dstU8.set(srcU8);

    return new Blob([buffer], { type: "audio/wav" });
}

type SamPlayerProps = {
    /** DataView with interleaved Int16 PCM stereo 22050Hz */
    pcmDataView: DataView<ArrayBuffer>;
};

export default function SamPlayer({ pcmDataView }: SamPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const urlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!pcmDataView) return;

        // Create WAV blob and object URL
        const wavBlob = dataViewToWavBlob(pcmDataView, 22050, 2);
        const url = URL.createObjectURL(wavBlob);

        // Clean up previous URL
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
        }
        urlRef.current = url;

        // Set audio src and optionally play
        if (audioRef.current) {
            audioRef.current.src = url;
            // Optionally autoplay (may be blocked by browser)
            // audioRef.current.play().catch(() => {});
        }

        // Cleanup on unmount
        return () => {
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
                urlRef.current = null;
            }
        };
    }, [pcmDataView]);

    return (
        <div>
            <audio ref={audioRef} controls />
        </div>
    );
}
