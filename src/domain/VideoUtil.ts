export async function createVideoFromFrames(
  frames: Uint8Array[],
  width: number,
  height: number,
  fps: number = 30
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(width, height);

  // Capture canvas stream
  const stream = canvas.captureStream(fps);
  const mimeType =
    MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  const done = new Promise<Blob>(resolve =>
    (recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType })))
  );

  recorder.start();

  const delay = 1000 / fps;

  for (const frame of frames) {
    imageData.data.set(frame);
    ctx.putImageData(imageData, 0, 0);

    // Wait for both a frame render and real time delay
    await new Promise<void>(resolve => {
      requestAnimationFrame(() =>
        setTimeout(resolve, delay)
      );
    });
  }

  recorder.stop();
  return done;
}
