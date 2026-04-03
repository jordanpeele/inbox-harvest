import { useState } from "react";
import UploadZone from "./UploadZone";

const steps = [
  {
    num: "1",
    title: "Export",
    desc: 'Go to facebook.com/dyi \u2192 Download Your Information \u2192 Messages \u2192 JSON format.',
    link: { label: "Open facebook.com/dyi", href: "https://www.facebook.com/dyi" },
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Upload",
    desc: "Drop your .zip export here. Facebook usually takes 5\u201330 minutes to prepare it.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Done",
    desc: "Get a clean, deduplicated list of every email in your DMs.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Onboarding({ onFilesReady, processing }) {
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div className="animate-fade-in flex flex-col items-center gap-8 py-10 px-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Stop copy-pasting emails from your DMs
        </h1>
        <p className="text-text-muted text-sm leading-relaxed max-w-md mx-auto">
          Upload your Facebook Messenger export and we'll find every email your
          fans sent you.
        </p>
      </div>

      {/* Steps */}
      <div className="w-full grid gap-4">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex gap-4 p-4 rounded-xl bg-surface border border-border"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              {step.icon}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm mb-1">{step.title}</p>
              <p className="text-text-muted text-xs leading-relaxed">
                {step.desc}
              </p>
              {step.link && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-accent hover:text-accent-dim transition-colors"
                >
                  {step.link.label}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div className="w-full">
        <UploadZone onFilesReady={onFilesReady} processing={processing} />
      </div>

      {/* How it works accordion */}
      <div className="w-full">
        <button
          onClick={() => setHowOpen(!howOpen)}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${howOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          How it works
        </button>
        {howOpen && (
          <div className="mt-3 rounded-xl bg-surface border border-border p-4 text-xs text-text-muted leading-relaxed space-y-3 animate-fade-in-fast">
            <p>
              Facebook lets you download all your data including messages. This
              tool scans those messages for email addresses, matches them with
              sender names, removes duplicates, and gives you a clean CSV to
              import into Mailchimp, Beehiiv, ConvertKit, or any email platform.
            </p>
            <p>
              Your data never leaves your browser. Everything is processed
              locally.
            </p>
          </div>
        )}
      </div>

      {/* Instagram teaser */}
      <p className="text-text-muted/50 text-[11px]">
        Instagram DM support coming soon
      </p>

      {/* Footer */}
      <p className="text-text-muted text-xs text-center">
        Built for musicians, creators, and anyone whose fans DM them email
        addresses.
      </p>
    </div>
  );
}
