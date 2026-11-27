import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  CRAWLER_DIRECTORY,
  CRAWLER_DIRECTORY_VERSION,
  CRAWLER_UA_TOKENS,
  crawlerEntryByAgent,
  robotsTokensOf,
  toCsv,
  validateDirectory,
} from "../dist/index.js";

test("the published seed is structurally valid", () => {
  assert.deepEqual(validateDirectory(CRAWLER_DIRECTORY), []);
});

test("entries are unique by slug and agent", () => {
  assert.equal(
    new Set(CRAWLER_DIRECTORY.map((entry) => entry.slug)).size,
    CRAWLER_DIRECTORY.length,
  );
  assert.equal(
    new Set(CRAWLER_DIRECTORY.map((entry) => entry.agent)).size,
    CRAWLER_DIRECTORY.length,
  );
});

test("every entry cites an https vendor source", () => {
  for (const entry of CRAWLER_DIRECTORY) {
    assert.ok(entry.sources.length > 0, entry.agent);
    for (const source of entry.sources) assert.ok(source.href.startsWith("https://"), entry.agent);
  }
});

test("robots-token entries never enter the user-agent matching list", () => {
  const robotsOnly = CRAWLER_DIRECTORY.filter((entry) => entry.kind === "robots-token");
  assert.ok(robotsOnly.length > 0);
  for (const entry of robotsOnly) assert.ok(!CRAWLER_UA_TOKENS.includes(entry.agent), entry.agent);
});

test("lookups and token lists work", () => {
  const gptbot = crawlerEntryByAgent("GPTBot", CRAWLER_DIRECTORY);
  assert.equal(gptbot?.provider, "OpenAI");
  assert.equal(
    new Set(robotsTokensOf(CRAWLER_DIRECTORY)).size,
    robotsTokensOf(CRAWLER_DIRECTORY).length,
  );
});

test("CSV export has a BOM, CRLF rows and one row per entry", () => {
  const csv = toCsv();
  assert.ok(csv.startsWith("\uFEFF"));
  const lines = csv.trimEnd().split("\r\n");
  assert.equal(lines.length, CRAWLER_DIRECTORY.length + 1);
  assert.match(lines[0] ?? "", /slug,provider,agent,kind,category,robots_token/);
});

test("committed data files match the seed", () => {
  const payload = JSON.parse(
    readFileSync(new URL("../data/crawlers.json", import.meta.url), "utf8"),
  );
  assert.equal(payload.version, CRAWLER_DIRECTORY_VERSION);
  assert.equal(payload.count, CRAWLER_DIRECTORY.length);
  assert.equal(payload.license, "CC-BY-4.0");
  assert.deepEqual(
    payload.entries.map((entry) => entry.slug),
    CRAWLER_DIRECTORY.map((entry) => entry.slug),
  );
  const csv = readFileSync(new URL("../data/crawlers.csv", import.meta.url), "utf8");
  assert.equal(csv, toCsv());
});
