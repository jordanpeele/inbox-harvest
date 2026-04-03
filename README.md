# Inbox Harvest

Extract fan emails from your Facebook Messenger exports — no API, no scraping, 100% local.

## The Problem

You're a musician or creator. Your fans DM you their email addresses. You're copy-pasting them one by one. Life is too short.

## The Solution

1. Export your Facebook messages (Settings → Download Your Information → Messages → JSON)
2. Upload the .zip to Inbox Harvest
3. Get a clean, deduplicated CSV of every email your fans sent you

**Your data never leaves your browser.** Everything is processed locally using IndexedDB. No backend, no tracking, no accounts.

## Features

- Drag-and-drop .zip or .json upload
- Web Worker processing (UI stays responsive on large exports)
- Regex email extraction with sender name, timestamp, and message snippet
- Deduplication across conversations (keeps earliest, flags merged)
- Sortable, searchable, paginated dashboard
- Date range filtering
- Persistent local database (IndexedDB)
- Export to CSV, JSON, or copy emails to clipboard
- 100% client-side — zero data transmission
- Mobile responsive

## Getting Started

### Use it now

Visit **[inbox-harvest.vercel.app](https://inbox-harvest.vercel.app)**

### Run locally

```bash
git clone https://github.com/jordanpeele/inbox-harvest.git
cd inbox-harvest
npm install
npm run dev
```

### Build for production

```bash
npm run build
# Output in dist/ — deploy anywhere (Vercel, Netlify, GitHub Pages, etc.)
```

## How Facebook Exports Work

1. Go to [facebook.com/dyi](https://facebook.com/dyi)
2. Click "Download or transfer information"
3. Select your profile
4. Choose "Specific types of information" → check **Messages**
5. Set format to **JSON**
6. Submit and wait for Facebook to process (5-30 minutes)
7. Download the .zip when notified

## Tech Stack

- React + Vite
- Tailwind CSS
- JSZip (client-side zip extraction)
- Papa Parse (CSV generation)
- IndexedDB (local persistence)
- Web Workers (off-main-thread parsing)

## Roadmap

- [ ] Instagram DM export support
- [ ] Twitter/X DM export support
- [ ] Email validation (MX record check)
- [ ] Direct integration with Mailchimp/Beehiiv/ConvertKit
- [ ] Chrome extension for faster exports

## Contributing

PRs welcome! Please open an issue first to discuss what you'd like to change.

## License

MIT
