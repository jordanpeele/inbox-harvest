import { useState, useMemo } from "react";

const PAGE_SIZE = 50;

function FacebookIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
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

export default function ContactTable({ contacts, search, dateFrom, dateTo }) {
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);

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
  const pageContacts = filtered.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(0);
  };

  // Expose filtered for parent export
  ContactTable.lastFiltered = filtered;

  return (
    <div className="animate-fade-in">
      <div className="overflow-x-auto rounded-xl border border-border">
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
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-text-muted text-sm"
                >
                  No contacts found
                </td>
              </tr>
            ) : (
              pageContacts.map((c) => (
                <tr
                  key={c.id || c.email}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors"
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
                  <td className="px-4 py-3 text-text-muted text-xs max-w-[200px] truncate">
                    {c.snippet}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
