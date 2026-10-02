# Playwright QA Automation Framework

A small, real, runnable Playwright + TypeScript framework demonstrating how I design test automation architecture: Page Object Model, data-driven test matrices, hybrid UI/API coverage, and a CI pipeline that publishes a report on every run.

It intentionally targets a public demo application ([saucedemo.com](https://www.saucedemo.com)) and a public REST fixture ([reqres.in](https://reqres.in)) rather than a client's real product — the point of this repo is to show architecture and design decisions in the open, not to claim ownership of someone else's codebase.

[![Playwright Tests](../../actions/workflows/playwright.yml/badge.svg)](../../actions/workflows/playwright.yml)

## Why this exists

Most of my 18+ years has been QA **leadership** — strategy, team-building, and directing automation efforts — while staying hands-on with Selenium, Playwright, and RestAssured. This repo is the hands-on evidence: a framework I designed and built myself, not just reviewed.

## Architecture decisions

**Page Object Model, with assertions kept out of the page objects.** Page objects expose locators and actions (`login()`, `addToCart()`), never `expect()` calls. The same `LoginPage` is reused by both a happy-path test and a negative-credentials test without any branching baked into the object itself — the test decides what "correct" means, the page object just knows how to act.

**Locators are `data-test` attributes first, not CSS classes or text.** Classes and copy change with every redesign; this app's `data-test` attributes are a deliberate, stable test-automation contract. Where no such attribute exists, locators fall back to `role`/`label` (accessibility-tree) selectors rather than brittle CSS paths — see [`InventoryPage.ts`](src/pages/InventoryPage.ts)'s slug-derivation helper for how a product-name-based locator is isolated to one function instead of being repeated across every test.

**Data-driven, not copy-pasted.** [`src/fixtures/users.json`](src/fixtures/users.json) defines a login test matrix — one real account, one locked-out account, one unknown account, one wrong-password case, each with its expected outcome. [`login.spec.ts`](tests/ui/login.spec.ts) loops over that file once. Adding a new role or a new negative case is a one-line JSON addition, not a new test function — the same pattern applies directly to "configurable form with many fields/roles" requirements.

**Custom fixtures remove repeated setup, not just repeated code.** [`authenticatedPage`](src/fixtures/test-options.ts) logs in once per test that needs a post-login starting point, so cart/checkout tests aren't re-testing login as a side effect — login has its own dedicated, isolated test file.

**Assert invariants, not hardcoded numbers, where the underlying data can change.** [`purchase-flow.spec.ts`](tests/ui/purchase-flow.spec.ts) checks `total === itemTotal + tax` instead of a hardcoded dollar figure, so the test keeps working if the catalog price changes — the business rule being verified is the arithmetic, not a specific price.

**API tests are a separate, faster layer — not an afterthought.** [`tests/api/users.api.spec.ts`](tests/api/users.api.spec.ts) exercises a full CRUD lifecycle and a schema check against a REST API directly via `request`, with no browser involved. In CI this means the API suite can fail fast in seconds, before paying for browser installs.

## What prevents this from becoming brittle

- No hardcoded waits anywhere — every action uses Playwright's web-first, auto-retrying assertions (`expect(locator).toHaveText(...)`), which poll until the condition is true or the timeout elapses, instead of sleeping a fixed amount of time.
- Tagged tests (`@smoke`, `@regression`) via Playwright's native `tag` option, so CI (or a pre-release gate) can run `npx playwright test --grep @smoke` for a 30-second confidence check without running the full suite.
- A single config (`playwright.config.ts`) governs retries, trace capture, and reporting — nothing is configured per-test.

## Project structure

```
src/
  pages/        Page Object Model — one class per screen, no assertions
  fixtures/     Custom test fixtures + data-driven JSON test matrices
tests/
  ui/           Browser-driven tests (login, cart, full checkout flow)
  api/          Direct REST API tests, no browser
.github/
  workflows/    CI: install, run, publish HTML + JUnit report as artifacts
```

## Running it

```bash
npm install
npx playwright install chromium   # first time only
npm test                 # full suite
npm run test:smoke       # @smoke only — fast confidence check
npm run test:regression  # @regression only
npm run test:api         # API layer only, no browser
npm run report           # open the last HTML report
```

14 tests, all green, ~20 seconds end to end (API + UI combined).

## CI

Every push/PR runs the full suite on GitHub Actions (`.github/workflows/playwright.yml`) and uploads the HTML report and a JUnit XML as build artifacts — the same shape of output a CI gate in a real pipeline would consume.

## What I'd do next with more scope

- Parallel cross-browser matrix (Firefox, WebKit) — currently Chromium-only to keep the demo fast.
- `storageState` reuse to skip re-logging-in per test once the suite grows past the point where that's worth the added complexity.
- Visual regression on the `problem_user` role, which this demo app deliberately renders with broken images — a natural fit for screenshot-diff testing.

---

Built by Chandra Reddy Tadi — Senior QA Manager, 18+ years in QA leadership, test automation, and QA strategy across E-Commerce, Logistics, Education, and Document Security.
