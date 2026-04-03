import { exportCSV, exportJSON, copyEmails } from "../utils/export";
import { useState } from "react";

export default function ExportBar({ getFilteredContacts }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const contacts = getFilteredContacts();
    copyEmails(contacts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => exportCSV(getFilteredContacts())}
        className="px-4 py-2 text-xs rounded-lg bg-accent text-bg font-medium hover:bg-accent-dim transition-colors"
      >
        Export CSV
      </button>
      <button
        onClick={() => exportJSON(getFilteredContacts())}
        className="px-4 py-2 text-xs rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
      >
        Export JSON
      </button>
      <button
        onClick={handleCopy}
        className={`px-4 py-2 text-xs rounded-lg border transition-colors ${
          copied
            ? "bg-success/10 border-success/30 text-success"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        {copied ? "Copied!" : "Copy emails"}
      </button>
    </div>
  );
}
