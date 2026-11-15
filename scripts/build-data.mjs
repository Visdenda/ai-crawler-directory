import { mkdir, writeFile } from "node:fs/promises";

import { CRAWLER_DIRECTORY, CRAWLER_DIRECTORY_VERSION, toCsv } from "../dist/index.js";

const HOME = "https://visdenda.com/crawlers";
const origin = new URL(HOME).origin;
const generatedAt = CRAWLER_DIRECTORY.reduce(
  (latest, entry) => (entry.reviewedAt > latest ? entry.reviewedAt : latest),
  "",
);

const payload = {
  version: CRAWLER_DIRECTORY_VERSION,
  generatedAt,
  count: CRAWLER_DIRECTORY.length,
  license: "CC-BY-4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  homepage: HOME,
  csv: `${origin}/crawlers.csv`,
  entries: CRAWLER_DIRECTORY,
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(new URL("../data/crawlers.json", import.meta.url), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(new URL("../data/crawlers.csv", import.meta.url), toCsv());

console.log(`wrote ${CRAWLER_DIRECTORY.length} entries (version ${CRAWLER_DIRECTORY_VERSION})`);
