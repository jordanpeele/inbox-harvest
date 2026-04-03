const cards = [
  { key: "conversationsScanned", label: "Conversations Scanned", icon: "💬" },
  { key: "uniqueEmails", label: "Unique Emails", icon: "📧" },
  { key: "totalFound", label: "Total Found", icon: "🔍" },
  { key: "duplicatesMerged", label: "Duplicates Merged", icon: "🔗" },
];

export default function StatCards({ stats }) {
  return (
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
  );
}
