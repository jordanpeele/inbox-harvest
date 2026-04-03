import { useState } from "react";

export default function OwnerNameModal({ onSubmit, onSkip }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast">
      <div className="bg-surface rounded-xl border border-border w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold mb-2">Quick setup</h2>
        <p className="text-text-muted text-xs leading-relaxed mb-5">
          What's your name? We'll skip your own messages and only extract fan
          emails.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jane Smith"
          autoFocus
          className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-colors mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSubmit(name.trim());
          }}
        />

        <div className="flex gap-2">
          <button
            onClick={() => name.trim() && onSubmit(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-2 text-sm rounded-lg bg-accent text-bg font-medium hover:bg-accent-dim transition-colors disabled:opacity-40"
          >
            Let's go
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors text-text-muted"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
