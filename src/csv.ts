import { CRAWLER_DIRECTORY } from "./directory.js";
import type { CrawlerDirectoryEntry } from "./types.js";

/**
 * CSV encoding: UTF-8 BOM (Excel), CRLF rows (RFC 4180) and quote-prefixing
 * for values that a spreadsheet would evaluate as a formula.
 */
const NEEDS_QUOTES = /[",\n\r]/;
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const csvField = (value: string): string => {
  if (NEEDS_QUOTES.test(value) || FORMULA_PREFIX.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
};

const HEADERS = [
  "slug",
  "provider",
  "agent",
  "kind",
  "category",
  "robots_token",
  "user_agents",
  "rdns_suffixes",
  "signature_agents",
  "ip_range_urls",
  "static_ip_ranges",
  "source_labels",
  "source_urls",
  "description",
  "reviewed_at",
] as const;

/** One row per crawler; multi-value fields are joined with `; `. */
export const toCsv = (
  entries: ReadonlyArray<CrawlerDirectoryEntry> = CRAWLER_DIRECTORY,
): string => {
  const rows = entries.map((entry) => [
    entry.slug,
    entry.provider,
    entry.agent,
    entry.kind,
    entry.category,
    entry.robotsToken,
    entry.userAgents.join("; "),
    entry.rdnsSuffixes.join("; "),
    (entry.signatureAgents ?? []).join("; "),
    entry.ipRangeUrls.join("; "),
    entry.staticIpRanges.join("; "),
    entry.sources.map((source) => source.label).join("; "),
    entry.sources.map((source) => source.href).join("; "),
    entry.description,
    entry.reviewedAt,
  ]);
  const document = [HEADERS, ...rows].map((cells) => cells.map(csvField).join(",")).join("\r\n");
  return `\uFEFF${document}\r\n`;
};
