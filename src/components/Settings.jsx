import { useState, useRef } from "react";
import { exportAll, importFromJSON } from "../utils/idb";

const GITHUB_URL = "https://github.com/jordanpeele/inbox-harvest";
const VERSION = "1.0.0";

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Settings({
  settings,
  onSave,
  dbInfo,
  onClearDb,
  onClose,
  onDataImported,
}) {
  const [ownerName, setOwnerName] = useState(settings.ownerName || "");
  const [includeOwner, setIncludeOwner] = useState(
    settings.includeOwnerMessages || false
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const importRef = useRef();

  const handleSave = () => {
    onSave({
      ownerName,
      includeOwnerMessages: includeOwner,
    });
  };

  const handleExportBackup = async () => {
    const data = await exportAll();
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(
      JSON.stringify(data, null, 2),
      `inbox-harvest-backup-${date}.json`,
      "application/json"
    );
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importFromJSON(json);
      setImportStatus(
        `Imported ${result.imported} contacts (${result.mergedCount} merged)`
      );
      if (onDataImported) onDataImported();
    } catch (err) {
      setImportStatus(`Error: ${err.message}`);
    }
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast">
      <div className="bg-surface rounded-xl border border-border w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <div className="space-y-5">
          {/* Owner name */}
          <div>
            <label className="text-xs text-text-muted block mb-1.5">
              Your Name (messages you sent will be skipped)
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeOwner}
              onChange={(e) => setIncludeOwner(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-sm">Include my own messages in scan</span>
          </label>

          <button
            onClick={handleSave}
            className="w-full py-2 text-sm rounded-lg bg-accent text-bg font-medium hover:bg-accent-dim transition-colors"
          >
            Save settings
          </button>

          {/* Database info */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-muted mb-1">Database info</p>
            <div className="text-xs space-y-1 text-text-muted">
              <p>Contacts: {dbInfo.contactCount}</p>
              <p>
                Last updated:{" "}
                {dbInfo.lastUpdated
                  ? new Date(dbInfo.lastUpdated).toLocaleString()
                  : "Never"}
              </p>
              <p>Total imports: {dbInfo.totalImports}</p>
            </div>
          </div>

          {/* Backup & Sync */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium mb-3">Backup & Sync</p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={handleExportBackup}
                className="flex-1 py-2 text-xs rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
              >
                Export Full Backup
              </button>
              <button
                onClick={() => importRef.current?.click()}
                className="flex-1 py-2 text-xs rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
              >
                Import Backup
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </div>

            {importStatus && (
              <p
                className={`text-xs mb-3 ${importStatus.startsWith("Error") ? "text-danger" : "text-success"}`}
              >
                {importStatus}
              </p>
            )}

            <div className="rounded-lg bg-bg border border-border p-3 text-xs text-text-muted space-y-1.5">
              <p className="font-medium text-text text-xs">
                &#128193; Keep Your Data Safe
              </p>
              <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                <li>
                  Create a folder on your Desktop called "Fan Emails"
                </li>
                <li>Export your contacts as CSV after each import</li>
                <li>
                  Drag the folder into Google Drive to keep it synced across
                  devices
                </li>
                <li>
                  Use "Export Full Backup" monthly — you can re-import it on any
                  device
                </li>
              </ol>
            </div>

            <div className="rounded-lg bg-accent/5 border border-accent/20 p-3 mt-3 text-xs text-text-muted leading-relaxed">
              <p className="font-medium text-accent text-xs mb-1">
                Switch Devices?
              </p>
              <p>
                Export a full backup on your current device, visit this app on
                your new device, and import the backup file.
              </p>
            </div>
          </div>

          {/* Clear database */}
          <div className="border-t border-border pt-4">
            {confirmClear ? (
              <div className="space-y-2">
                <p className="text-xs text-danger">
                  This will permanently delete all contacts. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearDb();
                      setConfirmClear(false);
                    }}
                    className="flex-1 py-2 text-xs rounded-lg bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors"
                  >
                    Yes, clear everything
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2 text-xs rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 text-xs rounded-lg bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors"
              >
                Clear database
              </button>
            )}
          </div>

          {/* About */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-muted mb-2">About</p>
            <div className="text-xs text-text-muted space-y-1">
              <p>Inbox Harvest v{VERSION}</p>
              <p>
                Made by{" "}
                <a
                  href="https://cobyweiss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dim transition-colors"
                >
                  Coby Weiss
                </a>
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:text-accent-dim transition-colors"
              >
                View on GitHub
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
