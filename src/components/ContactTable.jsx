import { useState, useMemo } from "react";

const PAGE_SIZE = 50;

function FacebookIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "timestamp", label: "Date" },
  { key: "conversation", label: "Conversation" },
  { key: "snippet", label: "Snippet" },
];

export default function ContactTable({ contacts, search, dateFrom, dateTo, onClearFilters }) {
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  const hasFilters = !!(search || dateFrom || dateTo);

  const filtered = useMemo(() => {
    let result = contacts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.conversation.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((c) => c.timestamp >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000;
      result = result.filter((c) => c.timestamp < to);
    }

    result.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [contacts, search, dateFrom, dateTo, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageContacts = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(0);
  };

  ContactTable.lastFiltered = filtered;

  // Empty state when filters produce no results
  if (filtered.length === 0 && hasFilters) {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-3 py-16 text-center">
        <svg className="w-10 h-10 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-text-muted text-sm">No contacts match your filters</p>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-xs rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
        >
          Clear filters
        </button>
      </div>
    );
  }

  // Mobile card layout (< 640px)
  const mobileCards = (
    <div className="sm:hidden space-y-3">
      {pageContacts.map((c) => (
        <div
          key={c.id || c.email}
          className="bg-surface rounded-xl border border-border p-4 space-y-2"
          onClick={() => setExpandedRow(expandedRow === c.email ? null : c.email)}
        >
          <div className="flex items-center gap-2">
            <FacebookIcon />
            <span className="font-medium text-sm">{c.name}</span>
            {c.merged && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                merged
              </span>
            )}
          </div>
          <a
            href={`mailto:${c.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-accent text-sm block"
          >
            {c.email}
          </a>
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>{new Date(c.timestamp).toLocaleDateString()}</span>
            <span>{c.conversation}</span>
          </div>
          {expandedRow === c.email ? (
            <p className="text-text-muted text-xs leading-relaxed pt-1 border-t border-border/50">
              {c.snippet}
            </p>
          ) : (
            <p className="text-text-muted text-xs truncate">{c.snippet}</p>
          )}
        </div>
      ))}
    </div>
  );

  // Desktop table layout (>= 640px)
  const desktopTable = (
    <div className="hidden sm:block overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-surface border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="px-4 py-3 font-medium text-text-muted text-xs cursor-pointer hover:text-accent transition-colors select-none whitespace-nowrap"
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-accent">
                    {sortAsc ? "\u2191" : "\u2193"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageContacts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-text-muted text-sm">
                No contacts found
              </td>
            </tr>
          ) : (
            pageContacts.map((c) => {
              const isExpanded = expandedRow === c.email;
              return (
                <tr
                  key={c.id || c.email}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(isExpanded ? null : c.email)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FacebookIcon />
                      {c.name}
                      {c.merged && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                          merged
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-accent">{c.email}</td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                    {new Date(c.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{c.conversation}</td>
                  <td className="px-4 py-3 text-text-muted text-xs max-w-[250px]">
                    {isExpanded ? (
                      <span className="whitespace-normal leading-relaxed">{c.snippet}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="truncate">{c.snippet}</span>
                        <svg className="w-3 h-3 flex-shrink-0 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {mobileCards}
      {desktopTable}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-text-muted">
          <span>
            Showing {page * PAGE_SIZE + 1}-
            {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
