import { useState } from "react";
import UploadZone from "./UploadZone";

const steps = [
  {
    title: "Export",
    desc: 'Go to facebook.com/dyi \u2192 Download Your Information \u2192 Messages \u2192 JSON format.',
    link: { label: "Open facebook.com/dyi", href: "https://www.facebook.com/dyi" },
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    title: "Upload",
    desc: "Drop your .zip export here. Facebook usually takes 5\u201330 minutes to prepare it.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      </svg>
    ),
  },
  {
    title: "Done",
    desc: "Get a clean, deduplicated list of every email in your DMs.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 011.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C8.034 4.01 7.11 4.97 7.11 6.14v7.61c0 1.17.924 2.13 2.116 2.224.474.038.95.07 1.424.095m5.8-10.233c.376.023.75.05 1.124.08 1.193.094 2.116 1.054 2.116 2.224v4.286m-8.864 4.286A51 51 0 0112 18.001c1.168-.034 2.328-.1 3.476-.198m-6.952 0c-1.192-.094-2.116-1.054-2.116-2.224v-.462m8.868.23a2.25 2.25 0 01-.482 1.393l-1.568 1.982a1.5 1.5 0 01-2.352 0l-1.568-1.982a2.25 2.25 0 01-.482-1.393" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75l1.5 1.5 3-3" />
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

      {/* 3-column step icons */}
      <div className="w-full grid grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
              {step.icon}
            </div>
            <div>
              <p className="font-medium text-sm mb-1">{step.title}</p>
              <p className="text-text-muted text-[11px] leading-relaxed">
                {step.desc}
              </p>
              {step.link && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-accent hover:text-accent-dim transition-colors"
                >
                  {step.link.label}
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
