# Contributing to Inbox Harvest

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/jordanpeele/inbox-harvest.git
cd inbox-harvest
npm install
npm run dev
```

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Test locally with `npm run dev` and `npm run build`
4. Open a pull request with a clear description of your changes

## Guidelines

- Keep PRs focused — one feature or fix per PR
- Test with the dummy data: `npm run generate-data` then upload `dummy-data/test-export.zip`
- Follow the existing code style (no special linting rules beyond the eslint config)
- This is a client-side app — no server dependencies, no external API calls
- All data processing must stay in the browser

## Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS info

## Feature Requests

Open an issue describing the feature and why it would be useful. Discussion before implementation helps keep things aligned.

## Code of Conduct

Be kind. Be constructive. We're all here to make something useful.
