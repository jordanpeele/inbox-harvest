import { useState, useEffect, useCallback } from "react";
import Onboarding from "./components/Onboarding";
import UploadZone from "./components/UploadZone";
import ProgressBar from "./components/ProgressBar";
import StatCards from "./components/StatCards";
import ContactTable from "./components/ContactTable";
import ExportBar from "./components/ExportBar";
import Settings from "./components/Settings";
import OwnerNameModal from "./components/OwnerNameModal";
import { loadDatabase, loadSettings, saveSettings, clearDatabase } from "./utils/db";
import { upsertContacts } from "./utils/idb";
import { extractFilesFromZip, readJsonFiles } from "./utils/zip";
import ParseWorker from "./worker/parseWorker.js?worker";

const GITHUB_URL = "https://github.com/jordanpeele/inbox-harvest";

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    conversationsScanned: 0,
    uniqueEmails: 0,
    totalFound: 0,
    duplicatesMerged: 0,
  });
  const [dbMeta, setDbMeta] = useState({ lastUpdated: null, totalImports: 0 });
  const [settings, setSettingsState] = useState({ ownerName: "", includeOwnerMessages: false });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Owner name prompt state
  const [pendingUpload, setPendingUpload] = useState(null);
  const [showOwnerPrompt, setShowOwnerPrompt] = useState(false);

  // Search / filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const refreshData = useCallback(async () => {
    const [db, s] = await Promise.all([loadDatabase(), loadSettings()]);
    const c = db.contacts || [];
    const mergedCount = c.filter(x => x.merged).length;
    setContacts(c);
    setDbMeta({ lastUpdated: db.lastUpdated, totalImports: db.totalImports || 0 });
    setStats((prev) => ({
      ...prev,
      uniqueEmails: c.length,
      totalFound: c.length,
      duplicatesMerged: mergedCount,
    }));
    setSettingsState(s);
  }, []);

  useEffect(() => {
    refreshData().then(() => setLoaded(true));
  }, [refreshData]);

  const hasContacts = contacts.length > 0;

  const startParsing = useCallback(
    async (input, currentSettings) => {
      setProcessing(true);
      setProgress({ phase: "extracting", current: 0, total: 1 });

      let files;
      try {
        if (input.type === "zip") {
          files = await extractFilesFromZip(input.file, setProgress);
        } else {
          files = await readJsonFiles(input.files, setProgress);
        }
      } catch (err) {
        console.error("File extraction error:", err);
        setProcessing(false);
        setProgress(null);
        return;
      }

      if (files.length === 0) {
        setProcessing(false);
        setProgress(null);
        return;
      }

      const worker = new ParseWorker();
      worker.onmessage = async (e) => {
        const msg = e.data;
        if (msg.type === "progress") {
          setProgress(msg);
        } else if (msg.type === "result") {
          worker.terminate();

          await upsertContacts(msg.contacts);

          const db = await loadDatabase();
          const dbContacts = db.contacts || [];
          const mergedBadgeCount = dbContacts.filter(x => x.merged).length;
          setContacts(dbContacts);
          setDbMeta({ lastUpdated: db.lastUpdated, totalImports: db.totalImports });
          setStats({
            ...msg.stats,
            uniqueEmails: dbContacts.length,
            duplicatesMerged: mergedBadgeCount,
          });
          setProcessing(false);
          setProgress(null);
          setShowUpload(false);
        }
      };

      const ownerName = currentSettings.includeOwnerMessages ? null : currentSettings.ownerName;
      worker.postMessage({ files, ownerName: ownerName || null });
    },
    []
  );

  const handleFilesReady = useCallback(
    (input) => {
      // If first upload and no owner name set, prompt
      if (!settings.ownerName && !settings.includeOwnerMessages && dbMeta.totalImports === 0) {
        setPendingUpload(input);
        setShowOwnerPrompt(true);
        return;
      }
      startParsing(input, settings);
    },
    [settings, dbMeta.totalImports, startParsing]
  );

  const handleOwnerSubmit = async (name) => {
    const newSettings = { ...settings, ownerName: name };
    setSettingsState(newSettings);
    await saveSettings(newSettings);
    setShowOwnerPrompt(false);
    if (pendingUpload) {
      startParsing(pendingUpload, newSettings);
      setPendingUpload(null);
    }
  };

  const handleOwnerSkip = () => {
    setShowOwnerPrompt(false);
    const skipSettings = { ...settings, includeOwnerMessages: true };
    if (pendingUpload) {
      startParsing(pendingUpload, skipSettings);
      setPendingUpload(null);
    }
  };

  const handleSaveSettings = async (s) => {
    setSettingsState(s);
    await saveSettings(s);
    setShowSettings(false);
  };

  const handleClearDb = async () => {
    await clearDatabase();
    setContacts([]);
    setDbMeta({ lastUpdated: null, totalImports: 0 });
    setStats({ conversationsScanned: 0, uniqueEmails: 0, totalFound: 0, duplicatesMerged: 0 });
    setShowSettings(false);
  };

  const handleDataImported = async () => {
    await refreshData();
  };

  const getFilteredContacts = () => ContactTable.lastFiltered || contacts;

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  const header = (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold tracking-tight flex items-center gap-1.5">
            <span className="text-lg">&#x1F33E;</span>
            Inbox Harvest
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            &#x1f512; Local only
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasContacts && !processing && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent text-bg font-medium hover:bg-accent-dim transition-colors"
            >
              Upload more
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <SettingsIcon />
          </button>
        </div>
      </div>
    </header>
  );

  const footer = (
    <div className="flex flex-col items-center gap-2 text-text-muted text-xs py-6">
      <div className="flex items-center gap-1.5">
        <span>&#x1f512;</span>
        <span>All data stays in your browser. Nothing is uploaded to any server.</span>
      </div>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:text-accent transition-colors"
      >
        <span>&#11088;</span>
        Star us on GitHub
      </a>
    </div>
  );

  // First-run: show onboarding
  if (!hasContacts && !processing) {
    return (
      <div className="min-h-screen">
        {header}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Onboarding onFilesReady={handleFilesReady} processing={processing} />
        </main>
        {footer}
        {showOwnerPrompt && (
          <OwnerNameModal onSubmit={handleOwnerSubmit} onSkip={handleOwnerSkip} />
        )}
        {showSettings && (
          <Settings
            settings={settings}
            onSave={handleSaveSettings}
            dbInfo={{ contactCount: 0, lastUpdated: null, totalImports: 0 }}
            onClearDb={handleClearDb}
            onClose={() => setShowSettings(false)}
            onDataImported={handleDataImported}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {header}

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {showUpload && !processing && (
          <div className="relative">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-0 right-0 text-text-muted hover:text-text text-xs px-3 py-1 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <UploadZone onFilesReady={handleFilesReady} processing={processing} />
          </div>
        )}

        {processing && <ProgressBar progress={progress} />}

        {hasContacts && !showUpload && !processing && (
          <>
            <StatCards stats={stats} lastUpdated={dbMeta.lastUpdated} />

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search name, email, conversation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
              />
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1.5 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-accent"
                />
                <span>To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1.5 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <ExportBar getFilteredContacts={getFilteredContacts} />
            </div>

            <ContactTable
              contacts={contacts}
              search={search}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onClearFilters={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
            />
          </>
        )}

        {footer}
      </main>

      {showOwnerPrompt && (
        <OwnerNameModal onSubmit={handleOwnerSubmit} onSkip={handleOwnerSkip} />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          dbInfo={{
            contactCount: contacts.length,
            lastUpdated: dbMeta.lastUpdated,
            totalImports: dbMeta.totalImports,
          }}
          onClearDb={handleClearDb}
          onClose={() => setShowSettings(false)}
          onDataImported={handleDataImported}
        />
      )}
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
