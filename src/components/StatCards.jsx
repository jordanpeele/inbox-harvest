const cards = [
  { key: "conversationsScanned", label: "Conversations Scanned", icon: "\uD83D\uDCAC" },
  { key: "uniqueEmails", label: "Unique Emails", icon: "\uD83D\uDCE7" },
  { key: "totalFound", label: "Total Found", icon: "\uD83D\uDD0D" },
  { key: "duplicatesMerged", label: "Duplicates Merged", icon: "\uD83D\uDD17" },
];

function relativeTime(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function StatCards({ stats, lastUpdated }) {
  const timeLabel = relativeTime(lastUpdated);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ key, label, icon }, i) => (
          <div
            key={key}
            className="animate-fade-in bg-surface rounded-xl border border-border p-4"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{icon}</span>
              <span className="text-text-muted text-xs">{label}</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              {(stats[key] ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {timeLabel && (
        <p className="text-text-muted text-[11px] pl-1">
          Last import: {timeLabel}
        </p>
      )}
    </div>
  );
}
