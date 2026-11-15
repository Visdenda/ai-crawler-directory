export const CRAWLER_DIRECTORY_VERSION = "2026-11";

export const CRAWLER_CATEGORIES = [
  "answer-fetch",
  "ai-search",
  "training",
  "search-engine",
  "ads",
  "unknown",
] as const;
export type CrawlerCategory = (typeof CRAWLER_CATEGORIES)[number];

export const CRAWLER_ENTRY_KINDS = ["http-ua", "robots-token"] as const;
export type CrawlerEntryKind = (typeof CRAWLER_ENTRY_KINDS)[number];

export interface CrawlerDocSource {
  /** Human-readable label for the vendor page. */
  label: string;
  /** Vendor documentation URL (https only). */
  href: string;
}

export interface CrawlerDirectoryEntry {
  /** Stable URL slug: `/crawlers/{slug}` on visdenda.com. */
  slug: string;
  provider: string;
  /** Canonical user-agent token (case-sensitive). */
  agent: string;
  /** `robots-token` entries only appear in robots.txt and never match a UA. */
  kind: CrawlerEntryKind;
  category: CrawlerCategory;
  /** One or two sentences about the provider when the vendor operates several agents. */
  providerSummary?: string;
  /** What triggers the fetch, in plain language. */
  description: string;
  /** Real user-agent substrings documented by the vendor. */
  userAgents: string[];
  /** Token to use in robots.txt (`User-agent:` value). */
  robotsToken: string;
  /** Reverse-DNS suffixes published by the vendor; empty means "not published". */
  rdnsSuffixes: string[];
  /** Vendor endpoints that publish IP ranges (JSON). */
  ipRangeUrls: string[];
  /** Static ranges published inline by the vendor. */
  staticIpRanges: string[];
  /** Vendor documentation backing this entry (at least one). */
  sources: CrawlerDocSource[];
  /** ISO date (YYYY-MM-DD) of the last human review against vendor docs. */
  reviewedAt: string;
}
