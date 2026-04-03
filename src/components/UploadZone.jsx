import { useState, useRef, useCallback } from "react";

export default function UploadZone({ onFilesReady, processing }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const folderRef = useRef();

  const handleFiles = useCallback(
    (fileList) => {
      if (processing) return;
      const files = [...fileList];
      const zip = files.find((f) => f.name.endsWith(".zip"));
      if (zip) {
        onFilesReady({ type: "zip", file: zip });
      } else {
        onFilesReady({ type: "files", files });
      }
    },
    [onFilesReady, processing]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative w-full max-w-lg rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/5 scale-[1.02]"
            : "border-border hover:border-accent/50 hover:bg-surface-hover"
        } ${processing ? "pointer-events-none opacity-50" : ""}`}
        onClick={() => fileRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">
              Drop your Facebook export here
            </p>
            <p className="text-text-muted text-xs mt-1">
              .zip file, folder of JSONs, or individual message_*.json files
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,.json"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current?.click();
          }}
          className="px-4 py-2 text-xs rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
        >
          Choose files
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            folderRef.current?.click();
          }}
          className="px-4 py-2 text-xs rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
        >
          Choose folder
        </button>
        <input
          ref={folderRef}
          type="file"
          webkitdirectory=""
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex items-center gap-1.5 text-text-muted text-xs">
        <span>&#x1f512;</span>
        <span>All data stays in your browser. Nothing is uploaded to any server.</span>
      </div>
    </div>
  );
}
