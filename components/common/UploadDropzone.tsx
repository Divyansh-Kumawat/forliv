"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  /** Comma-separated extension list, e.g. ".mp4,.mov". */
  accept: string;
  maxSizeMb: number;
  hint: string;
  disabled?: boolean;
  /** The chosen file, or null once cleared. */
  file: File | null;
  onFile: (file: File | null) => void;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

export function UploadDropzone({
  accept,
  maxSizeMb,
  hint,
  disabled = false,
  file,
  onFile,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowed = accept.split(",").map((entry) => entry.trim().toLowerCase());

  function accept_(candidate: File) {
    if (!allowed.includes(extensionOf(candidate.name))) {
      setError(`Unsupported file type. Accepted: ${allowed.join(", ")}.`);
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      setError(`File is larger than ${maxSizeMb} MB.`);
      return;
    }
    setError(null);
    onFile(candidate);
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) accept_(dropped);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          disabled
            ? "border-line bg-surface-muted/40"
            : dragging
              ? "border-brand-500 bg-brand-50"
              : "border-line-strong bg-surface hover:border-brand-300 hover:bg-brand-50/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) accept_(picked);
            // Allow re-picking the same file after a clear.
            event.target.value = "";
          }}
        />

        <span
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl",
            disabled ? "bg-surface-muted text-ink-muted" : "bg-brand-50 text-brand-600",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 16V4.5M8 8l4-3.5L16 8" />
            <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
          </svg>
        </span>

        {file ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-ink">{file.name}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            <button
              type="button"
              onClick={() => {
                onFile(null);
                setError(null);
              }}
              className="mt-3 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-ink-soft">
              Drag &amp; drop your file here, or{" "}
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="font-medium text-brand-600 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
              >
                click to browse
              </button>
            </p>
            <p className="mt-1 text-xs text-ink-muted">{hint}</p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-[0.8125rem] text-critical">
          {error}
        </p>
      )}
    </div>
  );
}
