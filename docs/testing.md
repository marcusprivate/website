# Testing the website

## Setup and commands

Install the pinned dependencies with `npm ci`. If browsers are not yet installed,
run `npx playwright install`. Then use:

| Command | Purpose |
| --- | --- |
| `npm test` | Full functional and Chromium visual regression suite. |
| `npm run test:functional` | Functional checks across desktop and mobile browser projects. |
| `npm run test:typecheck` | Type-check the Playwright test code. |
| `npm run test:visual` | Chromium screenshot comparisons only. |
| `npm run test:update-snapshots` | Intentionally replace screenshot baselines after review. |
| `npm run test:report` | Open the latest HTML report. |

The test runner starts the locally pinned `serve` server. No external service is
contacted in normal tests: analytics is suppressed, the vendored `js-yaml` parser is
served to the page, and SimplyBook is replaced with a controlled widget stand-in.
Tests never submit booking details or verify live availability.

## Reading failures

Failure screenshots, traces, and the HTML report are retained in `test-results/` and
`playwright-report/`; both are ignored by Git. For a functional failure, first match
the failing test to the requirement ID in `requirements.md`, then decide whether the
site behavior regressed or the requirement intentionally changed.

Visual failures compare the current rendering against committed screenshots. Review
the diff at the supported desktop or mobile viewport. Update a baseline only when the
visual change is intentional and the associated requirement has also been reviewed.
Missing baselines are failures in ordinary runs, not automatic approvals.

## Baseline environment

Current snapshots are organized by Playwright platform and Chromium project. Generate
or review a baseline on the operating system where it will be maintained; font and
browser rendering can differ across platforms. The current baseline targets the
repository's local Playwright version and its installed Chromium browser.
