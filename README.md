# ai-crawler-directory

An open, versioned directory of **AI crawlers, search bots and training agents** — with the robots.txt token, the documented user agent, reverse-DNS suffixes, IP-range sources and a link to the vendor's own documentation for every entry.

[![npm version](https://img.shields.io/npm/v/@visdenda/ai-crawler-directory)](https://www.npmjs.com/package/@visdenda/ai-crawler-directory)
[![CI](https://github.com/liuliuliu-git/ai-crawler-directory/actions/workflows/ci.yml/badge.svg)](https://github.com/liuliuliu-git/ai-crawler-directory/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-lightgrey.svg)](LICENSE-DATA)

- Browsable directory: **https://visdenda.com/crawlers**
- Machine-readable: **https://visdenda.com/crawlers.json** · **https://visdenda.com/crawlers.csv**

## Install

```sh
npm install @visdenda/ai-crawler-directory
```

The package ships ESM with TypeScript types and has no runtime dependencies.

## Usage

```ts
import {
  CRAWLER_DIRECTORY,
  CRAWLER_DIRECTORY_VERSION,
  crawlerEntryByAgent,
  robotsTokensOf,
  toCsv,
} from "@visdenda/ai-crawler-directory";

console.log(CRAWLER_DIRECTORY_VERSION); // "2026-11"
console.log(CRAWLER_DIRECTORY.length); // number of entries

const gptbot = crawlerEntryByAgent("GPTBot", CRAWLER_DIRECTORY);
// {
//   slug: "openai-gptbot",
//   provider: "OpenAI",
//   category: "training",
//   robotsToken: "GPTBot",
//   userAgents: ["GPTBot"],
//   sources: [{ label: "OpenAI crawler docs", href: "https://developers.openai.com/api/docs/bots" }],
//   reviewedAt: "2026-11-05",
//   ...
// }

// Every token you can put after `User-agent:` in robots.txt:
const tokens = robotsTokensOf(CRAWLER_DIRECTORY);

// Same CSV the website publishes (UTF-8 BOM, CRLF, one row per crawler):
const csv = toCsv();
```

## What is in an entry

| Field             | Meaning                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `slug`            | Stable URL slug; the website page is `/crawlers/{slug}`                                             |
| `provider`        | Company that operates the crawler                                                                   |
| `agent`           | Canonical user-agent token (case-sensitive)                                                         |
| `kind`            | `http-ua` (sends HTTP requests) or `robots-token` (robots.txt only)                                 |
| `category`        | `answer-fetch`, `ai-search`, `training`, `search-engine`, `ads` or `unknown`                        |
| `description`     | What triggers the fetch, in plain language                                                          |
| `userAgents`      | User-agent substrings documented by the vendor                                                      |
| `robotsToken`     | Value to use in a robots.txt `User-agent:` line                                                     |
| `rdnsSuffixes`    | Reverse-DNS suffixes **if the vendor publishes them**; empty means “not published”                  |
| `signatureAgents` | Web Bot Auth `Signature-Agent` origins (https, no path); empty means “no signed identity published” |
| `ipRangeUrls`     | Vendor endpoints that publish IP ranges (JSON)                                                      |
| `staticIpRanges`  | Ranges the vendor lists inline                                                                      |
| `sources`         | Vendor documentation backing the entry (https only)                                                 |
| `reviewedAt`      | Date a human last checked the entry against vendor docs                                             |

## Categories

- **answer-fetch** — fetched when a person asks an AI assistant a question that needs live context (one page per question, not a crawl).
- **ai-search** — indexing crawlers behind AI search results and citations.
- **training** — content collection for future models; blocking changes future training, not today's citations.
- **search-engine** — classic indexers such as Googlebot, kept separate so a busy classic crawl never inflates AI-arrival numbers.
- **ads** — ad quality, landing-page review and policy checks.
- **unknown** — the vendor has not documented enough to classify the agent. A real hit, an undocumented purpose.

## Methodology

1. **A vendor source for every entry.** Each entry links the vendor page that names the crawler. The seed is validated at import time: a missing source, a non-https source, a duplicate slug/agent or a malformed date fails the build.
2. **Network data only when published.** Reverse-DNS suffixes and IP ranges are recorded only when the vendor publishes them. A blank field means “not published”; a hit is then _not checked_, which is not the same as _forged_.
3. **Re-reviewed on a rolling basis.** Every entry carries `reviewedAt`. On the website, entries older than 90 days get a stale badge until they are reviewed again. Nothing is silently dropped.

A matching user agent is not proof of identity — any client can send the string. When a vendor publishes network data, compare the request against it before trusting the hit.

## Data files

The repository commits both exports, regenerated with `npm run build:data`:

- `data/crawlers.json` — version, `generatedAt` (newest review date), count, license and entries.
- `data/crawlers.csv` — one row per crawler; multi-value fields are joined with `; `.

They mirror the public website endpoints. `npm run build:data && git diff --exit-code -- data` is enforced in CI.

## Related: the probe SDK is a separate package

This repository is **data**. Recording these crawlers on your own site is a different job, done by a separate zero-dependency SDK:

- [`@visdenda/agent-watch`](https://www.npmjs.com/package/@visdenda/agent-watch) — server-side crawler probe for Workers, Node, Hono, Next.js and Astro, plus Markdown negotiation.

The two are deliberately separate: the SDK ships **no user-agent list** (matching happens server-side, so a new crawler never requires an SDK upgrade), while this package is the versioned, citable dataset. Installing the probe does not require this package, and consuming the data does not pull in runtime code.

## Contributing

Open an issue or pull request when a vendor publishes a new crawler, changes a token, or documents IP ranges that are missing.

An entry is only accepted with **a link to the vendor's own documentation** (https). We would rather leave a row out than publish an unverifiable suffix or user agent. Update `reviewedAt` on the entry you touch.

```sh
npm install
npm run build && npm test
npm run build:data   # regenerate the committed JSON/CSV
```

## Releasing

Releases are tag-driven and automatic once the version changes:

1. Bump `version` in `package.json` in the same PR that changes `src/` or `data/`.
2. Merge to `main`. CI runs the tests, then a `release` job tags `v<version>` and pushes it.
3. `.github/workflows/publish.yml` builds, tests and publishes to npm with provenance (npm Trusted Publishing / OIDC — no long-lived token).

A tag that already exists is a no-op, so re-pushing `main` publishes nothing. Re-releasing the same version means deleting the tag first. The `release` job also fails when `src/` or `data/` changed without a version bump — otherwise npm would silently keep serving the previous dataset.

One-time setup, already done for this package: on npmjs.com, the package's **Settings → Trusted Publisher** points at this repository and the `publish.yml` workflow.

## License

- **Code** (the TypeScript in `src/`): MIT — see [LICENSE](LICENSE).
- **Data** (the crawler entries and generated JSON/CSV): CC BY 4.0 — see [LICENSE-DATA](LICENSE-DATA). Attribution must name **Visdenda** and link to https://visdenda.com/crawlers.

Vendor documentation links remain the property of their vendors.

## Source

This repository is the public source mirror of `@visdenda/ai-crawler-directory`. The directory is
curated in a private monorepo; changes are mirrored here before a release, and npm publishes from
this repository with provenance.
