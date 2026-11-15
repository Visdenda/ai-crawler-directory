import type { CrawlerDirectoryEntry } from "./types.js";

/** Canonical agent tokens for HTTP user agents (robots-token entries excluded). */
export const httpUaAgentsOf = (entries: ReadonlyArray<CrawlerDirectoryEntry>): string[] =>
  entries.filter((entry) => entry.kind === "http-ua").map((entry) => entry.agent);

/** Distinct robots.txt tokens, including `robots-token` entries. */
export const robotsTokensOf = (entries: ReadonlyArray<CrawlerDirectoryEntry>): string[] => {
  const tokens: string[] = [];
  for (const entry of entries) {
    const token = entry.robotsToken || entry.agent;
    if (!tokens.includes(token)) tokens.push(token);
  }
  return tokens;
};

export const crawlerEntryByAgent = (
  agent: string,
  entries: ReadonlyArray<CrawlerDirectoryEntry>,
): CrawlerDirectoryEntry | null => entries.find((entry) => entry.agent === agent) ?? null;

/** Reverse-DNS suffixes for an agent; empty means "not published / not checked". */
export const rdnsSuffixesOf = (
  agent: string,
  entries: ReadonlyArray<CrawlerDirectoryEntry>,
): string[] => crawlerEntryByAgent(agent, entries)?.rdnsSuffixes ?? [];

/** Vendor-published IP range endpoints for an agent. */
export const ipRangeUrlsOf = (
  agent: string,
  entries: ReadonlyArray<CrawlerDirectoryEntry>,
): string[] => crawlerEntryByAgent(agent, entries)?.ipRangeUrls ?? [];

/** Static IP ranges published inline by the vendor. */
export const staticIpRangesOf = (
  agent: string,
  entries: ReadonlyArray<CrawlerDirectoryEntry>,
): string[] => crawlerEntryByAgent(agent, entries)?.staticIpRanges ?? [];
