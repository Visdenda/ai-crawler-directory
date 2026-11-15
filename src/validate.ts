import {
  CRAWLER_CATEGORIES,
  CRAWLER_ENTRY_KINDS,
  type CrawlerCategory,
  type CrawlerEntryKind,
} from "./types.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

const isStringArray = (value: unknown, maxItems: number, maxLength: number): value is string[] =>
  Array.isArray(value) &&
  value.length <= maxItems &&
  value.every((item) => typeof item === "string" && item.length > 0 && item.length <= maxLength);

const isHttpsUrl = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("https://") && URL.canParse(value);

/**
 * Structural validation for the directory seed. Returns one message per problem
 * (empty array = valid). The published dataset is validated in `directory.ts`
 * at import time, so a bad release fails before it is written.
 */
export const validateDirectory = (entries: ReadonlyArray<unknown>): string[] => {
  const issues: string[] = [];
  const seenSlug = new Set<string>();
  const seenAgent = new Set<string>();

  entries.forEach((entry, index) => {
    if (!isRecord(entry)) {
      issues.push(`entries[${index}]: not an object`);
      return;
    }
    const slug = typeof entry.slug === "string" ? entry.slug : "";
    const at = (what: string): string => `entries[${index}] (${slug || "?"}): ${what}`;

    if (!isNonEmptyString(entry.slug, 96)) issues.push(at("invalid slug"));
    if (!isNonEmptyString(entry.provider, 64)) issues.push(at("invalid provider"));
    if (!isNonEmptyString(entry.agent, 64)) issues.push(at("invalid agent"));
    if (!CRAWLER_ENTRY_KINDS.includes(entry.kind as CrawlerEntryKind)) {
      issues.push(at("invalid kind"));
    }
    if (!CRAWLER_CATEGORIES.includes(entry.category as CrawlerCategory)) {
      issues.push(at("invalid category"));
    }
    if (entry.providerSummary !== undefined && !isNonEmptyString(entry.providerSummary, 400)) {
      issues.push(at("invalid providerSummary"));
    }
    if (!isNonEmptyString(entry.description, 400)) issues.push(at("invalid description"));
    if (!isStringArray(entry.userAgents, 8, 200) || entry.userAgents.length === 0) {
      issues.push(at("userAgents is empty or invalid"));
    }
    if (!isNonEmptyString(entry.robotsToken, 64)) issues.push(at("robotsToken is empty"));
    if (!isStringArray(entry.rdnsSuffixes, 8, 64)) issues.push(at("invalid rdnsSuffixes"));
    if (!isStringArray(entry.staticIpRanges, 32, 64)) issues.push(at("invalid staticIpRanges"));
    if (
      !Array.isArray(entry.ipRangeUrls) ||
      entry.ipRangeUrls.length > 8 ||
      !entry.ipRangeUrls.every(isHttpsUrl)
    ) {
      issues.push(at("invalid ipRangeUrls"));
    }
    if (!Array.isArray(entry.sources) || entry.sources.length === 0 || entry.sources.length > 6) {
      issues.push(at("sources is empty or too long"));
    } else if (
      !entry.sources.every(
        (source) =>
          isRecord(source) && isNonEmptyString(source.label, 120) && isHttpsUrl(source.href),
      )
    ) {
      issues.push(at("source needs a label and an https URL"));
    }
    if (typeof entry.reviewedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedAt)) {
      issues.push(at("invalid reviewedAt"));
    }

    if (typeof entry.slug === "string" && entry.slug.length > 0) {
      if (seenSlug.has(entry.slug)) issues.push(at(`duplicate slug "${entry.slug}"`));
      else seenSlug.add(entry.slug);
    }
    if (typeof entry.agent === "string" && entry.agent.length > 0) {
      if (seenAgent.has(entry.agent)) issues.push(at(`duplicate agent "${entry.agent}"`));
      else seenAgent.add(entry.agent);
    }
  });

  return issues;
};
