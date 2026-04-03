const PHASE_LABELS = {
  extracting: "Extracting zip",
  reading: "Reading files",
  parsing: "Parsing conversations",
  deduplicating: "Deduplicating emails",
};

export default function ProgressBar({ progress }) {
  if (!progress) return null;

  const { phase, current, total } = progress;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="animate-fade-in-fast w-full max-w-lg mx-auto px-4">
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-text-muted">{PHASE_LABELS[phase] || phase}</span>
          <span className="text-accent font-medium">
            {current}/{total} ({pct}%)
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
