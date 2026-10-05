"use client";

const DEFAULT_MAX_DIMENSION = 640;
const DEFAULT_QUALITY = 0.82;

function toJpegDataUrl(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxDimension: number,
  quality: number,
): string {
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");

  context.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Shrinks an uploaded image to a JPEG data URL.
 *
 * Originals run to several megabytes and localStorage holds roughly five in
 * total, so the full file can never be persisted. A downscaled copy is small
 * enough to keep, which means thumbnails and annotations survive a refresh.
 * Replace this with an upload to object storage once a backend exists.
 */
export async function downscaleImage(
  file: File,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    return toJpegDataUrl(
      bitmap,
      bitmap.width,
      bitmap.height,
      maxDimension,
      quality,
    );
  } finally {
    bitmap.close();
  }
}

/** Grabs a still from partway through a video file. */
export async function captureVideoFrame(
  file: File,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Video could not be decoded."));
    });

    // A frame from partway in is more representative than the first one, which
    // is often black.
    const target = Number.isFinite(video.duration)
      ? Math.min(1, video.duration / 2)
      : 0;

    if (target > 0) {
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = target;
      });
    }

    return toJpegDataUrl(
      video,
      video.videoWidth,
      video.videoHeight,
      maxDimension,
      quality,
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Best-effort still for any upload. Returns null rather than throwing when the
 * browser can't decode the container — AVI and MKV commonly aren't supported —
 * so the record is still saved, just without a preview.
 */
export async function capturePreview(file: File): Promise<string | null> {
  try {
    if (file.type.startsWith("image/")) return await downscaleImage(file);
    if (file.type.startsWith("video/")) return await captureVideoFrame(file);

    // Fall back on the extension when the browser reports no MIME type.
    return /\.(png|jpe?g|gif|webp)$/i.test(file.name)
      ? await downscaleImage(file)
      : await captureVideoFrame(file);
  } catch {
    return null;
  }
}
